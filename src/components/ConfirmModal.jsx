import "./ConfirmModal.css";

function ConfirmModal({ open, title, message, details, confirmText = "Confirmar", cancelText = "Cancelar", type = "info", busy = false, onConfirm, onCancel }) {
  if (!open) return null;
  return (
    <div className="modal-backdrop" role="presentation" onMouseDown={(event) => event.target === event.currentTarget && !busy && onCancel()}>
      <section className={`confirm-modal confirm-modal--${type}`} role="alertdialog" aria-modal="true" aria-labelledby="confirm-title">
        <h2 id="confirm-title">{title}</h2>
        <p>{message}</p>
        {details && <div className="confirm-details">{details}</div>}
        <div className="confirm-actions">
          <button type="button" className="button-secondary" onClick={onCancel} disabled={busy}>{cancelText}</button>
          <button type="button" className={`button-primary button-${type}`} onClick={onConfirm} disabled={busy}>{busy ? "Procesando..." : confirmText}</button>
        </div>
      </section>
    </div>
  );
}
export default ConfirmModal;
