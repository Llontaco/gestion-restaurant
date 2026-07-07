# Guía de Despliegue (Producción)

Este documento describe el despliegue de **gestion-restaurant** en un entorno público
(no solo local). Todo el stack está alojado en **Vercel**.

## URLs en producción

| Componente | URL |
|------------|-----|
| **Frontend** (React + Vite) | https://gestion-restaurant-roan.vercel.app |
| **Backend** (Express serverless) | https://backend-eight-tau-73.vercel.app |
| **Health check** | https://backend-eight-tau-73.vercel.app/api/health |
| **Base de datos** | PostgreSQL en **Neon** (vía Vercel Postgres) |

## Arquitectura

```
┌─────────────────────────────┐     HTTPS / CORS      ┌──────────────────────────────┐
│   Vercel — Frontend          │ ───────────────────► │   Vercel — Backend (serverless) │
│   gestion-restaurant-roan    │   VITE_API_URL        │   backend-eight-tau-73          │
│   (React + Vite, SPA)        │                       │   (Express en /api/*)           │
└─────────────────────────────┘                       └───────────────┬──────────────┘
                                                                       │ Prisma (POSTGRES_PRISMA_URL)
                                                                       ▼
                                                        ┌──────────────────────────────┐
                                                        │   Neon — PostgreSQL            │
                                                        │   (Vercel Postgres)            │
                                                        └──────────────────────────────┘
```

Son **dos proyectos de Vercel** independientes (frontend y backend), cada uno con su
propio `vercel.json`.

---

## 1. Backend — Express serverless en Vercel

El backend se ejecuta como **función serverless**. Puntos clave de la adaptación:

- [`backend/api/index.ts`](../backend/api/index.ts): punto de entrada que exporta el `app` de Express como handler.
- [`backend/vercel.json`](../backend/vercel.json): `builds` + `routes` envían **todas** las rutas a la función.
- [`backend/src/server.ts`](../backend/src/server.ts): no llama a `app.listen()` cuando corre en Vercel (`process.env.VERCEL`).
- CORS permite `http://localhost:*`, `FRONTEND_URL` y cualquier dominio `*.vercel.app`.
- Las subidas de imágenes (`multer`) usan `/tmp` en Vercel (efímero); el catálogo usa imágenes
  estáticas del frontend, así que no depende de esto.

### Desplegar el backend
```bash
vercel --cwd backend --prod
```

### Base de datos (Neon / Vercel Postgres)
1. En el proyecto **backend** de Vercel → pestaña **Storage** → **Create Database** → **Postgres (Neon)**.
2. Al conectarla al proyecto, Vercel inyecta automáticamente `POSTGRES_PRISMA_URL` y
   `POSTGRES_URL_NON_POOLING` (las que usa Prisma en [`schema.prisma`](../backend/prisma/schema.prisma)).
3. Crear las tablas y cargar datos (una sola vez), con las variables de Neon en el entorno:
   ```bash
   cd backend
   npx prisma db push          # crea las tablas según el schema
   npx ts-node src/seed.ts     # carga datos reales (categorías, productos, órdenes)
   ```

> El `seed.ts` contiene los datos reales exportados de la BD MySQL local original.

---

## 2. Frontend — React + Vite en Vercel

- [`vercel.json`](../vercel.json) (raíz): framework `vite`, build `npm run build`, salida `dist`,
  y `rewrites` para el enrutado SPA de React Router.
- [`.vercelignore`](../.vercelignore): excluye `backend/` para que el proyecto del frontend no
  lo arrastre.
- Variable de entorno: `VITE_API_URL = https://backend-eight-tau-73.vercel.app/api`
  (Vite la embebe en el build).

### Desplegar el frontend
```bash
# en la raíz del proyecto
vercel env add VITE_API_URL production   # valor: https://backend-eight-tau-73.vercel.app/api
vercel --prod
```

---

## 3. Variables de entorno (resumen)

**Frontend (proyecto `gestion-restaurant`)**
```
VITE_API_URL=https://backend-eight-tau-73.vercel.app/api
```

**Backend (proyecto `backend`)** — inyectadas por la integración de Neon:
```
POSTGRES_PRISMA_URL=postgresql://...-pooler...neon.tech/neondb?...   # pooled (runtime)
POSTGRES_URL_NON_POOLING=postgresql://...neon.tech/neondb?...        # directo (migraciones)
```

---

## 4. Verificación post-despliegue

- [x] `GET /api/health` responde `{"status":"ok"}`.
- [x] `GET /api/categories` devuelve las 6 categorías con sus emojis.
- [x] `GET /api/products` devuelve los 12 productos reales.
- [x] `GET /api/orders/pending` y `/ready` devuelven las órdenes sembradas.
- [x] El backend responde con `Access-Control-Allow-Origin` al origen del frontend (CORS OK).
- [x] El frontend (HTTP 200) tiene la URL del backend embebida en el bundle.

## Notas

- Para volver a desplegar tras cambios: `vercel --prod` (frontend) y `vercel --cwd backend --prod`.
- Las imágenes subidas en runtime no persisten en serverless; para producción real se
  recomienda un bucket externo (S3 / Cloudinary) en una iteración futura.
- Los `.env` reales no se versionan (ver `.gitignore`); usar los `.env.example` como plantilla.
