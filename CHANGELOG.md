# Changelog — QUIOSKO Gestion Restaurant

Todos los cambios notables de este proyecto están documentados en este archivo.  
Formato basado en [Keep a Changelog](https://keepachangelog.com/es/1.0.0/).  
Versionado semántico: [SemVer](https://semver.org/lang/es/).

---

## [2.0.0] — 2026-06-30

### 🎉 Integración Full-Stack — Backend + Base de Datos

Esta versión marca la integración completa del backend con Express, Prisma y MySQL.  
El frontend dejó de usar datos de prueba estáticos (`mockData.ts`) y ahora consume  
datos reales desde la API REST.

---

### ✅ Añadido

#### Backend Express — nuevo directorio `backend/`

- **`backend/src/server.ts`** — Servidor Express con:
  - Middleware CORS habilitado para `localhost:5173` y `localhost:3000`
  - Servicio de archivos estáticos para el directorio `uploads/`
  - Health check endpoint `GET /api/health`
  - Importación de routers: categorías, productos, órdenes

- **`backend/src/routes/categories.ts`** — Endpoints de categorías:
  - `GET /api/categories` — Lista todas las categorías, ordenadas por id
  - `GET /api/categories/:id` — Obtiene una categoría por ID, 404 si no existe

- **`backend/src/routes/products.ts`** — CRUD completo de productos:
  - `GET /api/products` — Lista con paginación (`page`, `limit`) y búsqueda (`search`, `categoryId`)
  - `GET /api/products/:id` — Producto por ID con su categoría anidada
  - `POST /api/products` — Crear producto con imagen (multipart/form-data o emoji)
  - `PUT /api/products/:id` — Actualizar producto; elimina imagen anterior al subir nueva
  - `DELETE /api/products/:id` — Eliminar producto y su imagen del disco
  - Validación de campos requeridos (`name`, `price`, `categoryId`)
  - Validación de existencia de categoría en POST/PUT
  - Upload de imágenes con Multer: máx. 5MB, formatos jpg/png/webp
  - Helper `imageUrl()` para construir URLs absolutas o retornar emojis/rutas relativas

- **`backend/src/routes/orders.ts`** — Endpoints de órdenes:
  - `GET /api/orders/pending` — Órdenes con `status=false`, ordenadas por fecha ASC
  - `GET /api/orders/ready` — Últimas 5 órdenes con `orderReadyAt != null`, DESC
  - `POST /api/orders` — Crear orden con items (valida campos y array no vacío)
  - `PUT /api/orders/:id/complete` — Marca orden como completada (`status=true`, asigna `orderReadyAt`)

- **`backend/prisma/schema.prisma`** — Modelos Prisma:
  - `Category` → tabla `categories`
  - `Product` → tabla `products` (con FK a categoría, timestamps)
  - `Order` → tabla `orders` (con `status` booleano y `orderReadyAt`)
  - `OrderProduct` → tabla `order_products` (relación muchos a muchos)

- **`backend/src/seed.ts`** — Datos de prueba:
  - 6 categorías con emojis (Hamburguesa, Café, Pizza, Dona, Pastel, Galletas)
  - 11 productos con nombre, precio y categoría

- **`backend/src/prismaClient.ts`** — Singleton del cliente Prisma

#### Frontend — nuevos servicios y actualizaciones

- **`src/services/api.ts`** — Capa de servicio completa:
  - Tipos TypeScript: `Category`, `Product`, `CartItem`, `OrderProductItem`, `Order`
  - Función `request<T>()` — wrapper genérico de `fetch` con manejo de errores
  - `getCategories()` — GET /api/categories
  - `getProducts(search?, categoryId?, page, limit)` — GET /api/products con query params
  - `getProductById(id)` — GET /api/products/:id
  - `createProduct(name, price, categoryId, imageFile?)` — POST multipart
  - `updateProduct(id, data)` — PUT multipart
  - `deleteProduct(id)` — DELETE
  - `createOrder(name, total, order)` — POST JSON
  - `getPendingOrders()` — GET /api/orders/pending
  - `getReadyOrders()` — GET /api/orders/ready
  - `completeOrder(id)` — PUT /api/orders/:id/complete

- **`src/utils.ts`** — Nuevas utilidades:
  - `getImagePath(image)` — Resuelve URLs de imágenes (HTTP, rutas Vite, uploads backend)

- **`src/pages/KioskMenu.tsx`** — Actualizado a API real:
  - Carga categorías y productos desde la API (antes: mockData)
  - Envía pedidos reales con `createOrder()`
  - Manejo de estados de carga y error
  - Pantalla de confirmación funcional

- **`src/pages/AdminOrders.tsx`** — Actualizado a API real:
  - Carga órdenes pendientes desde `getPendingOrders()`
  - Completa órdenes con `completeOrder()`
  - Polling automático cada 5 segundos

- **`src/pages/AdminProducts.tsx`** — Actualizado a API real:
  - Paginación server-side (7 ítems por página)
  - Búsqueda reactiva via API

- **`src/pages/AdminNewProduct.tsx`** — Actualizado a API real:
  - Crea productos reales con `createProduct()`
  - Carga categorías desde la API

- **`src/pages/AdminEditProduct.tsx`** — Actualizado a API real:
  - Carga datos del producto desde `getProductById()`
  - Edita con `updateProduct()` y elimina con `deleteProduct()`

#### Documentación — nueva carpeta `docs/`

- **`docs/casos_de_prueba.md`** — 49 casos de prueba especificados:
  - 8 módulos cubiertos
  - 34 casos positivos, 13 negativos, 2 de borde
  - Incluye: precondiciones, pasos, datos de entrada, resultado esperado

- **`docs/informe_resultados_pruebas.md`** — Informe de resultados:
  - 44/49 casos pasados (89.8%)
  - 3 defectos documentados (0 críticos, 1 medio, 2 bajos)
  - Análisis de causa raíz y correcciones sugeridas

- **`docs/SCM.md`** — Gestión de Configuración del Software:
  - Inventario de 37 elementos de configuración (ECs)
  - Estrategia de ramas Git y convención de commits
  - Procedimiento de gestión de cambios
  - Listado completo de dependencias

---

### 🔄 Cambiado

- **`README.md`** — Completamente reescrito:
  - Tabla de stack tecnológico con versiones
  - Árbol de estructura de archivos actualizado
  - Documentación de todos los endpoints de la API
  - Tabla de rutas del frontend
  - Esquema de base de datos Prisma
  - Tabla de variables de entorno
  - Resumen de resultados de pruebas
  - Lista de defectos conocidos

- **`CHANGELOG.md`** — Actualizado con nueva entrada v2.0.0

---

### 🗑️ Eliminado

- **`src/data/mockData.ts`** — Los datos de prueba estáticos ya no son necesarios.  
  Todas las páginas consumen la API real del backend.

---

### 🐛 Defectos Conocidos en v2.0.0

| ID | Severidad | Descripción | Componente |
|---|---|---|---|
| DEF-001 | MEDIA | Multer devuelve HTTP 500 en lugar de 400 al rechazar formato de imagen inválido | `backend/src/routes/products.ts` |
| DEF-002 | BAJA | La pantalla "Producto no encontrado" no tiene enlace de retorno al listado | `src/pages/AdminEditProduct.tsx` |

---

### 🏗️ Stack tecnológico v2.0.0

| Tecnología | Versión | Uso |
|---|---|---|
| React | 18.3.1 | Biblioteca de UI |
| React DOM | 18.3.1 | Renderizado en el navegador |
| React Router DOM | 6.24.1 | Navegación entre páginas (SPA) |
| TypeScript | 5.5.3 | Tipado estático (frontend + backend) |
| Vite | 5.3.4 | Bundler y servidor de desarrollo |
| TailwindCSS | 4.3.0 | Framework CSS utilitario |
| Express | 4.19.2 | Framework HTTP backend |
| Prisma | 5.16.0 | ORM para MySQL |
| Multer | 1.4.5-lts.1 | Middleware upload de archivos |
| CORS | 2.8.5 | Middleware CORS Express |
| MySQL | 8.x | Base de datos relacional |
| ts-node-dev | 2.0.0 | Hot-reload backend TypeScript |

---

## [1.0.0] — 2026-05-19

### 🎉 Primera versión oficial

Esta versión marca la entrega inicial de **QUIOSKO Vistas React**, una aplicación
React completamente independiente del proyecto Next.js principal. Funciona con datos
de prueba sin necesitar base de datos ni backend.

---

### ✅ Añadido

#### Infraestructura del proyecto
- Proyecto inicializado con **Vite 5** + **React 18** + **TypeScript**
- Configuración de **React Router DOM v6** con base path `/vistas`
- Redirección automática de `/` → `/vistas`
- Archivo `tsconfig.json` con soporte estricto de TypeScript
- `vite.config.ts` con plugin React configurado

#### Datos de prueba (`src/data/mockData.ts`)
- Tipos TypeScript: `Category`, `Product`, `OrderProduct`, `Order`
- **6 categorías** de productos: Hamburguesa, Café, Pizza, Dona, Pastel, Galletas
- **11 productos** con nombre, precio, categoría e imagen (emoji)
- **5 órdenes de ejemplo** con estados `pending` / `ready`

#### Componentes reutilizables
- **`Logo.tsx`** — Logotipo SVG/texto de QUIOSKO, acepta prop `size`
- **`AdminSidebar.tsx`** — Barra lateral del panel de administración con:
  - Logo en la cabecera
  - Navegación entre Órdenes, Productos y Ver Quiosco
  - Indicador visual de sección activa (borde amarillo + fondo suave)

#### Páginas (7 vistas)
- **`VistasIndex.tsx`** — Hub de navegación principal
- **`KioskMenu.tsx`** — Menú con categorías, productos, carrito y confirmación
- **`OrdersReady.tsx`** — Pantalla de cocina con órdenes listas
- **`AdminOrders.tsx`** — Gestión de órdenes pendientes con botón de completar
- **`AdminProducts.tsx`** — Tabla con búsqueda y paginación (7 por página)
- **`AdminNewProduct.tsx`** — Formulario de nuevo producto con preview de imagen
- **`AdminEditProduct.tsx`** — Edición con modal de confirmación de eliminación

---

### ⚠️ Limitaciones conocidas en v1.0.0 (resueltas en v2.0.0)

- Los datos eran de prueba y **no se persistían** — al recargar se reseteaban *(corregido en v2.0.0)*
- No había integración con backend ni base de datos *(corregido en v2.0.0)*
- Las imágenes de productos eran emojis (no URLs reales) *(parcialmente resuelto — soporte de uploads en v2.0.0)*
- No hay autenticación en el panel de administración *(planificado para v2.2.0)*

---

### 🔜 Roadmap

| Versión | Estado | Descripción |
|---|---|---|
| v1.0.0 | ✅ Entregado | Frontend con datos mock |
| v2.0.0 | ✅ Entregado | Integración Full-Stack con MySQL |
| v2.1.0 | 🔜 Planificado | Corrección de defectos + tests automatizados |
| v2.2.0 | 🔜 Planificado | Autenticación JWT en panel admin |
| v3.0.0 | 🔜 Planificado | Multi-sucursal + reportes de ventas |
