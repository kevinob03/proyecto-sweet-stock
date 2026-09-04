import { useEffect, useRef, useState } from "react";
import { useAuth } from "../context/AuthContext";
import { getProductos } from "../services/productoService";
import { createPedido } from "../services/pedidoService";
import { sendChatMessage } from "../services/chatbotService";
import ConfirmModal from "./ConfirmModal";
import "./ChatBot.css";

const money = (value) => new Intl.NumberFormat("es-CR", { style: "currency", currency: "CRC" }).format(value);
function ChatBot() {
  const { usuario } = useAuth();
  const [open,setOpen]=useState(false),[input,setInput]=useState(""),[typing,setTyping]=useState(false),[error,setError]=useState("");
  const [messages,setMessages]=useState([{role:"assistant",text:"Hola. Puedo ayudarte con productos, pedidos, horarios e información de Sweet Stock."}]);
  const [products,setProducts]=useState([]),[draft,setDraft]=useState(null),[confirm,setConfirm]=useState(false),[busy,setBusy]=useState(false);
  const bottom=useRef(null);
  useEffect(()=>{if(usuario?.rol==="user")getProductos().then(setProducts).catch(()=>{});},[usuario]);
  useEffect(()=>bottom.current?.scrollIntoView({behavior:"smooth"}),[messages,typing,open]);
  if(usuario?.rol!=="user")return null;
  const detectDraft=(text)=>{const product=products.find((p)=>text.toLowerCase().includes(p.nombre.toLowerCase())||text.toLowerCase().includes(p.nombre.split(" ").at(-1).toLowerCase()));if(!product||product.stock<1)return null;const quantity=Math.min(product.stock,Math.max(1,Number(text.match(/\b(\d+)\b/)?.[1]||1)));return{product,cantidad:quantity};};
  const send=async(e)=>{e.preventDefault();const message=input.trim().slice(0,500);if(!message||typing)return;const next=[...messages,{role:"user",text:message}].slice(-10);setMessages(next);setInput("");setTyping(true);setError("");try{const candidate=detectDraft(message);const result=await sendChatMessage(message,messages.slice(-9).map((m)=>({role:m.role==="assistant"?"model":"user",parts:[{text:m.text}]})));setMessages((v)=>[...v,{role:"assistant",text:result.reply}].slice(-10));if(candidate)setDraft(candidate);}catch{setError("No pude conectarme con el asistente. Inténtalo de nuevo.");}finally{setTyping(false);}};
  const placeOrder=async()=>{setBusy(true);try{await createPedido({usuarioId:usuario.id,cliente:usuario.nombre,estado:"Por tomar",productos:[{productoId:draft.product.id,cantidad:draft.cantidad}]});setMessages((v)=>[...v,{role:"assistant",text:"Tu pedido fue creado correctamente. Puedes consultarlo en Pedidos."}].slice(-10));setDraft(null);setConfirm(false);}catch{setError("No se pudo crear el pedido.");setConfirm(false);}finally{setBusy(false);}};
  return <><button className="chat-launcher" aria-label="Abrir asistente" onClick={()=>setOpen(!open)}>Asistente</button>{open&&<section className="chat-widget" aria-label="Asistente de Sweet Stock"><header><div><strong>Asistente Sweet Stock</strong><span>{typing?"Escribiendo...":"En línea"}</span></div><button aria-label="Cerrar" onClick={()=>setOpen(false)}>×</button></header><div className="chat-messages">{messages.map((m,i)=><p key={i} className={`chat-message ${m.role}`}>{m.text}</p>)}{typing&&<p className="chat-message assistant">Escribiendo...</p>}{error&&<p className="chat-error">{error}</p>}{draft&&<div className="chat-draft"><strong>Pedido preparado</strong><span>{draft.cantidad} × {draft.product.nombre}</span><span>Total: {money(draft.cantidad*draft.product.precio)}</span><button onClick={()=>setConfirm(true)}>Revisar y confirmar</button></div>}<div ref={bottom}/></div><form onSubmit={send}><input aria-label="Mensaje" maxLength="500" value={input} onChange={(e)=>setInput(e.target.value)} placeholder="Escribe tu consulta..."/><button disabled={typing||!input.trim()}>Enviar</button></form><small>{input.length}/500</small></section>}<ConfirmModal open={confirm} title="¿Deseas confirmar este pedido?" message="El pedido solo se enviará después de confirmar." details={draft&&`${draft.cantidad} × ${draft.product.nombre}\nTotal: ${money(draft.cantidad*draft.product.precio)}`} confirmText="Confirmar pedido" type="success" busy={busy} onCancel={()=>setConfirm(false)} onConfirm={placeOrder}/></>;
}
export default ChatBot;
