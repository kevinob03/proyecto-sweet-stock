import { useEffect, useRef, useState } from "react";
import * as maplibregl from "maplibre-gl";
import "maplibre-gl/dist/maplibre-gl.css";
import { getPedidoById } from "../services/pedidoService";
import { updatePedido } from "../services/pedidoService";
import { useAuth } from "../context/AuthContext";
import "./OrderTracking.css";
import "./OrderTrackingExtras.css";

const STEPS = [
  { status: "Por tomar", label: "Pedido recibido" },
  { status: "En preparación", label: "En preparación" },
  { status: "En tránsito", label: "En camino" },
  { status: "Despachado", label: "Entregado" },
];
const DEFAULT_CENTER = [-84.0907, 9.9281];
const coords = (point) => Array.isArray(point) ? point : point?.lat != null && point?.lng != null ? [Number(point.lng), Number(point.lat)] : null;
const routeFeature = (coordinates) => ({ type: "Feature", properties: {}, geometry: { type: "LineString", coordinates } });

function OrderTracking({ order: initialOrder, onClose }) {
  const { usuario } = useAuth();
  const [order, setOrder] = useState(initialOrder), [error, setError] = useState("");
  const [sharing, setSharing] = useState(false);
  const mapNode = useRef(null), mapRef = useRef(null), loadedRef = useRef(false), markersRef = useRef({});
  const watchRef = useRef(null), lastSentRef = useRef(0), orderRef = useRef(order);
  useEffect(() => { orderRef.current = order; }, [order]);
  const tracking = order.tracking;
  const origin = coords(tracking?.origen), destination = coords(tracking?.destino), current = coords(tracking?.ubicacionActual);
  const suppliedRoute = tracking?.ruta?.map(coords).filter(Boolean) || [];
  const route = suppliedRoute.length > 1 ? suppliedRoute : origin && destination && current ? [origin, current, destination] : [];
  const hasLocation = Boolean(origin && destination && current);
  const currentStep = STEPS.findIndex((step) => step.status === order.estado);
  const express = tracking?.express;

  useEffect(() => {
    const timer = setInterval(() => getPedidoById(initialOrder.id).then(setOrder).catch(() => setError("No se pudo actualizar el seguimiento.")), 15000);
    return () => clearInterval(timer);
  }, [initialOrder.id]);

  useEffect(() => () => { if (watchRef.current != null) navigator.geolocation.clearWatch(watchRef.current); }, []);

  const toggleSharing = () => {
    if (watchRef.current != null) { navigator.geolocation.clearWatch(watchRef.current); watchRef.current = null; setSharing(false); return; }
    if (!navigator.geolocation) { setError("Este navegador no admite geolocalización."); return; }
    setError("");
    watchRef.current = navigator.geolocation.watchPosition(
      ({ coords: deviceCoords }) => {
        if (Date.now() - lastSentRef.current < 5000) return;
        lastSentRef.current = Date.now();
        const currentOrder = orderRef.current;
        const updatedTracking = { ...(currentOrder.tracking || {}), ubicacionActual: { lat: Number(deviceCoords.latitude.toFixed(6)), lng: Number(deviceCoords.longitude.toFixed(6)), nombre: "Ubicación en vivo del dispositivo", precision: Math.round(deviceCoords.accuracy), actualizadaEn: new Date().toISOString() } };
        const updatedOrder = { ...currentOrder, tracking: updatedTracking };
        orderRef.current = updatedOrder; setOrder(updatedOrder);
        updatePedido(currentOrder.id, { tracking: updatedTracking }).catch(() => setError("No se pudo compartir la ubicación con el cliente."));
        setSharing(true);
      },
      (reason) => { setError(reason.code === 1 ? "Debes permitir el acceso a tu ubicación para iniciar la transmisión." : "No fue posible obtener la ubicación del dispositivo."); setSharing(false); },
      { enableHighAccuracy: true, timeout: 15000, maximumAge: 3000 },
    );
  };

  useEffect(() => {
    if (!mapNode.current) return;
    const initialCurrent = coords(initialOrder.tracking?.ubicacionActual);
    const map = new maplibregl.Map({ container: mapNode.current, style: "https://tiles.openfreemap.org/styles/bright", center: initialCurrent || DEFAULT_CENTER, zoom: initialCurrent ? 16 : 8, pitch: 50, bearing: -20, canvasContextAttributes: { antialias: true } });
    mapRef.current = map;
    map.addControl(new maplibregl.NavigationControl({ visualizePitch: true }), "top-right");
    map.on("load", () => {
      loadedRef.current = true;
      const label = map.getStyle().layers.find((layer) => layer.type === "symbol" && layer.layout?.["text-field"])?.id;
      map.addSource("open-buildings", { url: "https://tiles.openfreemap.org/planet", type: "vector" });
      map.addLayer({ id: "buildings-3d", source: "open-buildings", "source-layer": "building", type: "fill-extrusion", minzoom: 15, filter: ["!=", ["get", "hide_3d"], true], paint: { "fill-extrusion-color": "#d9c5bb", "fill-extrusion-height": ["interpolate", ["linear"], ["zoom"], 15, 0, 16, ["coalesce", ["get", "render_height"], 8]], "fill-extrusion-base": ["coalesce", ["get", "render_min_height"], 0], "fill-extrusion-opacity": .72 } }, label);
      map.addSource("pedido-route", { type: "geojson", data: routeFeature([]) });
      map.addLayer({ id: "pedido-route-line", type: "line", source: "pedido-route", layout: { "line-cap": "round", "line-join": "round" }, paint: { "line-color": "#b9684e", "line-width": 6 } });
      setOrder((value) => ({ ...value }));
    });
    map.on("error", () => setError("No se pudieron cargar temporalmente los datos del mapa."));
    return () => { Object.values(markersRef.current).forEach((marker) => marker.remove()); markersRef.current = {}; loadedRef.current = false; map.remove(); mapRef.current = null; };
  }, [initialOrder.id]);

  useEffect(() => {
    const map = mapRef.current;
    if (!map || !loadedRef.current) return;
    const points = { origin, destination, current };
    const colors = { origin: "#477a56", destination: "#5a3e36", current: "#d48c29" };
    const labels = { origin: "Sweet Stock", destination: "Dirección de entrega", current: "Ubicación actual del express" };
    Object.entries(points).forEach(([key, point]) => {
      if (!point) { markersRef.current[key]?.remove(); delete markersRef.current[key]; return; }
      if (!markersRef.current[key]) markersRef.current[key] = new maplibregl.Marker({ color: colors[key], scale: key === "current" ? 1.2 : 1 }).setLngLat(point).setPopup(new maplibregl.Popup().setText(labels[key])).addTo(map);
      else markersRef.current[key].setLngLat(point);
    });
    map.getSource("pedido-route")?.setData(routeFeature(route));
    if (route.length) {
      const bounds = route.reduce((value, point) => value.extend(point), new maplibregl.LngLatBounds(route[0], route[0]));
      map.fitBounds(bounds, { padding: 70, maxZoom: 17, pitch: 55, bearing: Number(tracking?.heading || -20), duration: 1000 });
    }
  }, [order, origin, destination, current, route, tracking?.heading]);

  return <div className="modal-backdrop"><section className="tracking-modal" role="dialog" aria-modal="true">
    <header><div><h2>Seguimiento del pedido #{order.id}</h2><p>Mapa 3D abierto · actualización cada 15 segundos.</p>{usuario?.rol==="admin"&&<button className={`location-share ${sharing?"active":""}`} onClick={toggleSharing}>{sharing?"Detener ubicación en vivo":"Compartir mi ubicación actual"}</button>}</div><button onClick={onClose} aria-label="Cerrar">×</button></header>
    <div className="express-card"><div><span>Estado del express</span><strong>{order.estado}</strong></div><div><span>Conductor</span><strong>{express?.nombre || "Pendiente de asignar"}</strong></div><div><span>Placa</span><strong>{express?.placa || "—"}</strong></div><div><span>Vehículo</span><strong>{express?.vehiculo || "—"}</strong></div><div><span>Marca</span><strong>{express?.marca || "—"}</strong></div><div><span>Calificación</span><strong>{express?.calificacion != null ? `${express.calificacion} / 5` : "Sin calificación"}</strong></div></div>
    <div className="tracking-layout"><aside className="tracking-timeline">{STEPS.map((step,index) => <div className={`timeline-step ${index <= currentStep ? "done" : ""} ${index === currentStep ? "current" : ""}`} key={step.status}><span>{index+1}</span><div><strong>{step.label}</strong><small>{step.status}</small></div></div>)}</aside><div className="tracking-map-area"><div className="tracking-map" ref={mapNode}/>{!hasLocation && <div className="tracking-location-notice"><strong>Esperando ubicación del express</strong><p>Configura origen y destino; luego activa “Compartir mi ubicación actual” para mostrar el recorrido en ambos roles.</p></div>}{hasLocation && !tracking?.ruta?.length && <span className="route-note">Ruta aproximada según los puntos informados</span>}{error && <p className="tracking-error" role="alert">{error}</p>}</div></div>
  </section></div>;
}
export default OrderTracking;
