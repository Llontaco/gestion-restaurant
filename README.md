# 🍔 QUIOSKO — Sistema de Gestión de Restaurante

Sistema completo de gestión de restaurante con panel de administración, quiosco de pedidos y pantalla de cocina. Arquitectura **Full-Stack**: React + TypeScript en el frontend, Express + Prisma + MySQL en el backend.

---

## 📋 Índice

- [Stack Tecnológico](#-stack-tecnológico)
- [Estructura del Proyecto](#%EF%B8%8F-estructura-del-proyecto)
- [Requisitos Previos](#-requisitos-previos)
- [Instalación y Configuración](#-instalación-y-configuración)
- [Scripts Disponibles](#-scripts-disponibles)
- [API Endpoints](#-api-endpoints)
- [Rutas del Frontend](#-rutas-del-frontend)
- [Modelos de Base de Datos](#%EF%B8%8F-modelos-de-base-de-datos)
- [Variables de Entorno](#-variables-de-entorno)
- [Documentación y Pruebas](#-documentación-y-pruebas)
- [Defectos Conocidos](#%EF%B8%8F-defectos-conocidos)

---

## 🏗️ Stack Tecnológico

| Capa | Tecnología | Versión |
|---|---|---|
| **Frontend UI** | React | 18.3.1 |
| **Routing** | React Router DOM | 6.24.1 |
| **Estilos** | TailwindCSS | 4.3.0 |
| **Bundler** | Vite | 5.3.4 |
| **Lenguaje** | TypeScript | 5.5.3 |
| **Backend** | Express | 4.19.2 |
| **ORM** | Prisma | 5.16.0 |
| **Base de datos** | MySQL | 8.x |
| **Upload** | Multer | 1.4.5-lts.1 |

---

## 🗂️ Estructura del Proyecto

```
gestion-restaurant/
│
├── src/                          ← Frontend React
│   ├── components/
│   │   ├── Logo.tsx              ← Logotipo reutilizable
│   │   └── AdminSidebar.tsx      ← Sidebar del panel de administración
│   ├── pages/
│   │   ├── VistasIndex.tsx       ← Hub de navegación de vistas
│   │   ├── KioskMenu.tsx         ← Menú del quiosco + carrito
│   │   ├── OrdersReady.tsx       ← Pantalla de órdenes listas (cocina)
│   │   ├── AdminOrders.tsx       ← Gestión de órdenes (admin)
│   │   ├── AdminProducts.tsx     ← Listado de productos (admin)
│   │   ├── AdminNewProduct.tsx   ← Formulario nuevo producto
│   │   └── AdminEditProduct.tsx  ← Formulario edición/eliminación
│   ├── services/
│   │   └── api.ts                ← Capa de servicio API (fetch + tipos)
│   ├── App.tsx                   ← Definición de rutas React Router
│   ├── main.tsx                  ← Entry point
│   ├── index.css                 ← Estilos globales
│   └── utils.ts                  ← Utilidades (formatCurrency, getImagePath)
│
├── backend/                      ← Backend Express
│   ├── src/
│   │   ├── routes/
│   │   │   ├── categories.ts     ← GET /api/categories
│   │   │   ├── products.ts       ← CRUD /api/products + upload
│   │   │   └── orders.ts         ← CRUD /api/orders
│   │   ├── server.ts             ← Servidor, middlewares, CORS
│   │   ├── prismaClient.ts       ← Singleton Prisma
│   │   └── seed.ts               ← Datos iniciales
│   ├── prisma/
│   │   └── schema.prisma         ← Modelos de BD
│   ├── uploads/                  ← Imágenes subidas (generado automáticamente)
│   ├── package.json
│   └── .env                      ← DATABASE_URL, PORT, UPLOADS_DIR
│
├── docs/                         ← Documentación del proyecto
│   ├── casos_de_prueba.md        ← 49 casos de prueba especificados
│   ├── informe_resultados_pruebas.md ← Resultados de ejecución
│   └── SCM.md                    ← Gestión de Configuración del Software
│
├── index.html                    ← HTML base de Vite
├── package.json                  ← Dependencias frontend
├── vite.config.ts
├── tailwind.config.js
├── README.md                     ← Este archivo
├── CHANGELOG.md                  ← Historial de versiones
└── setup.sh                      ← Script de arranque completo
```

---

## ✅ Requisitos Previos

- **Node.js** ≥ 18.x
- **npm** ≥ 9.x
- **MySQL** 8.x (local o remoto)
- **Git**

---

## 🚀 Instalación y Configuración

### Paso 1 — Crear la base de datos

En MySQL Workbench o CLI:

```sql
CREATE DATABASE gestion_restaurant;
```

### Paso 2 — Configurar variables de entorno del backend

Editar `backend/.env`:

```env
DATABASE_URL="mysql://root:TU_PASSWORD@localhost:3306/gestion_restaurant"
PORT=3001
UPLOADS_DIR=uploads
```

### Paso 3 — Configurar variables de entorno del frontend

El archivo `.env` en la raíz ya está configurado:

```env
VITE_API_URL=http://localhost:3001/api
```

### Paso 4 — Instalación con un comando

```bash
bash setup.sh
```

### O manualmente en dos terminales

```bash
# ── Terminal 1: Backend ──────────────────────────────────────
cd backend
npm install
npx prisma generate
npx prisma migrate dev --name init
npx ts-node src/seed.ts
npm run dev
# → http://localhost:3001

# ── Terminal 2: Frontend ─────────────────────────────────────
npm install
npm run dev
# → http://localhost:5173
```

---

## 🛠️ Scripts Disponibles

### Backend (`cd backend`)

| Comando | Descripción |
|---|---|
| `npm run dev` | Servidor con hot-reload (ts-node-dev) |
| `npm run build` | Compilar TypeScript → `dist/` |
| `npm start` | Ejecutar build de producción |
| `npm run db:migrate` | Crear/aplicar migraciones de Prisma |
| `npm run db:generate` | Regenerar Prisma Client |
| `npm run db:seed` | Insertar datos iniciales (categorías + productos) |
| `npm run db:studio` | Abrir Prisma Studio (GUI web) |

### Frontend (raíz)

| Comando | Descripción |
|---|---|
| `npm run dev` | Servidor de desarrollo Vite |
| `npm run build` | Bundle de producción en `dist/` |
| `npm run preview` | Preview del bundle de producción |

---

## 📡 API Endpoints

**Base URL:** `http://localhost:3001/api`

### Health

| Método | Ruta | Descripción |
|---|---|---|
| GET | `/health` | Estado del servidor |

### Categorías

| Método | Ruta | Descripción |
|---|---|---|
| GET | `/categories` | Listar todas las categorías |
| GET | `/categories/:id` | Obtener categoría por ID |

### Productos

| Método | Ruta | Descripción |
|---|---|---|
| GET | `/products` | Listar con paginación y búsqueda |
| GET | `/products/:id` | Obtener producto por ID |
| POST | `/products` | Crear producto (`multipart/form-data`) |
| PUT | `/products/:id` | Actualizar producto (`multipart/form-data`) |
| DELETE | `/products/:id` | Eliminar producto |

**Parámetros de búsqueda (GET /products):**

```
?search=hamburguesa    → Filtrar por nombre
?categoryId=1          → Filtrar por categoría
?page=1&limit=10       → Paginación
```

### Órdenes

| Método | Ruta | Descripción |
|---|---|---|
| GET | `/orders/pending` | Órdenes pendientes (`status=false`) |
| GET | `/orders/ready` | Últimas 5 órdenes completadas |
| POST | `/orders` | Crear nueva orden (JSON) |
| PUT | `/orders/:id/complete` | Marcar orden como completada |

**Body para crear orden:**
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

---

## 🌐 Rutas del Frontend

| Ruta | Vista | Descripción |
|---|---|---|
| `/` | Redirect | Redirige automáticamente a `/vistas` |
| `/vistas` | VistasIndex | Hub de navegación con accesos directos |
| `/vistas/kiosk` | KioskMenu | Menú del quiosco para clientes |
| `/vistas/orders-ready` | OrdersReady | Pantalla de cocina — órdenes listas |
| `/vistas/admin/orders` | AdminOrders | Panel admin — gestión de órdenes |
| `/vistas/admin/products` | AdminProducts | Panel admin — listado de productos |
| `/vistas/admin/products/new` | AdminNewProduct | Panel admin — crear producto |
| `/vistas/admin/products/:id/edit` | AdminEditProduct | Panel admin — editar/eliminar producto |

---

## 🗄️ Modelos de Base de Datos

```prisma
model Category {
  id       Int       @id @default(autoincrement())
  name     String    @unique @db.VarChar(100)
  icon     String    @db.VarChar(10)
  products Product[]
}

model Product {
  id         Int            @id @default(autoincrement())
  name       String         @db.VarChar(200)
  price      Decimal        @db.Decimal(10, 2)
  image      String?        @db.VarChar(500)  // URL, emoji o ruta uploads/
  categoryId Int
  category   Category       @relation(...)
  orderItems OrderProduct[]
  createdAt  DateTime       @default(now())
  updatedAt  DateTime       @updatedAt
}

model Order {
  id           Int            @id @default(autoincrement())
  name         String         @db.VarChar(200)  // Nombre del cliente
  total        Decimal        @db.Decimal(10, 2)
  status       Boolean        @default(false)    // false=pendiente, true=completado
  orderReadyAt DateTime?
  createdAt    DateTime       @default(now())
  orderItems   OrderProduct[]
}

model OrderProduct {
  id        Int     @id @default(autoincrement())
  orderId   Int
  productId Int
  quantity  Int
}
```

---

## 🔐 Variables de Entorno

### Backend (`backend/.env`)

| Variable | Descripción | Ejemplo |
|---|---|---|
| `DATABASE_URL` | URL de conexión MySQL | `mysql://root:pass@localhost:3306/gestion_restaurant` |
| `PORT` | Puerto del servidor | `3001` |
| `UPLOADS_DIR` | Directorio de imágenes | `uploads` |

### Frontend (`.env`)

| Variable | Descripción | Ejemplo |
|---|---|---|
| `VITE_API_URL` | URL base de la API | `http://localhost:3001/api` |

> ⚠️ Los archivos `.env` no deben commitearse al repositorio.

---

## 📚 Documentación y Pruebas

La carpeta `docs/` contiene la documentación completa del proyecto:

| Documento | Descripción |
|---|---|
| [`docs/casos_de_prueba.md`](docs/casos_de_prueba.md) | 49 casos de prueba (CP) especificados para todos los módulos |
| [`docs/informe_resultados_pruebas.md`](docs/informe_resultados_pruebas.md) | Informe de ejecución: 44/49 pasados (89.8%), 3 defectos documentados |
| [`docs/SCM.md`](docs/SCM.md) | Gestión de Configuración del Software — elementos, versiones, proceso de cambios |
| [`CHANGELOG.md`](CHANGELOG.md) | Historial detallado de cambios por versión |

### Resultados de Pruebas (Resumen)

| Módulo | CPs | ✅ | ❌ |
|---|---|---|---|
| Health Check | 1 | 1 | 0 |
| Categorías | 3 | 3 | 0 |
| Productos API | 15 | 14 | 1 |
| Órdenes API | 7 | 7 | 0 |
| Frontend Quiosco | 9 | 9 | 0 |
| Frontend Admin | 11 | 9 | 2 |
| Utilidades | 3 | 2 | 1 |
| **Total** | **49** | **45** | **4** |

---

## ⚠️ Defectos Conocidos

| ID | Severidad | Descripción |
|---|---|---|
| DEF-001 | MEDIA | Multer retorna HTTP 500 en lugar de 400 al rechazar tipo de archivo inválido |
| DEF-002 | BAJA | Pantalla de "producto no encontrado" no tiene link de retorno al listado |

---

## 🔜 Próximas Versiones

- **v2.1.0** — Correcciones DEF-001 y DEF-002; tests automatizados con Vitest
- **v2.2.0** — Autenticación JWT en panel de administración
- **v3.0.0** — Soporte multi-sucursal; reportes de ventas

---

*QUIOSKO v2.0.0 — Última actualización: 2026-06-30*
