# 📋 Casos de Prueba — QUIOSKO Gestion Restaurant

**Proyecto:** QUIOSKO Gestion Restaurant  
**Versión:** 2.0.0  
**Fecha:** 2026-06-30  
**Autor:** Equipo de Calidad  
**Stack:** React 18 + Vite 5 + TypeScript + Express 4 + Prisma 5 + MySQL  

---

## Índice

1. [Módulo: API Health Check](#1-módulo-api-health-check)
2. [Módulo: Categorías (GET)](#2-módulo-categorías)
3. [Módulo: Productos — CRUD completo](#3-módulo-productos)
4. [Módulo: Órdenes](#4-módulo-órdenes)
5. [Módulo: Frontend — Menú del Quiosco](#5-módulo-frontend--menú-del-quiosco)
6. [Módulo: Frontend — Admin Productos](#6-módulo-frontend--admin-productos)
7. [Módulo: Frontend — Admin Órdenes](#7-módulo-frontend--admin-órdenes)
8. [Módulo: Utilidades Frontend](#8-módulo-utilidades-frontend)

---

## Convenciones

| Campo | Descripción |
|---|---|
| **ID** | Identificador único del caso (módulo-número) |
| **Tipo** | `POSITIVO` = flujo feliz / `NEGATIVO` = manejo de error / `BORDE` = caso límite |
| **Prioridad** | `ALTA` / `MEDIA` / `BAJA` |
| **Ambiente** | Backend en `http://localhost:3001`, Frontend en `http://localhost:5173` |

---

## 1. Módulo: API Health Check

### CP-HC-01 — Verificar que el servidor responde correctamente

| Campo | Detalle |
|---|---|
| **ID** | CP-HC-01 |
| **Tipo** | POSITIVO |
| **Prioridad** | ALTA |
| **Componente** | `GET /api/health` |
| **Archivo** | `backend/src/server.ts` (línea 33) |

**Precondiciones:**
- Backend ejecutándose en el puerto 3001
- Base de datos MySQL accesible

**Pasos:**
1. Enviar petición `GET http://localhost:3001/api/health`

**Datos de entrada:**
- Ninguno

**Resultado Esperado:**
```json
{
  "status": "ok",
  "timestamp": "2026-06-30T00:47:00.000Z"
}
```
- HTTP Status: `200 OK`
- El campo `timestamp` debe ser una fecha ISO válida

---

## 2. Módulo: Categorías

### CP-CAT-01 — Listar todas las categorías

| Campo | Detalle |
|---|---|
| **ID** | CP-CAT-01 |
| **Tipo** | POSITIVO |
| **Prioridad** | ALTA |
| **Componente** | `GET /api/categories` |
| **Archivo** | `backend/src/routes/categories.ts` (línea 7) |

**Precondiciones:**
- Base de datos con al menos una categoría sembrada (seed)

**Pasos:**
1. Enviar petición `GET http://localhost:3001/api/categories`

**Datos de entrada:** Ninguno

**Resultado Esperado:**
```json
[
  { "id": 1, "name": "Hamburguesa", "icon": "🍔" },
  { "id": 2, "name": "Café",        "icon": "☕" }
]
```
- HTTP Status: `200 OK`
- Array con objetos que contienen `id`, `name`, `icon`
- Ordenado por `id` ascendente

---

### CP-CAT-02 — Obtener categoría por ID válido

| Campo | Detalle |
|---|---|
| **ID** | CP-CAT-02 |
| **Tipo** | POSITIVO |
| **Prioridad** | MEDIA |
| **Componente** | `GET /api/categories/:id` |
| **Archivo** | `backend/src/routes/categories.ts` (línea 19) |

**Precondiciones:**
- Existe categoría con `id = 1`

**Pasos:**
1. Enviar petición `GET http://localhost:3001/api/categories/1`

**Datos de entrada:** `id = 1` (path param)

**Resultado Esperado:**
```json
{ "id": 1, "name": "Hamburguesa", "icon": "🍔" }
```
- HTTP Status: `200 OK`

---

### CP-CAT-03 — Obtener categoría con ID inexistente

| Campo | Detalle |
|---|---|
| **ID** | CP-CAT-03 |
| **Tipo** | NEGATIVO |
| **Prioridad** | MEDIA |
| **Componente** | `GET /api/categories/:id` |
| **Archivo** | `backend/src/routes/categories.ts` (línea 23) |

**Precondiciones:**
- No existe categoría con `id = 9999`

**Pasos:**
1. Enviar petición `GET http://localhost:3001/api/categories/9999`

**Datos de entrada:** `id = 9999` (path param)

**Resultado Esperado:**
```json
{ "error": "Categoría no encontrada" }
```
- HTTP Status: `404 Not Found`

---

## 3. Módulo: Productos

### CP-PROD-01 — Listar productos (sin filtros)

| Campo | Detalle |
|---|---|
| **ID** | CP-PROD-01 |
| **Tipo** | POSITIVO |
| **Prioridad** | ALTA |
| **Componente** | `GET /api/products` |
| **Archivo** | `backend/src/routes/products.ts` (línea 44) |

**Precondiciones:**
- Base de datos con productos sembrados

**Pasos:**
1. Enviar petición `GET http://localhost:3001/api/products`

**Datos de entrada:** Ninguno (usa defaults: `page=1`, `limit=10`)

**Resultado Esperado:**
```json
{
  "data": [ { "id": 1, "name": "...", "price": "9.99", "categoryId": 1, "image": null, "category": {...} } ],
  "total": 11,
  "page": 1,
  "totalPages": 2
}
```
- HTTP Status: `200 OK`
- La propiedad `data` es un array
- Los campos de paginación (`total`, `page`, `totalPages`) están presentes

---

### CP-PROD-02 — Búsqueda de productos por nombre

| Campo | Detalle |
|---|---|
| **ID** | CP-PROD-02 |
| **Tipo** | POSITIVO |
| **Prioridad** | ALTA |
| **Componente** | `GET /api/products?search=hamburguesa` |
| **Archivo** | `backend/src/routes/products.ts` (línea 50) |

**Precondiciones:**
- Existe al menos un producto cuyo nombre contiene "hamburguesa"

**Pasos:**
1. Enviar petición `GET http://localhost:3001/api/products?search=hamburguesa`

**Datos de entrada:** `search=hamburguesa` (query param)

**Resultado Esperado:**
- HTTP Status: `200 OK`
- `data` contiene solo productos con "hamburguesa" en el nombre (case-insensitive en MySQL)
- `total` refleja solo los coincidentes

---

### CP-PROD-03 — Filtrar productos por categoría

| Campo | Detalle |
|---|---|
| **ID** | CP-PROD-03 |
| **Tipo** | POSITIVO |
| **Prioridad** | ALTA |
| **Componente** | `GET /api/products?categoryId=1` |
| **Archivo** | `backend/src/routes/products.ts` (línea 53) |

**Precondiciones:**
- Existen productos con `categoryId = 1`

**Pasos:**
1. Enviar petición `GET http://localhost:3001/api/products?categoryId=1`

**Datos de entrada:** `categoryId=1` (query param)

**Resultado Esperado:**
- HTTP Status: `200 OK`
- Todos los productos en `data` tienen `categoryId = 1`

---

### CP-PROD-04 — Paginación de productos

| Campo | Detalle |
|---|---|
| **ID** | CP-PROD-04 |
| **Tipo** | POSITIVO |
| **Prioridad** | MEDIA |
| **Componente** | `GET /api/products?page=2&limit=5` |
| **Archivo** | `backend/src/routes/products.ts` (línea 57) |

**Precondiciones:**
- Existen más de 5 productos en la base de datos

**Pasos:**
1. Enviar `GET http://localhost:3001/api/products?page=1&limit=5`
2. Enviar `GET http://localhost:3001/api/products?page=2&limit=5`

**Datos de entrada:** `page=2`, `limit=5`

**Resultado Esperado:**
- Página 1: `data` con 5 productos, `page=1`
- Página 2: `data` con los siguientes productos, `page=2`
- Los IDs no se repiten entre páginas

---

### CP-PROD-05 — Obtener producto por ID válido

| Campo | Detalle |
|---|---|
| **ID** | CP-PROD-05 |
| **Tipo** | POSITIVO |
| **Prioridad** | ALTA |
| **Componente** | `GET /api/products/:id` |
| **Archivo** | `backend/src/routes/products.ts` (línea 83) |

**Precondiciones:**
- Existe producto con `id = 1`

**Pasos:**
1. Enviar petición `GET http://localhost:3001/api/products/1`

**Resultado Esperado:**
- HTTP Status: `200 OK`
- Objeto producto con `id=1`, campos `name`, `price`, `categoryId`, `image`, `category`

---

### CP-PROD-06 — Obtener producto con ID inexistente

| Campo | Detalle |
|---|---|
| **ID** | CP-PROD-06 |
| **Tipo** | NEGATIVO |
| **Prioridad** | ALTA |
| **Componente** | `GET /api/products/:id` |
| **Archivo** | `backend/src/routes/products.ts` (línea 90) |

**Pasos:**
1. Enviar petición `GET http://localhost:3001/api/products/99999`

**Resultado Esperado:**
```json
{ "error": "Producto no encontrado" }
```
- HTTP Status: `404 Not Found`

---

### CP-PROD-07 — Crear producto con datos válidos (JSON + emoji)

| Campo | Detalle |
|---|---|
| **ID** | CP-PROD-07 |
| **Tipo** | POSITIVO |
| **Prioridad** | ALTA |
| **Componente** | `POST /api/products` |
| **Archivo** | `backend/src/routes/products.ts` (línea 98) |

**Precondiciones:**
- Existe categoría con `id = 1`

**Pasos:**
1. Enviar petición `POST http://localhost:3001/api/products`
2. Content-Type: `multipart/form-data`
3. Body:

```
name=Agua Mineral
price=15.00
categoryId=1
imageEmoji=💧
```

**Resultado Esperado:**
```json
{
  "id": 12,
  "name": "Agua Mineral",
  "price": "15.00",
  "categoryId": 1,
  "image": "💧",
  "category": { "id": 1, "name": "Hamburguesa", "icon": "🍔" }
}
```
- HTTP Status: `201 Created`

---

### CP-PROD-08 — Crear producto con campos faltantes

| Campo | Detalle |
|---|---|
| **ID** | CP-PROD-08 |
| **Tipo** | NEGATIVO |
| **Prioridad** | ALTA |
| **Componente** | `POST /api/products` |
| **Archivo** | `backend/src/routes/products.ts` (línea 102) |

**Pasos:**
1. Enviar petición `POST http://localhost:3001/api/products`
2. Body solo con `name=Producto Incompleto` (falta `price` y `categoryId`)

**Resultado Esperado:**
```json
{ "error": "name, price y categoryId son requeridos" }
```
- HTTP Status: `400 Bad Request`

---

### CP-PROD-09 — Crear producto con categoría inexistente

| Campo | Detalle |
|---|---|
| **ID** | CP-PROD-09 |
| **Tipo** | NEGATIVO |
| **Prioridad** | MEDIA |
| **Componente** | `POST /api/products` |
| **Archivo** | `backend/src/routes/products.ts` (línea 110) |

**Pasos:**
1. Enviar `POST /api/products` con `name=Test`, `price=10`, `categoryId=9999`

**Resultado Esperado:**
```json
{ "error": "Categoría no encontrada" }
```
- HTTP Status: `400 Bad Request`

---

### CP-PROD-10 — Crear producto con imagen (archivo)

| Campo | Detalle |
|---|---|
| **ID** | CP-PROD-10 |
| **Tipo** | POSITIVO |
| **Prioridad** | ALTA |
| **Componente** | `POST /api/products` + Multer |
| **Archivo** | `backend/src/routes/products.ts` (línea 21, 112) |

**Precondiciones:**
- Archivo de imagen PNG ≤ 5MB disponible

**Pasos:**
1. Enviar `POST /api/products` multipart con campo `image` = archivo PNG

**Resultado Esperado:**
- HTTP Status: `201 Created`
- Campo `image` en respuesta = URL completa tipo `http://localhost:3001/uploads/<timestamp>-<random>.png`
- Archivo físicamente guardado en directorio `backend/uploads/`

---

### CP-PROD-11 — Rechazar imagen con formato inválido

| Campo | Detalle |
|---|---|
| **ID** | CP-PROD-11 |
| **Tipo** | NEGATIVO |
| **Prioridad** | MEDIA |
| **Componente** | `POST /api/products` + Multer fileFilter |
| **Archivo** | `backend/src/routes/products.ts` (línea 24) |

**Pasos:**
1. Enviar `POST /api/products` con un archivo `.pdf` en el campo `image`

**Resultado Esperado:**
- HTTP Status: `400` o `500`
- Error indicando que solo se permiten imágenes

---

### CP-PROD-12 — Actualizar producto (nombre y precio)

| Campo | Detalle |
|---|---|
| **ID** | CP-PROD-12 |
| **Tipo** | POSITIVO |
| **Prioridad** | ALTA |
| **Componente** | `PUT /api/products/:id` |
| **Archivo** | `backend/src/routes/products.ts` (línea 133) |

**Precondiciones:**
- Existe producto con `id = 1`

**Pasos:**
1. Enviar `PUT http://localhost:3001/api/products/1`
2. Body multipart: `name=Hamburguesa Clásica v2`, `price=89.99`

**Resultado Esperado:**
- HTTP Status: `200 OK`
- El nombre y precio en la respuesta reflejan los nuevos valores

---

### CP-PROD-13 — Actualizar producto inexistente

| Campo | Detalle |
|---|---|
| **ID** | CP-PROD-13 |
| **Tipo** | NEGATIVO |
| **Prioridad** | ALTA |
| **Componente** | `PUT /api/products/:id` |
| **Archivo** | `backend/src/routes/products.ts` (línea 138) |

**Pasos:**
1. Enviar `PUT http://localhost:3001/api/products/99999`

**Resultado Esperado:**
```json
{ "error": "Producto no encontrado" }
```
- HTTP Status: `404 Not Found`

---

### CP-PROD-14 — Eliminar producto existente

| Campo | Detalle |
|---|---|
| **ID** | CP-PROD-14 |
| **Tipo** | POSITIVO |
| **Prioridad** | ALTA |
| **Componente** | `DELETE /api/products/:id` |
| **Archivo** | `backend/src/routes/products.ts` (línea 178) |

**Precondiciones:**
- Existe un producto de prueba (ej: el creado en CP-PROD-07)
- El producto no está relacionado a ninguna orden

**Pasos:**
1. Enviar `DELETE http://localhost:3001/api/products/<id_prueba>`

**Resultado Esperado:**
```json
{ "message": "Producto eliminado correctamente" }
```
- HTTP Status: `200 OK`
- El producto ya no aparece en `GET /api/products`

---

### CP-PROD-15 — Eliminar producto inexistente

| Campo | Detalle |
|---|---|
| **ID** | CP-PROD-15 |
| **Tipo** | NEGATIVO |
| **Prioridad** | ALTA |
| **Componente** | `DELETE /api/products/:id` |
| **Archivo** | `backend/src/routes/products.ts` (línea 183) |

**Pasos:**
1. Enviar `DELETE http://localhost:3001/api/products/99999`

**Resultado Esperado:**
```json
{ "error": "Producto no encontrado" }
```
- HTTP Status: `404 Not Found`

---

## 4. Módulo: Órdenes

### CP-ORD-01 — Crear una nueva orden

| Campo | Detalle |
|---|---|
| **ID** | CP-ORD-01 |
| **Tipo** | POSITIVO |
| **Prioridad** | ALTA |
| **Componente** | `POST /api/orders` |
| **Archivo** | `backend/src/routes/orders.ts` (línea 44) |

**Precondiciones:**
- Existen productos con `id = 1` e `id = 2`

**Pasos:**
1. Enviar `POST http://localhost:3001/api/orders`
2. Headers: `Content-Type: application/json`
3. Body:
```json
{
  "name": "Juan Pérez",
  "total": 149.50,
  "order": [
    { "id": 1, "quantity": 2 },
    { "id": 2, "quantity": 1 }
  ]
}
```

**Resultado Esperado:**
- HTTP Status: `201 Created`
- Respuesta contiene `id` de la nueva orden, `name`, `total`, `status: false`
- `orderItems` con los productos incluidos

---

### CP-ORD-02 — Crear orden con body inválido (campo faltante)

| Campo | Detalle |
|---|---|
| **ID** | CP-ORD-02 |
| **Tipo** | NEGATIVO |
| **Prioridad** | ALTA |
| **Componente** | `POST /api/orders` |
| **Archivo** | `backend/src/routes/orders.ts` (línea 48) |

**Pasos:**
1. Enviar `POST /api/orders` con body `{ "name": "Test" }` (falta `total` y `order`)

**Resultado Esperado:**
```json
{ "error": "name, total y order son requeridos" }
```
- HTTP Status: `400 Bad Request`

---

### CP-ORD-03 — Crear orden con array de items vacío

| Campo | Detalle |
|---|---|
| **ID** | CP-ORD-03 |
| **Tipo** | NEGATIVO / BORDE |
| **Prioridad** | MEDIA |
| **Componente** | `POST /api/orders` |
| **Archivo** | `backend/src/routes/orders.ts` (línea 48) |

**Pasos:**
1. Enviar `POST /api/orders` con `{ "name": "Test", "total": 0, "order": [] }`

**Resultado Esperado:**
```json
{ "error": "name, total y order son requeridos" }
```
- HTTP Status: `400 Bad Request`

---

### CP-ORD-04 — Obtener órdenes pendientes

| Campo | Detalle |
|---|---|
| **ID** | CP-ORD-04 |
| **Tipo** | POSITIVO |
| **Prioridad** | ALTA |
| **Componente** | `GET /api/orders/pending` |
| **Archivo** | `backend/src/routes/orders.ts` (línea 7) |

**Precondiciones:**
- Existe al menos una orden con `status = false`

**Pasos:**
1. Enviar `GET http://localhost:3001/api/orders/pending`

**Resultado Esperado:**
- HTTP Status: `200 OK`
- Array de órdenes con `status: false`
- Cada orden contiene `orderItems` con detalles del producto
- Ordenadas por `createdAt` ascendente (primero la más antigua)

---

### CP-ORD-05 — Obtener órdenes listas (ready)

| Campo | Detalle |
|---|---|
| **ID** | CP-ORD-05 |
| **Tipo** | POSITIVO |
| **Prioridad** | ALTA |
| **Componente** | `GET /api/orders/ready` |
| **Archivo** | `backend/src/routes/orders.ts` (línea 25) |

**Precondiciones:**
- Existen órdenes con `orderReadyAt` no nulo

**Pasos:**
1. Enviar `GET http://localhost:3001/api/orders/ready`

**Resultado Esperado:**
- HTTP Status: `200 OK`
- Array de máximo 5 órdenes con `orderReadyAt != null`
- Ordenadas por `orderReadyAt` descendente (más reciente primero)

---

### CP-ORD-06 — Marcar orden como completada

| Campo | Detalle |
|---|---|
| **ID** | CP-ORD-06 |
| **Tipo** | POSITIVO |
| **Prioridad** | ALTA |
| **Componente** | `PUT /api/orders/:id/complete` |
| **Archivo** | `backend/src/routes/orders.ts` (línea 77) |

**Precondiciones:**
- Existe una orden pendiente (status=false)

**Pasos:**
1. Obtener ID de orden pendiente via `GET /api/orders/pending`
2. Enviar `PUT http://localhost:3001/api/orders/<id>/complete`

**Resultado Esperado:**
- HTTP Status: `200 OK`
- La orden en respuesta tiene `status: true`
- `orderReadyAt` tiene un timestamp válido
- La orden ya no aparece en `GET /api/orders/pending`

---

### CP-ORD-07 — Completar orden inexistente

| Campo | Detalle |
|---|---|
| **ID** | CP-ORD-07 |
| **Tipo** | NEGATIVO |
| **Prioridad** | ALTA |
| **Componente** | `PUT /api/orders/:id/complete` |
| **Archivo** | `backend/src/routes/orders.ts` (línea 81) |

**Pasos:**
1. Enviar `PUT http://localhost:3001/api/orders/99999/complete`

**Resultado Esperado:**
```json
{ "error": "Orden no encontrada" }
```
- HTTP Status: `404 Not Found`

---

## 5. Módulo: Frontend — Menú del Quiosco

### CP-KIOSK-01 — Carga inicial del menú

| Campo | Detalle |
|---|---|
| **ID** | CP-KIOSK-01 |
| **Tipo** | POSITIVO |
| **Prioridad** | ALTA |
| **Componente** | `KioskMenu.tsx` |
| **Archivo** | `src/pages/KioskMenu.tsx` (línea 20) |
| **Ruta** | `/vistas/kiosk` |

**Precondiciones:**
- Backend corriendo con datos en BD

**Pasos:**
1. Navegar a `http://localhost:5173/vistas/kiosk`

**Resultado Esperado:**
- Se muestra el mensaje "Cargando menú..." mientras carga
- Las categorías aparecen en el sidebar izquierdo
- La primera categoría queda seleccionada (fondo amarillo)
- Los productos de esa categoría se muestran en el grid central

---

### CP-KIOSK-02 — Filtrar productos por categoría

| Campo | Detalle |
|---|---|
| **ID** | CP-KIOSK-02 |
| **Tipo** | POSITIVO |
| **Prioridad** | ALTA |
| **Componente** | `KioskMenu.tsx` — `setActiveCategoryId` |
| **Archivo** | `src/pages/KioskMenu.tsx` (línea 33) |

**Pasos:**
1. Navegar al menú del quiosco
2. Hacer clic en una categoría diferente (ej: "Café")

**Resultado Esperado:**
- La categoría seleccionada tiene fondo `bg-amber-400`
- El grid de productos actualiza mostrando solo productos de "Café"
- Los productos de la categoría anterior ya no aparecen

---

### CP-KIOSK-03 — Agregar producto al carrito

| Campo | Detalle |
|---|---|
| **ID** | CP-KIOSK-03 |
| **Tipo** | POSITIVO |
| **Prioridad** | ALTA |
| **Componente** | `KioskMenu.tsx` — `addToCart()` |
| **Archivo** | `src/pages/KioskMenu.tsx` (línea 38) |

**Pasos:**
1. Navegar al menú
2. Hacer clic en "Agregar" en cualquier producto

**Resultado Esperado:**
- El producto aparece en el sidebar derecho ("MIS PEDIDOS")
- Se muestra nombre, precio unitario y quantity = 1
- El total se calcula correctamente

---

### CP-KIOSK-04 — Incrementar/decrementar cantidad en carrito

| Campo | Detalle |
|---|---|
| **ID** | CP-KIOSK-04 |
| **Tipo** | POSITIVO |
| **Prioridad** | ALTA |
| **Componente** | `KioskMenu.tsx` — `changeQty()` |
| **Archivo** | `src/pages/KioskMenu.tsx` (línea 50) |

**Pasos:**
1. Agregar un producto al carrito
2. Hacer clic en "+" para incrementar
3. Hacer clic en "−" para decrementar

**Resultado Esperado:**
- La cantidad se incrementa/decrementa
- El subtotal y total se actualizan en tiempo real
- Al llegar a 0, el ítem desaparece del carrito

---

### CP-KIOSK-05 — Eliminar ítem del carrito con botón ✕

| Campo | Detalle |
|---|---|
| **ID** | CP-KIOSK-05 |
| **Tipo** | POSITIVO |
| **Prioridad** | MEDIA |
| **Componente** | `KioskMenu.tsx` — `removeFromCart()` |
| **Archivo** | `src/pages/KioskMenu.tsx` (línea 46) |

**Pasos:**
1. Agregar al menos 2 productos al carrito
2. Hacer clic en "✕" de uno de ellos

**Resultado Esperado:**
- Solo ese producto desaparece del carrito
- El total se recalcula correctamente

---

### CP-KIOSK-06 — Confirmar pedido con datos válidos

| Campo | Detalle |
|---|---|
| **ID** | CP-KIOSK-06 |
| **Tipo** | POSITIVO |
| **Prioridad** | ALTA |
| **Componente** | `KioskMenu.tsx` — `handleConfirm()` |
| **Archivo** | `src/pages/KioskMenu.tsx` (línea 58) |

**Pasos:**
1. Agregar al menos un producto al carrito
2. Ingresar nombre del cliente (ej: "María López")
3. Hacer clic en "Confirmar Pedido"

**Resultado Esperado:**
- Botón muestra "Enviando..." durante la petición
- Aparece pantalla de confirmación con emoji 🎉
- Se muestra el nombre del cliente y el total
- Aparece botón "Nuevo Pedido"
- La orden es creada en la BD (verificable via `GET /api/orders/pending`)

---

### CP-KIOSK-07 — Intentar confirmar pedido sin nombre

| Campo | Detalle |
|---|---|
| **ID** | CP-KIOSK-07 |
| **Tipo** | NEGATIVO |
| **Prioridad** | ALTA |
| **Componente** | `KioskMenu.tsx` — validación HTML `required` |
| **Archivo** | `src/pages/KioskMenu.tsx` (línea 60) |

**Pasos:**
1. Agregar producto al carrito
2. Dejar el campo nombre vacío
3. Hacer clic en "Confirmar Pedido"

**Resultado Esperado:**
- El formulario HTML muestra validación nativa de "campo requerido"
- No se envía la petición al backend

---

### CP-KIOSK-08 — Intentar confirmar pedido con carrito vacío

| Campo | Detalle |
|---|---|
| **ID** | CP-KIOSK-08 |
| **Tipo** | NEGATIVO |
| **Prioridad** | ALTA |
| **Componente** | `KioskMenu.tsx` — guardia `cart.length === 0` |
| **Archivo** | `src/pages/KioskMenu.tsx` (línea 60) |

**Pasos:**
1. No agregar ningún producto al carrito
2. El formulario no es visible (se oculta cuando el carrito está vacío)

**Resultado Esperado:**
- Se muestra "El pedido está vacío" en el área del carrito
- El formulario de confirmación no aparece

---

### CP-KIOSK-09 — Nuevo pedido después de confirmar

| Campo | Detalle |
|---|---|
| **ID** | CP-KIOSK-09 |
| **Tipo** | POSITIVO |
| **Prioridad** | MEDIA |
| **Componente** | `KioskMenu.tsx` — botón "Nuevo Pedido" |
| **Archivo** | `src/pages/KioskMenu.tsx` (línea 80) |

**Pasos:**
1. Completar un pedido exitosamente
2. Hacer clic en "Nuevo Pedido"

**Resultado Esperado:**
- El carrito se limpia (vacío)
- El nombre del cliente se borra
- La pantalla regresa a la vista principal del menú

---

## 6. Módulo: Frontend — Admin Productos

### CP-ADMIN-PROD-01 — Listar productos en admin

| Campo | Detalle |
|---|---|
| **ID** | CP-ADMIN-PROD-01 |
| **Tipo** | POSITIVO |
| **Prioridad** | ALTA |
| **Componente** | `AdminProducts.tsx` |
| **Archivo** | `src/pages/AdminProducts.tsx` |
| **Ruta** | `/vistas/admin/products` |

**Pasos:**
1. Navegar a `/vistas/admin/products`

**Resultado Esperado:**
- Se muestran productos en tabla con columnas: Producto, Precio, Categoría, [Editar]
- El precio está formateado como moneda MXN (ej: `$89.99`)
- Se muestra paginación si hay más de 7 productos

---

### CP-ADMIN-PROD-02 — Buscar producto por nombre

| Campo | Detalle |
|---|---|
| **ID** | CP-ADMIN-PROD-02 |
| **Tipo** | POSITIVO |
| **Prioridad** | ALTA |
| **Componente** | `AdminProducts.tsx` — búsqueda reactiva |
| **Archivo** | `src/pages/AdminProducts.tsx` (línea 46) |

**Pasos:**
1. Navegar al admin de productos
2. Escribir "hamburguesa" en el campo de búsqueda

**Resultado Esperado:**
- La tabla se actualiza automáticamente mostrando solo productos que coinciden
- La paginación se resetea a página 1

---

### CP-ADMIN-PROD-03 — Crear nuevo producto

| Campo | Detalle |
|---|---|
| **ID** | CP-ADMIN-PROD-03 |
| **Tipo** | POSITIVO |
| **Prioridad** | ALTA |
| **Componente** | `AdminNewProduct.tsx` |
| **Archivo** | `src/pages/AdminNewProduct.tsx` |
| **Ruta** | `/vistas/admin/products/new` |

**Pasos:**
1. Hacer clic en "Crear Producto"
2. Rellenar: Nombre="Limonada", Precio=25, Categoría=(cualquiera)
3. (Opcional) Seleccionar una imagen
4. Hacer clic en "Guardar Producto"

**Resultado Esperado:**
- Muestra "Guardando..."
- Aparece mensaje verde "✓ Producto guardado correctamente. Redirigiendo..."
- Redirige al listado en 1.8 segundos
- El nuevo producto aparece en el listado

---

### CP-ADMIN-PROD-04 — Editar producto existente

| Campo | Detalle |
|---|---|
| **ID** | CP-ADMIN-PROD-04 |
| **Tipo** | POSITIVO |
| **Prioridad** | ALTA |
| **Componente** | `AdminEditProduct.tsx` |
| **Archivo** | `src/pages/AdminEditProduct.tsx` |

**Pasos:**
1. Hacer clic en "Editar" de cualquier producto
2. Modificar el nombre (ej: agregar " - EDICIÓN ESPECIAL")
3. Hacer clic en "Guardar Cambios"

**Resultado Esperado:**
- El formulario se pre-rellena con los valores actuales
- Aparece mensaje verde de confirmación
- Redirige al listado
- El producto muestra el nombre actualizado

---

### CP-ADMIN-PROD-05 — Eliminar producto con confirmación

| Campo | Detalle |
|---|---|
| **ID** | CP-ADMIN-PROD-05 |
| **Tipo** | POSITIVO |
| **Prioridad** | ALTA |
| **Componente** | `AdminEditProduct.tsx` — modal de confirmación |
| **Archivo** | `src/pages/AdminEditProduct.tsx` (línea 99) |

**Pasos:**
1. Abrir la edición de un producto
2. Hacer clic en "Eliminar"
3. Confirmar en el modal que aparece

**Resultado Esperado:**
- Aparece modal con "¿Eliminar producto?" y advertencia
- Al confirmar: mensaje rojo "✓ Producto eliminado. Redirigiendo..."
- El producto desaparece del listado

---

### CP-ADMIN-PROD-06 — Cancelar eliminación desde modal

| Campo | Detalle |
|---|---|
| **ID** | CP-ADMIN-PROD-06 |
| **Tipo** | POSITIVO |
| **Prioridad** | MEDIA |
| **Componente** | `AdminEditProduct.tsx` — modal cancelar |
| **Archivo** | `src/pages/AdminEditProduct.tsx` (línea 106) |

**Pasos:**
1. Abrir edición de producto
2. Hacer clic en "Eliminar"
3. Hacer clic en "Cancelar" en el modal

**Resultado Esperado:**
- El modal se cierra
- El producto no es eliminado
- El formulario permanece visible

---

### CP-ADMIN-PROD-07 — Acceder a edición de producto inexistente

| Campo | Detalle |
|---|---|
| **ID** | CP-ADMIN-PROD-07 |
| **Tipo** | NEGATIVO |
| **Prioridad** | MEDIA |
| **Componente** | `AdminEditProduct.tsx` |
| **Archivo** | `src/pages/AdminEditProduct.tsx` (línea 68) |

**Pasos:**
1. Navegar a `/vistas/admin/products/99999/edit`

**Resultado Esperado:**
- Se muestra "Producto no encontrado" en el área principal

---

## 7. Módulo: Frontend — Admin Órdenes

### CP-ADMIN-ORD-01 — Listar órdenes pendientes

| Campo | Detalle |
|---|---|
| **ID** | CP-ADMIN-ORD-01 |
| **Tipo** | POSITIVO |
| **Prioridad** | ALTA |
| **Componente** | `AdminOrders.tsx` |
| **Archivo** | `src/pages/AdminOrders.tsx` |
| **Ruta** | `/vistas/admin/orders` |

**Pasos:**
1. Navegar a `/vistas/admin/orders`

**Resultado Esperado:**
- Se muestran tarjetas de órdenes pendientes
- Cada tarjeta muestra: nombre del cliente, productos con cantidades, total formateado
- Botón "Marcar Orden Completada" por cada orden

---

### CP-ADMIN-ORD-02 — Estado vacío cuando no hay órdenes

| Campo | Detalle |
|---|---|
| **ID** | CP-ADMIN-ORD-02 |
| **Tipo** | POSITIVO |
| **Prioridad** | MEDIA |
| **Componente** | `AdminOrders.tsx` — empty state |
| **Archivo** | `src/pages/AdminOrders.tsx` (línea 41) |

**Precondiciones:**
- No hay órdenes pendientes en la BD

**Pasos:**
1. Navegar a `/vistas/admin/orders`

**Resultado Esperado:**
- Se muestra texto "No hay ordenes pendientes"

---

### CP-ADMIN-ORD-03 — Completar orden desde admin

| Campo | Detalle |
|---|---|
| **ID** | CP-ADMIN-ORD-03 |
| **Tipo** | POSITIVO |
| **Prioridad** | ALTA |
| **Componente** | `AdminOrders.tsx` — `handleComplete()` |
| **Archivo** | `src/pages/AdminOrders.tsx` (línea 24) |

**Pasos:**
1. Navegar al admin de órdenes
2. Hacer clic en "Marcar Orden Completada" en cualquier orden

**Resultado Esperado:**
- El botón cambia a "Procesando..." durante la petición
- La tarjeta de esa orden desaparece de la lista
- La orden aparece en `GET /api/orders/ready`

---

### CP-ADMIN-ORD-04 — Actualización automática cada 5 segundos

| Campo | Detalle |
|---|---|
| **ID** | CP-ADMIN-ORD-04 |
| **Tipo** | POSITIVO |
| **Prioridad** | MEDIA |
| **Componente** | `AdminOrders.tsx` — `setInterval` |
| **Archivo** | `src/pages/AdminOrders.tsx` (línea 20) |

**Pasos:**
1. Navegar al admin de órdenes
2. Desde el kiosco, crear una nueva orden
3. Esperar 5 segundos sin recargar la página

**Resultado Esperado:**
- La nueva orden aparece automáticamente sin recargar la página

---

## 8. Módulo: Utilidades Frontend

### CP-UTIL-01 — Formateo de moneda

| Campo | Detalle |
|---|---|
| **ID** | CP-UTIL-01 |
| **Tipo** | POSITIVO |
| **Prioridad** | MEDIA |
| **Componente** | `utils.ts` — `formatCurrency()` |
| **Archivo** | `src/utils.ts` (línea 1) |

**Pasos:**
1. Llamar `formatCurrency(89.99)`
2. Llamar `formatCurrency(0)`
3. Llamar `formatCurrency(1000)`

**Resultado Esperado:**
- `formatCurrency(89.99)` → `"$89.99"` (formato MXN)
- `formatCurrency(0)` → `"$0.00"`
- `formatCurrency(1000)` → `"$1,000.00"`

---

### CP-UTIL-02 — Resolución de ruta de imagen (getImagePath)

| Campo | Detalle |
|---|---|
| **ID** | CP-UTIL-02 |
| **Tipo** | POSITIVO |
| **Prioridad** | MEDIA |
| **Componente** | `utils.ts` — `getImagePath()` |
| **Archivo** | `src/utils.ts` (línea 21) |

**Pasos:**
1. Llamar con `null`
2. Llamar con `"http://localhost:3001/uploads/img.png"`
3. Llamar con `"/icon_hamburguesa.svg"`
4. Llamar con `"uploads/12345.png"`

**Resultado Esperado:**
- `null` → `""`
- URL HTTP → retorna la misma URL
- ruta `/...` → retorna la misma ruta (asset público Vite)
- `"uploads/..."` → `"http://localhost:3001/uploads/12345.png"`

---

### CP-UTIL-03 — Navegación CORS entre frontend y backend

| Campo | Detalle |
|---|---|
| **ID** | CP-UTIL-03 |
| **Tipo** | POSITIVO |
| **Prioridad** | ALTA |
| **Componente** | `server.ts` — CORS config |
| **Archivo** | `backend/src/server.ts` (línea 15) |

**Pasos:**
1. Con frontend en `http://localhost:5173`, hacer cualquier petición a la API

**Resultado Esperado:**
- No hay errores de CORS en la consola del navegador
- Las peticiones responden correctamente

---

## Resumen de casos

| Módulo | Total CPs | Positivos | Negativos | Borde |
|--------|-----------|-----------|-----------|-------|
| Health Check | 1 | 1 | 0 | 0 |
| Categorías | 3 | 2 | 1 | 0 |
| Productos | 15 | 8 | 6 | 1 |
| Órdenes | 7 | 4 | 2 | 1 |
| Frontend Quiosco | 9 | 7 | 2 | 0 |
| Frontend Admin Productos | 7 | 5 | 2 | 0 |
| Frontend Admin Órdenes | 4 | 4 | 0 | 0 |
| Utilidades | 3 | 3 | 0 | 0 |
| **TOTAL** | **49** | **34** | **13** | **2** |
