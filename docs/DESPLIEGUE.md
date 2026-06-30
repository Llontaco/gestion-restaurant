# Guía de Despliegue (Staging / Producción)

Este documento describe cómo se despliega **gestion-restaurant** en un entorno público,
no solo local. La arquitectura se divide en dos servicios:

| Componente | Tecnología            | Plataforma de despliegue |
|------------|-----------------------|--------------------------|
| Frontend   | React + Vite          | **Vercel**               |
| Backend    | Express + Prisma      | **Railway**              |
| Base datos | MySQL                 | **Railway** (plugin)     |

```
┌──────────────┐      HTTPS       ┌──────────────────┐      MySQL      ┌──────────────┐
│   Vercel     │ ───────────────► │     Railway      │ ──────────────► │   Railway    │
│  (Frontend)  │   VITE_API_URL   │  (Backend API)   │  DATABASE_URL   │  (MySQL DB)  │
└──────────────┘                  └──────────────────┘                 └──────────────┘
```

---

## 1. Backend + Base de datos en Railway

1. Entra a <https://railway.app> e inicia sesión con GitHub.
2. **New Project → Deploy from GitHub repo** → selecciona `Llontaco/gestion-restaurant`.
3. En el servicio creado, **Settings → Root Directory** = `backend`.
4. **New → Database → Add MySQL**. Railway crea la base y expone su URL.
5. En el servicio del backend, pestaña **Variables**, añade:

   | Variable       | Valor                                                        |
   |----------------|--------------------------------------------------------------|
   | `DATABASE_URL` | Referencia a la variable `MYSQL_URL` del plugin MySQL        |
   | `FRONTEND_URL` | La URL de Vercel (la obtienes en el paso 2 del frontend)     |
   | `UPLOADS_DIR`  | `uploads`                                                    |

   > `PORT` lo inyecta Railway automáticamente; no lo definas a mano.

6. Railway ejecutará automáticamente:
   - `npm install` → `postinstall` corre `prisma generate`
   - `npm run build` → `prisma generate && tsc`
   - `npm start` → `prisma migrate deploy && node dist/server.js`
7. Cuando termine, **Settings → Networking → Generate Domain** para obtener la URL pública,
   p. ej. `https://gestion-restaurant-production.up.railway.app`.
8. **Sembrar datos de ejemplo** (categorías y productos). En la pestaña del servicio,
   abre una shell (o usa `railway run`) y ejecuta:
   ```bash
   npm run db:seed:prod
   ```

Verifica el backend abriendo `https://<tu-backend>.up.railway.app/api/health`
→ debe responder `{"status":"ok",...}`.

---

## 2. Frontend en Vercel

Con la URL del backend ya disponible:

```bash
# desde la raíz del proyecto
vercel link            # vincula el proyecto (una sola vez)
vercel env add VITE_API_URL production
# valor: https://<tu-backend>.up.railway.app/api

vercel --prod          # despliegue a producción
```

Vercel detecta el framework (Vite), ejecuta `npm run build` y publica `dist/`.
El archivo [`vercel.json`](../vercel.json) reescribe las rutas al `index.html`
para que funcione el enrutado SPA de React Router.

> Tras obtener la URL final de Vercel, recuerda ponerla en la variable
> `FRONTEND_URL` del backend (Railway) para que el CORS la permita.

---

## 3. Variables de entorno (resumen)

**Frontend (Vercel)**
```
VITE_API_URL=https://<tu-backend>.up.railway.app/api
```

**Backend (Railway)**
```
DATABASE_URL=mysql://usuario:password@host:puerto/db   # del plugin MySQL
FRONTEND_URL=https://<tu-frontend>.vercel.app
UPLOADS_DIR=uploads
```

---

## 4. Verificación post-despliegue

- [ ] `GET /api/health` responde `ok`.
- [ ] El frontend carga categorías y productos (datos del seed).
- [ ] Se puede crear una orden y verla en "órdenes pendientes".
- [ ] No hay errores de CORS en la consola del navegador.

## Notas

- Las imágenes subidas se guardan en el filesystem del backend (`uploads/`).
  En Railway persisten mientras el servicio no se reconstruya; para almacenamiento
  permanente se recomienda un bucket externo (S3/Cloudinary) en una iteración futura.
- Los archivos `.env` reales **no** se versionan (ver `.gitignore`); usa los
  `.env.example` como plantilla.
