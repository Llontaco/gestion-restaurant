# 🗂️ Gestión de Configuración del Software (SCM)
## QUIOSKO Gestion Restaurant — v4.0.0

**Documento:** SCM-001  
**Fecha de creación:** 2026-06-24  
**Última actualización:** 2026-06-30  
**Responsable:** Equipo de Desarrollo  

---

## 1. Información del Proyecto

| Campo | Valor |
|---|---|
| **Nombre del producto** | QUIOSKO Gestion Restaurant |
| **Versión actual** | 4.0.0 |
| **Repositorio** | `Llontaco/gestion-restaurant` |
| **Ruta local** | `g:\Programs\Proyectos\gestion-restaurant` |
| **Tipo** | Full-Stack SPA + REST API |

---

## 2. Arquitectura del Sistema

```
gestion-restaurant/
│
├── [FRONTEND]  React 18 + Vite 5 + TypeScript + TailwindCSS 4
│   └── Puerto: 5173 (desarrollo)
│
└── [BACKEND]   Express 4 + TypeScript + Prisma 5 + MySQL
    └── Puerto: 3001 (desarrollo)
```

### 2.1 Diagrama de Dependencias

```
Browser (5173)
    │
    ├── React 18.3.1
    ├── React Router DOM 6.24.1
    ├── TypeScript 5.5.3
    └── Vite 5.3.4
         │
         └── API calls (fetch) ──► Express 4.19.2 (3001)
                                        │
                                        ├── Prisma Client 5.16.0
                                        ├── Multer 1.4.5-lts.1
                                        ├── CORS 2.8.5
                                        └── MySQL 8.x
                                              │
                                              └── Database: gestion_restaurant
```

---

## 3. Elementos de Configuración (EC)

Cada elemento de configuración (EC) es una unidad bajo control de versiones.

### 3.1 Elementos del Frontend

| EC-ID | Archivo | Tipo | Descripción |
|---|---|---|---|
| EC-FE-01 | `src/App.tsx` | Código | Definición de rutas con React Router v6 |
| EC-FE-02 | `src/main.tsx` | Código | Entry point — monta `<App>` con BrowserRouter |
| EC-FE-03 | `src/index.css` | Estilo | Reset y estilos base globales |
| EC-FE-04 | `src/utils.ts` | Código | Utilidades: `formatCurrency`, `getImagePath`, `getCategoryIcon` |
| EC-FE-05 | `src/services/api.ts` | Código | Capa de servicio API (fetch wrapper + tipos TypeScript) |
| EC-FE-06 | `src/components/Logo.tsx` | Componente | Logotipo reutilizable |
| EC-FE-07 | `src/components/AdminSidebar.tsx` | Componente | Sidebar del panel de administración |
| EC-FE-08 | `src/pages/VistasIndex.tsx` | Página | Hub de navegación de vistas |
| EC-FE-09 | `src/pages/KioskMenu.tsx` | Página | Menú público del quiosco + carrito |
| EC-FE-10 | `src/pages/OrdersReady.tsx` | Página | Pantalla de órdenes listas (cocina) |
| EC-FE-11 | `src/pages/AdminOrders.tsx` | Página | Gestión de órdenes (admin) |
| EC-FE-12 | `src/pages/AdminProducts.tsx` | Página | Listado de productos (admin) |
| EC-FE-13 | `src/pages/AdminNewProduct.tsx` | Página | Formulario nuevo producto |
| EC-FE-14 | `src/pages/AdminEditProduct.tsx` | Página | Formulario edición/eliminación producto |
| EC-FE-15 | `package.json` | Configuración | Dependencias y scripts del frontend |
| EC-FE-16 | `tsconfig.json` | Configuración | Compilador TypeScript frontend |
| EC-FE-17 | `vite.config.ts` | Configuración | Configuración de Vite |
| EC-FE-18 | `tailwind.config.js` | Configuración | Configuración de TailwindCSS |
| EC-FE-19 | `.env` | Configuración | Variables de entorno frontend (`VITE_API_URL`) |
| EC-FE-20 | `index.html` | Configuración | HTML base (Vite entry point) |

### 3.2 Elementos del Backend

| EC-ID | Archivo | Tipo | Descripción |
|---|---|---|---|
| EC-BE-01 | `backend/src/server.ts` | Código | Servidor Express, middlewares, rutas y CORS |
| EC-BE-02 | `backend/src/prismaClient.ts` | Código | Singleton del cliente Prisma |
| EC-BE-03 | `backend/src/seed.ts` | Código | Script de datos semilla (categorías + productos) |
| EC-BE-04 | `backend/src/routes/categories.ts` | Código | Endpoints GET categorías |
| EC-BE-05 | `backend/src/routes/products.ts` | Código | Endpoints CRUD productos + upload Multer |
| EC-BE-06 | `backend/src/routes/orders.ts` | Código | Endpoints CRUD órdenes |
| EC-BE-07 | `backend/prisma/schema.prisma` | Esquema | Modelos de base de datos Prisma |
| EC-BE-08 | `backend/package.json` | Configuración | Dependencias y scripts del backend |
| EC-BE-09 | `backend/tsconfig.json` | Configuración | Compilador TypeScript backend |
| EC-BE-10 | `backend/.env` | Configuración | Variables de entorno backend (`DATABASE_URL`, `PORT`, `UPLOADS_DIR`) |

### 3.3 Documentación

| EC-ID | Archivo | Tipo | Descripción |
|---|---|---|---|
| EC-DOC-01 | `README.md` | Documentación | Guía de instalación y uso del proyecto |
| EC-DOC-02 | `CHANGELOG.md` | Documentación | Historial de cambios por versión |
| EC-DOC-03 | `docs/casos_de_prueba.md` | Documentación | Especificación de 49 casos de prueba |
| EC-DOC-04 | `docs/informe_resultados_pruebas.md` | Documentación | Informe de resultados de ejecución de pruebas |
| EC-DOC-05 | `docs/SCM.md` | Documentación | Este documento de gestión de configuración |

### 3.4 Scripts e Infraestructura

| EC-ID | Archivo | Tipo | Descripción |
|---|---|---|---|
| EC-INF-01 | `setup.sh` | Script | Script de instalación y arranque completo |
| EC-INF-02 | `postcss.config.js` | Configuración | PostCSS para TailwindCSS |

---

## 4. Control de Versiones

### 4.1 Estrategia de Ramas (Git)

```
main           ← Versión estable/producción
│
├── develop    ← Integración de features
│   ├── feature/nombre-feature  ← Desarrollo de funcionalidades
│   └── fix/nombre-bug          ← Corrección de bugs
│
└── hotfix/nombre  ← Correcciones urgentes en producción
```

### 4.2 Convención de Commits

Formato: `<tipo>(<alcance>): <descripción>`

| Tipo | Uso |
|---|---|
| `feat` | Nueva funcionalidad |
| `fix` | Corrección de bug |
| `docs` | Cambios en documentación |
| `refactor` | Refactorización sin cambios funcionales |
| `test` | Adición o modificación de pruebas |
| `chore` | Tareas de mantenimiento (deps, configs) |
| `style` | Cambios de formato/estilo |

**Ejemplos:**
```
feat(productos): agregar endpoint DELETE con limpieza de archivo
fix(multer): manejar error de tipo de archivo con status 400
docs(readme): actualizar instrucciones de setup para v2.0.0
test(orders): agregar casos de prueba para orders/complete
```

### 4.3 Historial de Versiones

| Versión | Fecha | Tipo | Descripción |
|---|---|---|---|
| 1.0.0 | 2026-05-19 | Major | Primera versión — frontend con datos mock, sin backend |
| 2.0.0 | 2026-06-30 | Major | Integración backend Express + MySQL + Prisma |

---

## 5. Líneas Base (Baselines)

| ID | Nombre | Versión | Fecha | Descripción |
|---|---|---|---|---|
| BL-001 | Frontend Mock | 1.0.0 | 2026-05-19 | Versión solo-frontend con mockData |
| BL-002 | Full-Stack Integration | 2.0.0 | 2026-06-30 | Integración completa backend + frontend |

---

## 6. Variables de Entorno

### 6.1 Frontend (`gestion-restaurant/.env`)

| Variable | Valor por defecto | Descripción |
|---|---|---|
| `VITE_API_URL` | `http://localhost:3001/api` | URL base de la API del backend |

### 6.2 Backend (`backend/.env`)

| Variable | Valor requerido | Descripción |
|---|---|---|
| `DATABASE_URL` | `mysql://root:PASSWORD@localhost:3306/gestion_restaurant` | Cadena de conexión MySQL |
| `PORT` | `3001` | Puerto del servidor Express |
| `UPLOADS_DIR` | `uploads` | Directorio para imágenes subidas |

> ⚠️ **IMPORTANTE:** Los archivos `.env` nunca deben ser commiteados al repositorio. Agregar a `.gitignore`.

---

## 7. Gestión de Cambios

### Proceso de Cambio

```
1. Solicitud de cambio (SC)
      │
      ▼
2. Análisis de impacto
   - ¿Qué ECs se ven afectados?
   - ¿Qué casos de prueba cubren el EC?
      │
      ▼
3. Aprobación
      │
      ▼
4. Implementación en rama feature/fix
      │
      ▼
5. Ejecución de casos de prueba afectados
      │
      ▼
6. Code review + merge a develop
      │
      ▼
7. Actualización de CHANGELOG y documentación
      │
      ▼
8. Merge a main + tag de versión
```

### Cambios Pendientes (Backlog Técnico)

| SC-ID | Descripción | EC Afectados | CPs Afectados | Prioridad |
|---|---|---|---|---|
| SC-001 | Corregir manejo de errores Multer (DEF-001) | EC-BE-05 | CP-PROD-11 | MEDIA |
| SC-002 | Mejorar UX en producto no encontrado (DEF-002) | EC-FE-14 | CP-ADMIN-PROD-07 | BAJA |
| SC-003 | Agregar autenticación al panel admin | EC-FE-07, EC-BE-01 | CP-ADMIN-* | ALTA |
| SC-004 | Tests automatizados (Jest/Vitest) | Nuevos archivos `*.test.ts` | Todos | ALTA |

---

## 8. Procedimiento de Build y Despliegue

### 8.1 Entorno de Desarrollo

```bash
# 1. Clonar el repositorio
git clone https://github.com/Llontaco/gestion-restaurant.git
cd gestion-restaurant

# 2. Configurar base de datos MySQL
# Crear la BD: CREATE DATABASE gestion_restaurant;
# Editar backend/.env con credenciales

# 3. Instalar y preparar el backend
cd backend
npm install
npx prisma generate
npx prisma migrate dev --name init
npx ts-node src/seed.ts
npm run dev    # Puerto 3001

# 4. En otra terminal, instalar y arrancar el frontend
cd ..
npm install
npm run dev    # Puerto 5173
```

### 8.2 Scripts Disponibles

**Backend (`backend/`):**

| Script | Comando | Descripción |
|---|---|---|
| Desarrollo | `npm run dev` | Hot reload con ts-node-dev |
| Build | `npm run build` | Compilar TypeScript → dist/ |
| Inicio producción | `npm start` | Ejecutar dist/server.js |
| Migrar BD | `npm run db:migrate` | Crear/aplicar migraciones Prisma |
| Generar cliente | `npm run db:generate` | Regenerar Prisma Client |
| Seed | `npm run db:seed` | Insertar datos iniciales |
| Prisma Studio | `npm run db:studio` | GUI web para la BD |

**Frontend (raíz):**

| Script | Comando | Descripción |
|---|---|---|
| Desarrollo | `npm run dev` | Servidor Vite en modo dev |
| Build | `npm run build` | Bundle de producción en dist/ |
| Preview | `npm run preview` | Preview del build de producción |

---

## 9. Dependencias del Sistema

### 9.1 Dependencias de Producción — Backend

| Paquete | Versión | Propósito |
|---|---|---|
| `express` | ^4.19.2 | Framework HTTP |
| `@prisma/client` | ^5.16.0 | ORM — cliente de base de datos |
| `cors` | ^2.8.5 | Middleware CORS |
| `multer` | ^1.4.5-lts.1 | Middleware para multipart/form-data (upload) |
| `dotenv` | ^17.4.2 | Carga de variables de entorno |

### 9.2 Dependencias de Desarrollo — Backend

| Paquete | Versión | Propósito |
|---|---|---|
| `prisma` | ^5.16.0 | CLI de Prisma (migraciones, generate) |
| `typescript` | ^5.5.3 | Compilador TypeScript |
| `ts-node-dev` | ^2.0.0 | Servidor de desarrollo con hot reload |
| `@types/express` | ^4.17.21 | Tipos TypeScript para Express |
| `@types/cors` | ^2.8.17 | Tipos TypeScript para CORS |
| `@types/multer` | ^1.4.12 | Tipos TypeScript para Multer |
| `@types/node` | ^20.14.9 | Tipos TypeScript para Node.js |

### 9.3 Dependencias de Producción — Frontend

| Paquete | Versión | Propósito |
|---|---|---|
| `react` | ^18.3.1 | Biblioteca de UI |
| `react-dom` | ^18.3.1 | Renderizado en el navegador |
| `react-router-dom` | ^6.24.1 | Navegación SPA |

### 9.4 Dependencias de Desarrollo — Frontend

| Paquete | Versión | Propósito |
|---|---|---|
| `vite` | ^5.3.4 | Bundler y servidor de desarrollo |
| `@vitejs/plugin-react` | ^4.3.1 | Plugin React para Vite |
| `typescript` | ^5.5.3 | Compilador TypeScript |
| `tailwindcss` | ^4.3.0 | Framework CSS utilitario |
| `@types/react` | ^18.3.3 | Tipos TypeScript para React |
| `@types/react-dom` | ^18.3.0 | Tipos TypeScript para React DOM |

---

## 10. Esquema de Base de Datos

**Motor:** MySQL 8.x  
**ORM:** Prisma 5  
**BD:** `gestion_restaurant`

### Modelos

```prisma
model Category {
  id       Int       @id @default(autoincrement())
  name     String    @unique @db.VarChar(100)
  icon     String    @db.VarChar(10)
  products Product[]
  @@map("categories")
}

model Product {
  id         Int            @id @default(autoincrement())
  name       String         @db.VarChar(200)
  price      Decimal        @db.Decimal(10, 2)
  image      String?        @db.VarChar(500)
  categoryId Int
  category   Category       @relation(fields: [categoryId], references: [id])
  orderItems OrderProduct[]
  createdAt  DateTime       @default(now())
  updatedAt  DateTime       @updatedAt
  @@map("products")
}

model Order {
  id           Int            @id @default(autoincrement())
  name         String         @db.VarChar(200)
  total        Decimal        @db.Decimal(10, 2)
  status       Boolean        @default(false)
  orderReadyAt DateTime?
  createdAt    DateTime       @default(now())
  orderItems   OrderProduct[]
  @@map("orders")
}

model OrderProduct {
  id        Int     @id @default(autoincrement())
  orderId   Int
  order     Order   @relation(fields: [orderId], references: [id])
  productId Int
  product   Product @relation(fields: [productId], references: [id])
  quantity  Int
  @@map("order_products")
}
```

---

## 11. Rutas de la API

| Método | Ruta | Descripción | EC |
|---|---|---|---|
| GET | `/api/health` | Health check del servidor | EC-BE-01 |
| GET | `/api/categories` | Listar todas las categorías | EC-BE-04 |
| GET | `/api/categories/:id` | Obtener categoría por ID | EC-BE-04 |
| GET | `/api/products` | Listar con paginación y búsqueda | EC-BE-05 |
| GET | `/api/products/:id` | Obtener producto por ID | EC-BE-05 |
| POST | `/api/products` | Crear producto (multipart/form-data) | EC-BE-05 |
| PUT | `/api/products/:id` | Actualizar producto (multipart/form-data) | EC-BE-05 |
| DELETE | `/api/products/:id` | Eliminar producto | EC-BE-05 |
| GET | `/api/orders/pending` | Órdenes pendientes | EC-BE-06 |
| GET | `/api/orders/ready` | Últimas 5 órdenes listas | EC-BE-06 |
| POST | `/api/orders` | Crear nueva orden | EC-BE-06 |
| PUT | `/api/orders/:id/complete` | Marcar orden como completada | EC-BE-06 |

---

## 12. Rutas del Frontend (React Router)

| Ruta | Componente | EC | Descripción |
|---|---|---|---|
| `/` | Redirect → `/vistas` | EC-FE-01 | Redirección automática |
| `/vistas` | `VistasIndex` | EC-FE-08 | Hub de navegación |
| `/vistas/kiosk` | `KioskMenu` | EC-FE-09 | Menú del quiosco |
| `/vistas/orders-ready` | `OrdersReady` | EC-FE-10 | Pantalla cocina |
| `/vistas/admin/orders` | `AdminOrders` | EC-FE-11 | Admin órdenes |
| `/vistas/admin/products` | `AdminProducts` | EC-FE-12 | Admin productos |
| `/vistas/admin/products/new` | `AdminNewProduct` | EC-FE-13 | Crear producto |
| `/vistas/admin/products/:id/edit` | `AdminEditProduct` | EC-FE-14 | Editar/eliminar producto |

---

*Documento generado el 2026-06-30 como parte del proceso de gestión de configuración de software de QUIOSKO v2.0.0*
