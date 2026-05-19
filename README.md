# QUIOSKO – Vistas React · v1.0.0

Aplicación React completamente independiente del proyecto Next.js principal.  
Funciona con datos de prueba — **no necesita base de datos ni backend**.

> 📋 Consulta el historial de cambios en [CHANGELOG.md](./CHANGELOG.md)

---

## Instalación y ejecución

> **Requisito previo:** Tener [Node.js](https://nodejs.org) instalado (v18 o superior).

```bash
# 1. Entrar a esta carpeta
cd vistas-react

# 2. Instalar dependencias (solo la primera vez)
npm install

# 3. Iniciar el servidor de desarrollo
npm run dev
```

Luego abrir en el navegador: **http://localhost:5173/vistas**

---

## Vistas disponibles

| Ruta | Descripción |
|------|-------------|
| `/vistas` | Índice — punto de entrada con todas las vistas |
| `/vistas/kiosk` | Menú del quiosco con carrito interactivo |
| `/vistas/orders-ready` | Pantalla pública de órdenes listas |
| `/vistas/admin/orders` | Admin – Gestión de órdenes |
| `/vistas/admin/products` | Admin – Lista de productos |
| `/vistas/admin/products/new` | Admin – Crear producto |
| `/vistas/admin/products/:id/edit` | Admin – Editar producto |

## Funcionalidad incluida

- ✅ Filtro de productos por categoría
- ✅ Carrito con agregar / quitar / cambiar cantidad
- ✅ Cálculo automático de totales
- ✅ Confirmación de pedido con nombre del cliente
- ✅ Marcar órdenes como completadas
- ✅ Búsqueda de productos en tiempo real
- ✅ Paginación dinámica
- ✅ Preview de imagen al subir archivo
- ✅ Modal de confirmación para eliminar
- ✅ Navegación completa entre todas las vistas

## Estructura del proyecto

```
vistas-react/
├── index.html
├── package.json
├── vite.config.ts
├── tsconfig.json
├── CHANGELOG.md
└── src/
    ├── main.tsx          ← Entrada de la app
    ├── App.tsx           ← Rutas (React Router v6)
    ├── index.css
    ├── data/
    │   └── mockData.ts   ← Datos de prueba
    ├── components/
    │   ├── Logo.tsx
    │   └── AdminSidebar.tsx
    └── pages/
        ├── VistasIndex.tsx
        ├── KioskMenu.tsx
        ├── OrdersReady.tsx
        ├── AdminOrders.tsx
        ├── AdminProducts.tsx
        ├── AdminNewProduct.tsx
        └── AdminEditProduct.tsx
```

## Stack

- **React 18** + **TypeScript**
- **Vite 5** (servidor de desarrollo ultrarrápido)
- **React Router DOM v6** (navegación entre páginas)
- Sin CSS frameworks — estilos inline fieles a los HTMLs originales

---

## ⚠️ Nota sobre ejecución

Node.js debe estar en el **PATH del sistema** para que `npm` funcione desde cualquier terminal.  
Si `npm` no se reconoce, descarga Node.js desde https://nodejs.org e instálalo.  
Después de instalarlo, cierra y vuelve a abrir la terminal antes de ejecutar los comandos.
