# Personalización de Marca (White-Label) — Guía de integración

Convierte el sistema en una plataforma configurable: cada restaurante adapta su
identidad visual (marca, colores, apariencia) y sus datos empresariales desde
**Configuración → Personalización**, sin tocar el código fuente.

La arquitectura ya está preparada para **multiempresa**: el registro de
configuración lleva una `tenantKey` única (hoy `"default"`). Mañana, cada
restaurante tendrá su propia fila con su propia key.

---

## 1. Arquitectura (visión general)

```
Backend (Express + Prisma)                 Frontend (React + Tailwind v4)
─────────────────────────                  ──────────────────────────────
prisma/schema.prisma                       src/theme/
  └─ model RestaurantSettings                ├─ types.ts            (tipos espejo del modelo)
                                             ├─ defaultSettings.ts  (defaults, fuentes, presets)
src/services/settingsService.ts              ├─ colors.ts           (mezcla/contraste/tonos)
  └─ getSettings / updateSettings /          ├─ applyTheme.ts       (escribe variables CSS)
     resetSettings   (Clean Architecture)    └─ ThemeProvider.tsx   (contexto + autosave)

src/routes/settings.ts                     src/services/settingsApi.ts   (cliente REST)
  GET  /api/settings   (público)           src/index.css                 (@theme + clases UI)
  PUT  /api/settings                       src/pages/AdminSettings.tsx    (panel)
  POST /api/settings/reset                 src/components/settings/*      (campos, preview)
  POST /api/settings/upload  (multer)
```

**El truco central:** en Tailwind v4 las utilidades (`bg-primary`, `text-card`,
`border-border`, …) se compilan a `var(--color-*)`. El `ThemeProvider`
sobreescribe esas variables en `<html>` en tiempo de ejecución, por lo que
**toda la app se re-tematiza en vivo, sin recargar y sin colores hardcodeados.**

---

## 2. Base de datos — modelo `RestaurantSettings`

Definido en [`backend/prisma/schema.prisma`](../backend/prisma/schema.prisma).
Incluye todos los campos pedidos (marca, 8 colores, apariencia, empresa) más
`appName`, `currency`, `timezone`, `socialLinks` (JSONB) y `tenantKey`.

### Aplicar el cambio a la base de datos

El proyecto usa **`prisma db push`** (sin historial de migraciones):

```bash
cd backend
npx prisma generate      # regenera el cliente con el nuevo modelo
npx prisma db push       # crea la tabla restaurant_settings
```

> No necesitas seed: la primera vez que se llama a `GET /api/settings`, el
> servicio crea automáticamente la fila `default` con los valores de fábrica.

Si prefieres SQL manual, la definición equivalente está en
[`personalizacion.sql`](./personalizacion.sql).

---

## 3. Backend — API

| Método | Ruta                     | Auth      | Descripción                                   |
|--------|--------------------------|-----------|-----------------------------------------------|
| GET    | `/api/settings`          | Público   | Config actual (el login la usa sin sesión).   |
| PUT    | `/api/settings`          | Admin\*   | Parche parcial; solo campos enviados.         |
| POST   | `/api/settings/reset`    | Admin\*   | Restaura valores de fábrica.                  |
| POST   | `/api/settings/upload`   | Admin\*   | Sube imagen (`file`), devuelve `{ url }`.     |

\* El proyecto valida el rol admin en el frontend (igual que en categorías).
Para reforzarlo en el backend, añade un middleware que lea el rol y protéjelo;
la capa de servicio ya está aislada para ello.

**Validación y saneo** (en `settingsService.ts`): solo se aceptan campos de una
lista blanca; los colores deben ser hex válidos o se ignoran; strings vacíos se
guardan como `null`.

---

## 4. Frontend — cómo se usa

### Proveedor

`ThemeProvider` envuelve la app en [`src/main.tsx`](../src/main.tsx), **por fuera**
de `AuthProvider`, para tematizar incluso la pantalla de login.

### Consumir la configuración en cualquier componente

```tsx
import { useTheme } from '../theme/ThemeProvider';

function Ejemplo() {
  const { settings, mode, logoUrl, update } = useTheme();
  return <h1>{settings.restaurantName}</h1>;
}
```

### Estilizar con tokens semánticos (recomendado)

Usa las utilidades de Tailwind generadas desde `@theme`; **nunca** colores fijos:

| Antes (hardcodeado)      | Ahora (semántico)                    |
|--------------------------|--------------------------------------|
| `bg-white`               | `bg-card`                            |
| `text-gray-900`          | `text-text`                          |
| `text-gray-500`          | `text-text-muted`                    |
| `border-gray-200`        | `border-border`                      |
| `bg-amber-400` (marca)   | `bg-primary` / `bg-brand`            |
| botón azul/rojo/verde    | `.ui-btn .ui-btn-primary/danger/...` |

También hay clases de componente listas en `index.css`: `.ui-card`, `.ui-panel`,
`.ui-input`, `.ui-label`, `.ui-btn(+variantes)`, `.ui-badge-success/warning/danger`.

---

## 5. Panel de administración

Ruta: `/vistas/admin/settings` (protegida por `RequireAdmin`), enlazada desde la
pestaña **Personalización** en `AdminTabs`. Incluye:

- **Sub-pestañas**: Marca · Colores · Apariencia · Empresa.
- **Vista previa en tiempo real** (miniatura de navbar, sidebar, tabla, formulario,
  botones, modal y dashboard) que refleja los cambios al instante.
- **Selector de color** nativo + entrada hex + **paletas rápidas**.
- **Carga de imágenes** (logo, logo oscuro, favicon, portada).
- **Guardado automático** (debounce 700 ms) con indicador de estado.
- **Restaurar valores por defecto**.

---

## 6. Modo oscuro / claro / automático

- `themeMode = 'light' | 'dark' | 'auto'`.
- En **auto** se sigue `prefers-color-scheme` y se reacciona a cambios del sistema.
- En **oscuro**, las superficies (fondo, tarjetas, texto, bordes) se calculan con
  una paleta neutra; los colores de marca se conservan como acentos.
- Se usa `logoUrl` en claro y `darkLogoUrl` (si existe) en oscuro.

---

## 7. Paso a paso para desplegar

1. `cd backend && npx prisma generate && npx prisma db push`
2. Arranca el backend (`npm run dev`) y el frontend (`npm run dev`).
3. Entra como admin → pestaña **Personalización**.
4. Cambia nombre, sube el logo, ajusta colores/tipografía → se guarda solo.
5. Producción: `npm run build` en ambos. Verifica que `VITE_API_URL` apunte al
   backend (las imágenes subidas se sirven desde `/<UPLOADS_DIR>`).

> **Nota Vercel/serverless:** el disco es efímero (`/tmp`). Para persistir logos
> en producción, sustituye el almacenamiento de `multer` por un bucket
> (S3 / Cloudinary / Vercel Blob) y guarda la URL resultante en `logoUrl` — el
> resto del flujo no cambia.

---

## 8. Extender a multiempresa (futuro)

1. Deriva la `tenantKey` del subdominio, del usuario logueado o de una cabecera.
2. Pásala a `getSettings/updateSettings/resetSettings` (ya la aceptan).
3. Cachea por tenant en el `ThemeProvider` si sirves varios en la misma sesión.

El modelo, el servicio y el proveedor ya están diseñados para ese salto.
