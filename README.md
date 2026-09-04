# Sweet Stock

Sistema React + Vite con API Node para inventario, pedidos y asistente de negocio.

## Configuración y prueba

1. Copia `.env.example` a `.env`, configura `GEMINI_API_KEY` y define un `AUTH_SECRET` largo.
2. Ejecuta `npm install`.
3. En una terminal ejecuta `npm run server` y en otra `npm run dev`.
4. Como administrador, abre Pedidos y prueba crear, ver, editar, filtrar, buscar y eliminar.
5. Como usuario, consulta productos u horarios en el asistente. “Quiero 2 brownies” prepara un pedido que requiere confirmación manual.

La API usa `db.json`. Sin clave Gemini, el asistente responde en modo local con productos y horarios reales.

El seguimiento utiliza MapLibre GL JS y mapas vectoriales de OpenFreeMap, sin API key. Se muestra cuando el pedido contiene coordenadas en `tracking.origen`, `tracking.destino` y `tracking.ubicacionActual`. `tracking.ruta` puede incluir la geometría real; sin ella se dibuja una ruta aproximada entre los puntos. Los usuarios solo pueden editar o cancelar pedidos propios en estado `Por tomar`.

El flujo operativo de pedidos es `Por tomar` → `En preparación` → `En tránsito` → `Despachado`. El administrador puede aceptar el pedido, marcarlo en tránsito y configurar el conductor, placa, vehículo, marca, calificación y coordenadas desde las acciones del pedido. El administrador y el cliente ven el mismo seguimiento.
El editor del express permite buscar origen y destino por nombre mediante Nominatim, o seleccionar y arrastrar cada pin directamente en el mapa. El botón de ubicación del dispositivo se aplica al punto seleccionado. La ubicación móvil se transmite posteriormente desde Seguimiento.

# React + Vite

This template provides a minimal setup to get React working in Vite with HMR and some Oxlint rules.

Currently, two official plugins are available:

- [@vitejs/plugin-react](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react) uses [Oxc](https://oxc.rs)
- [@vitejs/plugin-react-swc](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react-swc) uses [SWC](https://swc.rs/)

## React Compiler

The React Compiler is not enabled on this template because of its impact on dev & build performances. To add it, see [this documentation](https://react.dev/learn/react-compiler/installation).

## Expanding the Oxlint configuration

If you are developing a production application, we recommend using TypeScript with type-aware lint rules enabled. Check out the [TS template](https://github.com/vitejs/vite/tree/main/packages/create-vite/template-react-ts) for information on how to integrate TypeScript and Oxlint's TypeScript related rules in your project.
