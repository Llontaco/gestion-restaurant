# Registro de Cambios — Sesión del 07/07/2026

Este documento resume todas las funcionalidades, correcciones y cambios de
infraestructura implementados en el sistema **Fresh Coffee (gestion-restaurant)**.

---

## 1. Chatbot con IA (Google Gemini)

Asistente flotante que guía a los clientes: recomienda productos, informa
precios y explica cómo usar la app. **Limitado por prompt**: solo responde
sobre el menú y la aplicación; rechaza temas ajenos.

| Componente | Archivo |
|---|---|
| Endpoint `POST /api/chat` (proxy seguro: la API key vive solo en el backend) | `backend/src/routes/chat.ts` |
| Widget flotante del chat (burbujas, sugerencias, indicador "escribiendo") | `src/components/ChatWidget.tsx` |
| Función `sendChatMessage` | `src/services/api.ts` |

- El bot recibe el **menú real desde la BD** en cada consulta (precios siempre actualizados).
- Modelo: `gemini-2.5-flash` (el 2.0 tenía cuota 0 en la cuenta).
- Variables: `GEMINI_API_KEY`, `GEMINI_MODEL` (backend, Vercel).

## 2. Roles de usuario y control de acceso

- Nuevo campo `User.role`: **`ADMIN`** o **`CLIENT`** (por defecto). `password` ahora es opcional (cuentas Google).
- Todo registro público crea un **CLIENTE**. El admin se siembra aparte:
  - **admin@freshcoffee.com / FreshCoffee2026!** (única cuenta con panel de administración).
- `RequireAdmin` protege todas las rutas `/vistas/admin/*`; los clientes solo ven **Quiosco** y **Mis Pedidos**.
- El índice de vistas y el navbar se filtran según el rol.

## 3. Inicio de sesión con Google (opcional)

- Botón **"Continuar con Google"** en el login (Google Identity Services).
- Backend `POST /api/auth/google`: verifica el token con Google y valida la audiencia (`GOOGLE_CLIENT_ID`); crea el usuario como CLIENT si no existe.
- Archivos: `src/components/GoogleSignInButton.tsx`, `backend/src/routes/auth.ts`.
- Requiere autorizar los orígenes en Google Cloud Console (localhost + dominio Vercel).

## 4. CRUD de Categorías (solo admin)

- Backend: `POST/PUT/DELETE /api/categories` — con validación de duplicados y **bloqueo de borrado** si la categoría tiene productos.
- Frontend: página **Administrar categorías** (`src/pages/AdminCategories.tsx`) con crear, editar (modal) y eliminar. Nueva pestaña "Categorías" en el panel admin.

## 5. Moneda y precios

- Moneda cambiada a **Soles peruanos (S/ PEN)** — `formatCurrency` usa `es-PE`.
- Precios realistas actualizados en seed y BD de producción (ej.: Hamburguesa Clásica S/ 12.90, Café Americano S/ 6.50, Pizza Margarita S/ 21.90).

## 6. Mejoras de UX y bugs corregidos

- **Logo del navbar** ahora vuelve al quiosco al hacer clic.
- **Botón "Agregar"** del kiosko: color de marca, elevación al hover, compresión al clic y feedback **"✓ Agregado"** en verde.
- **Escala de UI**: `font-size: 125%` en pantallas ≥1024px — la app se ve al tamaño correcto con Windows al 100% de escalado, sin scroll extra (se usa `rem`, así `100vh` sigue exacto). En móviles no aplica.
- Tabla de productos del admin con scroll horizontal en pantallas pequeñas.

## 7. Mis Pedidos (cliente) y ciclo de vida de órdenes

- Las órdenes se asocian al usuario (`Order.userId`).
- Página **"Mis Pedidos"** (`src/pages/MyOrders.tsx`): estados *En preparación → ¡Listo para recoger! → Entregado*, auto-refresco cada 5 s.
- Nuevo estado **finalizada** (`Order.finalizedAt`): el admin marca órdenes listas como **entregadas** y desaparecen del display "Órdenes Listas".
- Endpoints nuevos: `GET /api/orders/mine?userId=`, `PUT /api/orders/:id/finalize`; `GET /api/orders/ready` excluye finalizadas.

## 8. Delivery con Google Maps y cobro por kilómetro

- En el carrito, el cliente elige **🏪 Recojo en local (gratis)** o **🛵 Delivery**.
- Delivery: **mapa de Google Maps** (Maps JavaScript API) — el cliente toca el mapa o arrastra el marcador; escribe dirección/referencia.
- **Local fijo**: Puerta 1 de la UNMSM (Av. Venezuela cdra. 34) → `-12.0531, -77.0817`.
- Distancia: Haversine × factor de ruta 1.3. **Tarifa: S/ 1.50/km. Radio máximo: 10 km.**
- **Aviso obligatorio del cargo** (banner ámbar) + checkbox "Acepto el cargo adicional" antes de poder confirmar; el cargo se suma al total.
- Admin ve dirección, km, cargo y **enlace a Google Maps** con la ubicación del cliente.
- Campos nuevos en `Order`: `deliveryType`, `deliveryAddress`, `deliveryLat/Lng`, `distanceKm`, `deliveryFee`.
- Componente: `src/components/DeliveryMapPicker.tsx`.
- Bugs corregidos durante la implementación:
  - `loading=async` impedía inicializar el mapa (se usa carga clásica del script).
  - Crash `removeChild` (pantalla en blanco): React renderizaba dentro del div que controla Google Maps → ahora el mapa tiene un div exclusivo y los mensajes son capas superpuestas.

## 9. Pasarela de pagos — Mercado Pago (Checkout Pro)

**La orden se registra únicamente cuando el pago está aprobado.**

Flujo: `Pagar y Confirmar Pedido` → backend crea preferencia → redirección a
Mercado Pago (tarjetas, Yape*, etc.) → retorno al kiosko → backend **verifica el
pago con MP** → se crea la orden → pantalla **"¡Pedido Realizado!"**.

| Endpoint | Función |
|---|---|
| `POST /api/payments/create` | Crea la preferencia. **Recalcula los precios desde la BD** y re-valida el cargo de delivery en el servidor (anti-manipulación). El pedido viaja en `metadata`. |
| `POST /api/payments/confirm` | Al volver de MP verifica el pago (`GET /v1/payments/:id`) y registra la orden. **Idempotente** (paymentId único). |
| `POST /api/payments/webhook` | Respaldo: si el cliente no vuelve al sitio, MP notifica y la orden se registra igual. |

- Si el pago falla o queda pendiente, el carrito se **restaura** (localStorage) para reintentar.
- Campos nuevos en `Order`: `paymentId` (único), `paymentStatus`. Admin ve badge **"✓ Pagado"**.
- Variable: `MP_ACCESS_TOKEN` (backend, secreto).
- \*Yape aparece según reglas dinámicas de MP (sesión invitado, montos, disponibilidad); no se excluye ningún método.

---

## Cambios de base de datos (PostgreSQL / Neon)

Columnas agregadas (migraciones aplicadas en producción):

```sql
-- users
ALTER TABLE users ADD COLUMN role VARCHAR(20) NOT NULL DEFAULT 'CLIENT';
ALTER TABLE users ALTER COLUMN password DROP NOT NULL;

-- orders
ALTER TABLE orders ADD COLUMN "finalizedAt" TIMESTAMP(3);
ALTER TABLE orders ADD COLUMN "userId" INTEGER;
ALTER TABLE orders ADD COLUMN "deliveryType" VARCHAR(10) NOT NULL DEFAULT 'PICKUP';
ALTER TABLE orders ADD COLUMN "deliveryAddress" VARCHAR(300);
ALTER TABLE orders ADD COLUMN "deliveryLat" DOUBLE PRECISION;
ALTER TABLE orders ADD COLUMN "deliveryLng" DOUBLE PRECISION;
ALTER TABLE orders ADD COLUMN "distanceKm" DOUBLE PRECISION;
ALTER TABLE orders ADD COLUMN "deliveryFee" DECIMAL(10,2) NOT NULL DEFAULT 0;
ALTER TABLE orders ADD COLUMN "paymentId" VARCHAR(60);
ALTER TABLE orders ADD COLUMN "paymentStatus" VARCHAR(20);
CREATE UNIQUE INDEX "orders_paymentId_key" ON orders("paymentId");
```

> Las migraciones en producción se aplicaron mediante un endpoint temporal
> `/api/setup` protegido con `SETUP_KEY`, **eliminado tras cada uso** (las
> credenciales de la BD de Neon no son descargables desde Vercel).

## Variables de entorno

**Backend (proyecto Vercel `backend`)**

| Variable | Uso |
|---|---|
| `POSTGRES_PRISMA_URL` / `POSTGRES_URL_NON_POOLING` | BD Neon (inyectadas por Vercel) |
| `GEMINI_API_KEY` / `GEMINI_MODEL` | Chatbot IA |
| `GOOGLE_CLIENT_ID` | Verificación del login con Google |
| `MP_ACCESS_TOKEN` | Mercado Pago (SECRETO) |
| `FRONTEND_URL` | CORS / retorno de pagos |

**Frontend (proyecto Vercel `gestion-restaurant`)**

| Variable | Uso |
|---|---|
| `VITE_API_URL` | URL base del backend |
| `VITE_GOOGLE_CLIENT_ID` (opcional) | Client ID del botón Google |
| `VITE_GOOGLE_MAPS_API_KEY` (opcional) | Key del mapa de delivery |

## Endpoints nuevos del API

```
POST /api/chat                    → chatbot (Gemini)
POST /api/auth/google             → login con Google
POST /api/categories              → crear categoría (admin)
PUT  /api/categories/:id          → editar categoría (admin)
DELETE /api/categories/:id        → eliminar categoría (admin)
GET  /api/orders/mine?userId=N    → pedidos del cliente
PUT  /api/orders/:id/finalize     → marcar orden entregada (admin)
POST /api/payments/create         → crear preferencia de pago MP
POST /api/payments/confirm        → verificar pago y registrar orden
POST /api/payments/webhook        → notificaciones de MP
```

## Seguridad — pendientes recomendados

- [ ] **Rotar el Access Token de Mercado Pago** (quedó expuesto durante la configuración) y actualizarlo en Vercel.
- [ ] **Restringir la API key de Google Maps** por dominio (HTTP referrers) en Google Cloud Console.
- [ ] Autorizar orígenes del **Client ID de Google** (localhost + dominio Vercel) para el botón de login.
- [ ] Cambiar la contraseña por defecto del admin.
