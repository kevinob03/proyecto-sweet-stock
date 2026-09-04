import { useEffect, useState } from "react";
import { getBusinessInfo } from "../services/pedidoService";
import "./OrderInvoice.css";

const money = (value) => new Intl.NumberFormat("es-CR", { style: "currency", currency: "CRC" }).format(value || 0);
const fallback = (value) => value || "No configurado";
function OrderInvoice({ order, onClose }) {
  const [business,setBusiness]=useState(null),[error,setError]=useState("");
  useEffect(()=>{getBusinessInfo().then(setBusiness).catch(()=>setError("No se pudieron cargar los datos del negocio."));},[]);
  return <div className="modal-backdrop invoice-backdrop"><section className="invoice-modal" role="dialog" aria-modal="true" aria-label={`Factura del pedido ${order.id}`}>
    <div className="invoice-toolbar"><button className="button-secondary" onClick={onClose}>Cerrar</button><button className="button-primary" onClick={()=>window.print()}>Imprimir / Guardar PDF</button></div>
    <article className="invoice-sheet"><header><div><span>FACTURA</span><h2>{business?.nombre||"Sweet Stock"}</h2><p>{fallback(business?.direccion)}</p><p>Contacto: {fallback(business?.contacto)}</p><p>Identificación fiscal: {fallback(business?.identificacionFiscal)}</p></div><div className="invoice-number"><strong>Pedido #{order.id}</strong><span>{new Date(order.fecha).toLocaleString("es-CR")}</span></div></header>
      {error&&<p className="invoice-error">{error}</p>}
      <section className="invoice-client"><h3>Cliente</h3><p><strong>{order.cliente}</strong></p><p>Entrega: {fallback(order.direccionEntrega)}</p><p>Contacto: {fallback(order.contacto)}</p></section>
      <div className="invoice-table-wrap"><table><thead><tr><th>Descripción</th><th>Cantidad</th><th>Precio unitario</th><th>Subtotal</th></tr></thead><tbody>{order.productos.map((item)=><tr key={`${item.productoId}-${item.nombre}`}><td>{item.nombre}</td><td>{item.cantidad}</td><td>{money(item.precio)}</td><td>{money(item.subtotal)}</td></tr>)}</tbody></table></div>
      <section className="invoice-totals"><p><span>Subtotal</span><strong>{money(order.subtotal??order.productos.reduce((sum,item)=>sum+item.subtotal,0))}</strong></p><p><span>Impuestos</span><strong>{money(order.impuestos)}</strong></p><p><span>Descuento</span><strong>− {money(order.descuento)}</strong></p><p className="invoice-grand"><span>Total</span><strong>{money(order.total)}</strong></p></section>
      <footer><div><span>Método de pago</span><strong>{fallback(order.metodoPago)}</strong></div><div><span>Estado del pago</span><strong>{fallback(order.estadoPago)}</strong></div></footer>
    </article>
  </section></div>;
}
export default OrderInvoice;
