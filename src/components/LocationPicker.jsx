import { useEffect, useRef, useState } from "react";
import * as maplibregl from "maplibre-gl";
import "maplibre-gl/dist/maplibre-gl.css";
import "./LocationPicker.css";
import "./LocationPickerExtras.css";

const DEFAULT_CENTER = [-84.0907, 9.9281];
const COLORS = { origen: "#477a56", destino: "#5a3e36" };
const LABELS = { origen: "Origen", destino: "Destino" };
const pointArray = (point) => point?.lat !== "" && point?.lng !== "" && point?.lat != null && point?.lng != null ? [Number(point.lng), Number(point.lat)] : null;

function LocationPicker({ value, onChange }) {
  const [target, setTarget] = useState("origen"), [query, setQuery] = useState(""), [results, setResults] = useState([]);
  const [searching, setSearching] = useState(false), [locating, setLocating] = useState(false), [error, setError] = useState("");
  const node = useRef(null), mapRef = useRef(null), markers = useRef({}), valueRef = useRef(value);
  valueRef.current = value;

  const setPoint = (group, lngLat, placeName = "Punto seleccionado en el mapa") => {
    onChange({ ...valueRef.current, [group]: { lat: Number(lngLat.lat.toFixed(6)), lng: Number(lngLat.lng.toFixed(6)), nombre: placeName } });
  };

  useEffect(() => {
    const existing = pointArray(value[target]);
    const map = new maplibregl.Map({ container: node.current, style: "https://tiles.openfreemap.org/styles/bright", center: existing || DEFAULT_CENTER, zoom: existing ? 15 : 8, pitch: 35 });
    mapRef.current = map;
    map.addControl(new maplibregl.NavigationControl(), "top-right");
    map.on("click", (event) => setPoint(target, event.lngLat));
    return () => { Object.values(markers.current).forEach((marker) => marker.remove()); markers.current = {}; map.remove(); mapRef.current = null; };
  }, [target]);

  useEffect(() => {
    if (!mapRef.current) return;
    Object.entries(LABELS).forEach(([group, label]) => {
      const point = pointArray(value[group]);
      if (!point) { markers.current[group]?.remove(); delete markers.current[group]; return; }
      if (!markers.current[group]) {
        const marker = new maplibregl.Marker({ color: COLORS[group], draggable: group === target }).setLngLat(point).setPopup(new maplibregl.Popup().setText(label)).addTo(mapRef.current);
        marker.on("dragend", () => setPoint(group, marker.getLngLat(), value[group]?.nombre));
        markers.current[group] = marker;
      } else markers.current[group].setLngLat(point);
    });
  }, [value, target]);

  const search = async () => {
    if (!query.trim() || searching) return;
    setSearching(true); setError(""); setResults([]);
    try {
      const response = await fetch(`https://nominatim.openstreetmap.org/search?format=jsonv2&limit=5&accept-language=es&q=${encodeURIComponent(query.trim())}`);
      if (!response.ok) throw new Error(); setResults(await response.json());
    } catch { setError("No se pudo buscar el lugar. También puedes seleccionarlo directamente en el mapa."); }
    finally { setSearching(false); }
  };
  const choose = (place) => {
    const lngLat = { lng: Number(place.lon), lat: Number(place.lat) }; setPoint(target, lngLat, place.display_name);
    mapRef.current?.flyTo({ center: [lngLat.lng, lngLat.lat], zoom: 16 }); setResults([]); setQuery(place.display_name);
  };

  const useCurrentLocation = () => {
    if (!navigator.geolocation) { setError("Este navegador no admite geolocalización."); return; }
    setLocating(true); setError("");
    navigator.geolocation.getCurrentPosition(
      ({ coords: currentCoords }) => {
        const point = { lng: currentCoords.longitude, lat: currentCoords.latitude };
        setPoint(target, point, `Mi ubicación actual como ${LABELS[target].toLowerCase()}`);
        mapRef.current?.flyTo({ center: [point.lng, point.lat], zoom: 17 }); setLocating(false);
      },
      (reason) => { setError(reason.code === 1 ? "Debes permitir el acceso a tu ubicación en el navegador." : "No fue posible obtener tu ubicación actual."); setLocating(false); },
      { enableHighAccuracy: true, timeout: 12000, maximumAge: 5000 },
    );
  };

  return <section className="location-picker"><div className="location-targets">{Object.entries(LABELS).map(([key,label])=><button type="button" className={target===key?"active":""} onClick={()=>setTarget(key)} key={key}><span style={{background:COLORS[key]}}/>{label}{pointArray(value[key])?" ✓":""}</button>)}<button type="button" className="current-location-button" onClick={useCurrentLocation} disabled={locating}>{locating?"Obteniendo ubicación...":`Usar mi ubicación como ${LABELS[target].toLowerCase()}`}</button></div><div className="place-search"><input value={query} onChange={(event)=>setQuery(event.target.value)} onKeyDown={(event)=>{if(event.key==="Enter"){event.preventDefault();search();}}} placeholder={`Buscar ${LABELS[target].toLowerCase()} por nombre...`} maxLength="160"/><button type="button" onClick={search} disabled={searching}>{searching?"Buscando...":"Buscar lugar"}</button></div>{results.length>0&&<ul className="place-results">{results.map((place)=><li key={place.place_id}><button type="button" onClick={()=>choose(place)}>{place.display_name}</button></li>)}</ul>}{error&&<p className="location-error">{error}</p>}<p className="location-tip">Seleccionando: <strong>{LABELS[target]}</strong>. Busca un lugar, haz clic en el mapa o usa la ubicación del dispositivo para este punto.</p><div className="location-map" ref={node}/><div className="selected-places">{Object.entries(LABELS).map(([key,label])=><p key={key}><strong>{label}:</strong> {value[key]?.nombre||"Sin seleccionar"}</p>)}</div><small>Geocodificación © OpenStreetMap contributors, mediante Nominatim. Las búsquedas se realizan únicamente al pulsar “Buscar lugar”.</small></section>;
}
export default LocationPicker;
