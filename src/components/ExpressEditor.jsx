import { useState } from "react";
import { updatePedido } from "../services/pedidoService";
import ConfirmModal from "./ConfirmModal";
import LocationPicker from "./LocationPicker";
import "./ExpressEditor.css";
import "./ExpressEditorValidation.css";

const blankPoint = { lat: "", lng: "", nombre: "" };
const fieldLabels = { nombre: "nombre del conductor", placa: "número de placa", vehiculo: "vehículo", marca: "marca", calificacion: "calificación" };
const locationLabels = { origen: "origen", destino: "destino" };
const hasCoordinates = (point) => point && Number.isFinite(Number(point.lat)) && Number.isFinite(Number(point.lng)) && point.lat !== "" && point.lng !== "";

function ExpressEditor({ order, onClose, onSaved }) {
  const existing = order.tracking || {};
  const [data, setData] = useState({
    express: { nombre: "", placa: "", vehiculo: "", marca: "", calificacion: "", ...existing.express },
    origen: existing.origen || blankPoint,
    destino: existing.destino || blankPoint,
    ubicacionActual: existing.ubicacionActual || blankPoint,
    ruta: existing.ruta || [],
  });
  const [errors, setErrors] = useState({}), [confirm, setConfirm] = useState(false);
  const [busy, setBusy] = useState(false), [requestError, setRequestError] = useState("");

  const updateExpress = (key, value) => {
    setData((current) => ({ ...current, express: { ...current.express, [key]: value } }));
    setErrors((current) => ({ ...current, [key]: "" }));
  };

  const validate = () => {
    const nextErrors = {};
    Object.entries(fieldLabels).forEach(([key, label]) => {
      if (String(data.express[key] ?? "").trim() === "") nextErrors[key] = `El ${label} es obligatorio.`;
    });
    const rating = Number(data.express.calificacion);
    if (data.express.calificacion !== "" && (!Number.isFinite(rating) || rating < 0 || rating > 5)) nextErrors.calificacion = "La calificación debe estar entre 0 y 5.";
    Object.entries(locationLabels).forEach(([key, label]) => {
      if (!hasCoordinates(data[key])) nextErrors[key] = `Debes seleccionar el ${label} en el mapa o mediante la búsqueda.`;
    });
    setErrors(nextErrors);
    return Object.keys(nextErrors).length === 0;
  };

  const requestConfirmation = (event) => {
    event.preventDefault(); setRequestError("");
    if (validate()) setConfirm(true);
  };

  const save = async () => {
    if (!validate()) { setConfirm(false); return; }
    setBusy(true); setRequestError("");
    try {
      await updatePedido(order.id, { tracking: { ...data, express: { ...data.express, calificacion: Number(data.express.calificacion) } } });
      onSaved(); onClose();
    } catch (reason) {
      setRequestError(reason.message || "No se pudo guardar la información del express."); setConfirm(false);
    } finally { setBusy(false); }
  };

  return <>
    <div className="modal-backdrop"><section className="express-editor" role="dialog" aria-modal="true">
      <h2>Express del pedido #{order.id}</h2>
      {requestError && <p className="orders-error" role="alert">{requestError}</p>}
      <form noValidate onSubmit={requestConfirmation}>
        <div className="express-fields">
          {[["nombre","Nombre del conductor"],["placa","Número de placa"],["vehiculo","Nombre del vehículo"],["marca","Marca del vehículo"]].map(([key,label]) => <label key={key}>{label}<input aria-invalid={Boolean(errors[key])} value={data.express[key]} onChange={(event) => updateExpress(key,event.target.value)} maxLength="80"/>{errors[key] && <span className="field-error">{errors[key]}</span>}</label>)}
          <label>Calificación<input aria-invalid={Boolean(errors.calificacion)} type="number" min="0" max="5" step="0.1" value={data.express.calificacion} onChange={(event) => updateExpress("calificacion",event.target.value)}/>{errors.calificacion && <span className="field-error">{errors.calificacion}</span>}</label>
        </div>
        <h3>Ubicaciones del recorrido</h3>
        <LocationPicker value={data} onChange={(value) => { setData(value); setErrors((current) => ({ ...current, origen: "", destino: "", ubicacionActual: "" })); }}/>
        <div className="location-validation" role="alert">{Object.keys(locationLabels).map((key) => errors[key] && <p key={key}>{errors[key]}</p>)}</div>
        <p className="express-help">Origen y destino son obligatorios. Selecciona uno de los dos antes de usar la ubicación del dispositivo. La posición en tránsito se activa posteriormente desde Seguimiento.</p>
        <div className="confirm-actions"><button type="button" className="button-secondary" onClick={onClose} disabled={busy}>Cancelar</button><button type="submit" className="button-primary" disabled={busy}>{busy ? "Guardando..." : "Guardar express"}</button></div>
      </form>
    </section></div>
    <ConfirmModal open={confirm} title="¿Deseas guardar los datos del express?" message="La información y ubicación serán visibles para el administrador y el cliente." confirmText="Guardar" busy={busy} onCancel={() => setConfirm(false)} onConfirm={save}/>
  </>;
}
export default ExpressEditor;
