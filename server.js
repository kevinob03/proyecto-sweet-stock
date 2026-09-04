import { createServer } from "node:http";
import { readFile, writeFile } from "node:fs/promises";
import { createHmac, timingSafeEqual } from "node:crypto";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";
import { loadEnvFile } from "node:process";

try { loadEnvFile(join(dirname(fileURLToPath(import.meta.url)), ".env")); } catch { /* .env es opcional */ }

const dbPath = join(dirname(fileURLToPath(import.meta.url)), "db.json");
const port = Number(process.env.PORT || 3001);
const secret = process.env.AUTH_SECRET || "sweet-stock-local-development-secret";
const statuses = ["Por tomar", "En preparación", "En tránsito", "Despachado"];
const readDb = async () => JSON.parse(await readFile(dbPath, "utf8"));
const writeDb = async (db) => writeFile(dbPath, `${JSON.stringify(db, null, 2)}\n`);
const send = (res, status, data) => {
  res.writeHead(status, { "Content-Type": "application/json; charset=utf-8" });
  res.end(data === undefined ? "" : JSON.stringify(data));
};
const readBody = async (req) => {
  let raw = "";
  for await (const chunk of req) {
    raw += chunk;
    if (raw.length > 20_000) throw new Error("BAD_INPUT");
  }
  return raw ? JSON.parse(raw) : {};
};
const sign = (value) => createHmac("sha256", secret).update(value).digest("base64url");
const tokenFor = (user) => {
  const payload = Buffer.from(JSON.stringify({ id: user.id, rol: user.rol, exp: Date.now() + 28_800_000 })).toString("base64url");
  return `${payload}.${sign(payload)}`;
};
const authenticate = (req) => {
  const [payload, signature] = (req.headers.authorization?.replace(/^Bearer\s+/i, "") || "").split(".");
  if (!payload || !signature) return null;
  const expected = sign(payload);
  if (signature.length !== expected.length || !timingSafeEqual(Buffer.from(signature), Buffer.from(expected))) return null;
  try {
    const user = JSON.parse(Buffer.from(payload, "base64url").toString());
    return user.exp > Date.now() ? user : null;
  } catch { return null; }
};
const normalizeStatus = (value) => ({ Pendiente: "Por tomar", Nuevo: "Por tomar", "En preparacion": "En preparación", "En transito": "En tránsito", Despachados: "Despachado" }[value] || value);
const cleanOrder = (data, db, previous = {}) => {
  const productos = Array.isArray(data.productos) ? data.productos.map((item) => {
    const product = db.productos.find((entry) => String(entry.id) === String(item.productoId));
    if (!product) throw new Error("BAD_INPUT");
    const cantidad = Math.max(1, Number(item.cantidad) || 1);
    return { productoId: product.id, nombre: product.nombre, cantidad, precio: product.precio, subtotal: Number((cantidad * product.precio).toFixed(2)) };
  }) : previous.productos || [];
  const estado = normalizeStatus(data.estado ?? previous.estado ?? statuses[0]);
  if (!statuses.includes(estado)) throw new Error("BAD_INPUT");
  return { ...previous, usuarioId: Number(data.usuarioId ?? previous.usuarioId), cliente: String(data.cliente ?? previous.cliente ?? "").trim(), direccionEntrega: String(data.direccionEntrega ?? previous.direccionEntrega ?? "").trim(), contacto: String(data.contacto ?? previous.contacto ?? "").trim(), metodoPago: String(data.metodoPago ?? previous.metodoPago ?? "Pendiente").trim(), estadoPago: String(data.estadoPago ?? previous.estadoPago ?? "Pendiente").trim(), productos, subtotal: Number(productos.reduce((sum, item) => sum + item.subtotal, 0).toFixed(2)), impuestos: Number(data.impuestos ?? previous.impuestos ?? 0), descuento: Number(data.descuento ?? previous.descuento ?? 0), total: Number((productos.reduce((sum, item) => sum + item.subtotal, 0) + Number(data.impuestos ?? previous.impuestos ?? 0) - Number(data.descuento ?? previous.descuento ?? 0)).toFixed(2)), estado, fecha: previous.fecha || data.fecha || new Date().toISOString(), tracking: data.tracking ?? previous.tracking ?? null };
};
const inScope = (message) => /producto|pastel|torta|cupcake|galleta|brownie|precio|stock|disponib|pedido|orden|horario|hora|abren|cierran|ubicaci[oó]n|local|tienda|comprar|quiero|dulce/i.test(message);
const answerChat = async (message, db, history) => {
  if (!inScope(message)) return "Solo puedo ayudarte con productos, pedidos, horarios e información relacionada con nuestro local.";
  if (!process.env.GEMINI_API_KEY) {
    if (/horario|hora|abren|cierran/i.test(message)) return `Nuestro horario es: ${db.businessInfo.horario}`;
    if (/ubicaci[oó]n/i.test(message)) return db.businessInfo.ubicacion;
    const available = db.productos.filter((p) => p.stock > 0).map((p) => `${p.nombre} ($${Number(p.precio).toFixed(2)}, stock ${p.stock})`).join(", ");
    return `Productos disponibles: ${available}.`;
  }
  const facts = JSON.stringify({ negocio: db.businessInfo, productos: db.productos.map(({ id, nombre, descripcion, precio, stock }) => ({ id, nombre, descripcion, precio, stock })) });
  const instruction = `Eres el asistente oficial de Sweet Stock. Responde solo sobre productos, disponibilidad, pedidos, horarios, ubicación y el negocio. Rechaza otros temas. No inventes datos; usa únicamente: ${facts}`;
  const contents = [...history.slice(-10), { role: "user", parts: [{ text: message }] }];
  const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${process.env.GEMINI_MODEL || "gemini-2.5-flash"}:generateContent?key=${process.env.GEMINI_API_KEY}`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ systemInstruction: { parts: [{ text: instruction }] }, contents, generationConfig: { maxOutputTokens: 300, temperature: 0.2 } }) });
  if (!response.ok) throw new Error("GEMINI_ERROR");
  const result = await response.json();
  return result.candidates?.[0]?.content?.parts?.[0]?.text || "No pude generar una respuesta en este momento.";
};

createServer(async (req, res) => {
  try {
    const path = new URL(req.url, `http://${req.headers.host}`).pathname.replace(/\/$/, "");
    const db = await readDb();
    if (req.method === "POST" && path === "/api/auth/login") {
      const input = await readBody(req);
      const user = db.usuarios.find((item) => item.email === input.email && item.password === input.password);
      if (!user) return send(res, 401, { message: "Credenciales incorrectas" });
      const { password: _password, ...usuario } = user;
      return send(res, 200, { usuario, token: tokenFor(user) });
    }
    const auth = authenticate(req);
    if (!auth) return send(res, 401, { message: "Sesión no válida" });
    if (req.method === "GET" && path === "/api/business-info") return send(res, 200, db.businessInfo);
    if (req.method === "GET" && path === "/api/productos") return send(res, 200, db.productos);
    if (req.method === "GET" && path === "/api/categorias") return send(res, 200, db.categorias);
    const productMatch = path.match(/^\/api\/productos\/([^/]+)$/);
    if (req.method === "GET" && productMatch) {
      const product = db.productos.find((item) => String(item.id) === productMatch[1]);
      return product ? send(res, 200, product) : send(res, 404, { message: "Producto no encontrado" });
    }
    if (["POST", "PUT", "PATCH", "DELETE"].includes(req.method) && (path === "/api/productos" || productMatch)) {
      if (auth.rol !== "admin") return send(res, 403, { message: "Acceso denegado" });
      if (req.method === "POST") { const item = await readBody(req); item.id = Math.max(0, ...db.productos.map((entry) => Number(entry.id) || 0)) + 1; db.productos.push(item); await writeDb(db); return send(res, 201, item); }
      const index = db.productos.findIndex((item) => String(item.id) === productMatch[1]);
      if (index < 0) return send(res, 404, { message: "Producto no encontrado" });
      if (req.method === "DELETE") { db.productos.splice(index, 1); await writeDb(db); return send(res, 204); }
      const input = await readBody(req); db.productos[index] = req.method === "PUT" ? { ...input, id: db.productos[index].id } : { ...db.productos[index], ...input, id: db.productos[index].id };
      await writeDb(db); return send(res, 200, db.productos[index]);
    }
    const categoryMatch = path.match(/^\/api\/categorias\/([^/]+)$/);
    if (req.method === "POST" && path === "/api/categorias") {
      if (auth.rol !== "admin") return send(res, 403, { message: "Acceso denegado" });
      const item = await readBody(req); item.id = Math.max(0, ...db.categorias.map((entry) => Number(entry.id) || 0)) + 1; db.categorias.push(item); await writeDb(db); return send(res, 201, item);
    }
    if (req.method === "DELETE" && categoryMatch) {
      if (auth.rol !== "admin") return send(res, 403, { message: "Acceso denegado" });
      const index = db.categorias.findIndex((item) => String(item.id) === categoryMatch[1]); if (index < 0) return send(res, 404, { message: "Categoría no encontrada" });
      db.categorias.splice(index, 1); await writeDb(db); return send(res, 204);
    }
    if (req.method === "GET" && path === "/api/pedidos") return send(res, 200, auth.rol === "admin" ? db.pedidos : db.pedidos.filter((item) => String(item.usuarioId) === String(auth.id)));
    const match = path.match(/^\/api\/pedidos\/([^/]+)$/);
    if (req.method === "GET" && match) {
      const order = db.pedidos.find((item) => String(item.id) === match[1]);
      return order && (auth.rol === "admin" || String(order.usuarioId) === String(auth.id)) ? send(res, 200, order) : send(res, 404, { message: "Pedido no encontrado" });
    }
    if (req.method === "POST" && path === "/api/pedidos") {
      const input = await readBody(req);
      if (auth.rol !== "admin") { input.usuarioId = auth.id; input.cliente = db.usuarios.find((item) => String(item.id) === String(auth.id))?.nombre || "Usuario"; input.estado = "Por tomar"; input.impuestos = 0; input.descuento = 0; input.estadoPago = "Pendiente"; input.tracking = null; }
      const order = cleanOrder(input, db);
      if (!order.cliente || !order.productos.length) return send(res, 400, { message: "Cliente y productos son obligatorios" });
      order.id = Math.max(0, ...db.pedidos.map((item) => Number(item.id) || 0)) + 1;
      db.pedidos.push(order); await writeDb(db); return send(res, 201, order);
    }
    if (["PATCH", "PUT"].includes(req.method) && match) {
      const index = db.pedidos.findIndex((item) => String(item.id) === match[1]);
      if (index < 0) return send(res, 404, { message: "Pedido no encontrado" });
      const previous = db.pedidos[index];
      if (auth.rol !== "admin" && (String(previous.usuarioId) !== String(auth.id) || previous.estado !== "Por tomar")) return send(res, 403, { message: "Este pedido ya no puede editarse" });
      const input = await readBody(req);
      if (auth.rol !== "admin") { input.usuarioId = auth.id; input.estado = previous.estado; input.impuestos = previous.impuestos; input.descuento = previous.descuento; input.estadoPago = previous.estadoPago; input.tracking = previous.tracking; }
      db.pedidos[index] = { ...cleanOrder(input, db, previous), id: previous.id };
      await writeDb(db); return send(res, 200, db.pedidos[index]);
    }
    if (req.method === "DELETE" && match) {
      const index = db.pedidos.findIndex((item) => String(item.id) === match[1]);
      if (index < 0) return send(res, 404, { message: "Pedido no encontrado" });
      const order = db.pedidos[index];
      if (auth.rol !== "admin" && (String(order.usuarioId) !== String(auth.id) || order.estado !== "Por tomar")) return send(res, 403, { message: "Este pedido ya no puede cancelarse" });
      db.pedidos.splice(index, 1); await writeDb(db); return send(res, 204);
    }
    if (req.method === "POST" && path === "/api/chat") {
      const input = await readBody(req); const message = String(input.message || "").trim().slice(0, 500);
      if (!message) return send(res, 400, { message: "El mensaje es obligatorio" });
      return send(res, 200, { reply: await answerChat(message, db, Array.isArray(input.history) ? input.history.slice(-10) : []) });
    }
    return send(res, 404, { message: "Ruta no encontrada" });
  } catch (error) {
    return send(res, error.message === "BAD_INPUT" ? 400 : 500, { message: error.message === "BAD_INPUT" ? "Datos no válidos" : "No se pudo realizar la operación" });
  }
}).listen(port, () => console.log(`Sweet Stock API disponible en http://localhost:${port}`));
