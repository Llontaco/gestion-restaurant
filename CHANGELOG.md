# Changelog — QUIOSKO Vistas React

Todos los cambios notables de este proyecto están documentados en este archivo.  
Formato basado en [Keep a Changelog](https://keepachangelog.com/es/1.0.0/).

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

#### Página — Índice de vistas (`VistasIndex.tsx`)
- Punto de entrada principal en `/vistas`
- Tarjetas de navegación hacia todas las vistas disponibles
- Descripción breve de cada sección

#### Página — Menú del Quiosco (`KioskMenu.tsx`)
- Ruta: `/vistas/kiosk`
- Panel de **categorías** en sidebar izquierdo con filtrado activo
- Grid de **productos** filtrado por categoría seleccionada
- **Carrito** completo en sidebar derecho con:
  - Agregar producto al carrito
  - Quitar producto del carrito (botón ✕)
  - Incrementar / decrementar cantidad (botones `+` / `−`)
  - Eliminación automática al llegar a cantidad 0
  - Cálculo de subtotal por ítem
  - Cálculo de total general en tiempo real
  - Campo de nombre del cliente
  - Botón "Confirmar Pedido" (valida que el carrito no esté vacío y que haya nombre)
- **Pantalla de confirmación** con animación emoji, nombre del cliente y total
- Botón "Nuevo Pedido" para reiniciar el carrito

#### Página — Órdenes Listas (`OrdersReady.tsx`)
- Ruta: `/vistas/orders-ready`
- Pantalla pública/de cocina que muestra las órdenes con status `ready`
- Visualización del nombre del cliente

#### Página — Admin Órdenes (`AdminOrders.tsx`)
- Ruta: `/vistas/admin/orders`
- Grid de tarjetas con las órdenes **pendientes**
- Detalle de productos y cantidades por orden
- Total a pagar por orden
- Botón **"Marcar Orden Completada"** — elimina la orden de la lista
- Estado vacío con mensaje cuando no hay órdenes pendientes

#### Página — Admin Productos (`AdminProducts.tsx`)
- Ruta: `/vistas/admin/products`
- Buscador en tiempo real por nombre de producto
- Tabla con columnas: Producto (emoji + nombre), Precio, Categoría, Acción
- Link **"Editar"** hacia la vista de edición del producto
- **Paginación dinámica** (7 productos por página)
- Estado vacío con mensaje cuando la búsqueda no tiene resultados
- Botón **"Crear Producto"** → navega a la vista de nuevo producto

#### Página — Admin Crear Producto (`AdminNewProduct.tsx`)
- Ruta: `/vistas/admin/products/new`
- Formulario con campos: Nombre, Precio, Categoría (select), Imagen (file upload)
- **Preview de imagen** en tiempo real al seleccionar un archivo
- Botón "Guardar Producto" (simulado, no persiste)
- Botón cancelar → vuelve al listado

#### Página — Admin Editar Producto (`AdminEditProduct.tsx`)
- Ruta: `/vistas/admin/products/:id/edit`
- Carga los datos del producto desde `mockData` según el ID de la URL
- Formulario pre-rellenado con los valores actuales
- **Preview de imagen** en tiempo real
- **Modal de confirmación** para eliminar el producto
- Botón "Eliminar Producto" con confirmación antes de ejecutar
- Botón "Actualizar Producto" (simulado, no persiste)

---

### 🏗️ Stack tecnológico

| Tecnología | Versión | Uso |
|---|---|---|
| React | 18.3.1 | Biblioteca de UI |
| React DOM | 18.3.1 | Renderizado en el navegador |
| React Router DOM | 6.24.1 | Navegación entre páginas (SPA) |
| TypeScript | 5.5.3 | Tipado estático |
| Vite | 5.3.4 | Bundler y servidor de desarrollo |
| @vitejs/plugin-react | 4.3.1 | Integración React con Vite |

---

### 📁 Estructura de archivos

```
vistas-react/
├── index.html               ← HTML base (Vite entry point)
├── package.json             ← Dependencias y scripts (v1.0.0)
├── vite.config.ts           ← Configuración de Vite
├── tsconfig.json            ← Configuración de TypeScript
├── CHANGELOG.md             ← Este archivo
└── src/
    ├── main.tsx             ← Entry point — monta <App> con BrowserRouter
    ├── App.tsx              ← Definición de rutas con React Router v6
    ├── index.css            ← Reset y estilos base globales
    ├── data/
    │   └── mockData.ts      ← Tipos y datos de prueba (categorías, productos, órdenes)
    ├── components/
    │   ├── Logo.tsx         ← Componente de logotipo reutilizable
    │   └── AdminSidebar.tsx ← Sidebar del panel de administración
    └── pages/
        ├── VistasIndex.tsx      ← Índice / hub de navegación
        ├── KioskMenu.tsx        ← Menú público del quiosco + carrito
        ├── OrdersReady.tsx      ← Pantalla pública de órdenes listas
        ├── AdminOrders.tsx      ← Gestión de órdenes (admin)
        ├── AdminProducts.tsx    ← Listado de productos (admin)
        ├── AdminNewProduct.tsx  ← Formulario de nuevo producto
        └── AdminEditProduct.tsx ← Formulario de edición + eliminar
```

---

### ⚠️ Limitaciones conocidas en v1.0.0

- Los datos son de prueba y **no se persisten** — al recargar se resetean
- No hay autenticación en el panel de administración
- No hay integración con backend ni base de datos
- La paginación muestra máximo 7 productos (ajustable en `AdminProducts.tsx`)
- Las imágenes de productos son emojis (no URLs reales)

---

### 🔜 Próximas versiones (planificado)

- **v1.1.0** — Conexión con API REST del proyecto Next.js principal
- **v1.2.0** — Autenticación en el panel admin
- **v2.0.0** — Integración completa con base de datos (PostgreSQL / Prisma)
