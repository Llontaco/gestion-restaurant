# 🍔 Gestion Restaurant — Backend + Frontend

Sistema de gestión de restaurante con CRUD completo de productos.

---

## 🏗️ Estructura del proyecto

```
gestion-restaurant/          ← tu proyecto frontend (original)
├── src/
│   ├── services/
│   │   └── api.ts           ← NUEVO: servicio API
│   ├── pages/
│   │   ├── AdminProducts.tsx     ← REEMPLAZAR con el patch
│   │   ├── AdminNewProduct.tsx   ← REEMPLAZAR con el patch
│   │   └── AdminEditProduct.tsx  ← REEMPLAZAR con el patch
│   └── ...
├── .env                     ← NUEVO: VITE_API_URL
└── package.json

backend/                     ← NUEVO: carpeta del backend
├── src/
│   ├── routes/products.ts   ← CRUD completo
│   ├── routes/categories.ts ← GET categorías
│   ├── server.ts
│   ├── prismaClient.ts
│   └── seed.ts
├── prisma/schema.prisma
└── .env                     ← DATABASE_URL aquí

frontend-patches/            ← Archivos para copiar al frontend
setup.sh                     ← Script para correr todo
```

---

## 🚀 Setup con UN comando

### Prerequisito — Crear la base de datos en MySQL Workbench

```sql
CREATE DATABASE gestion_restaurant;
```

### Configurar credenciales

Edita `backend/.env`:
```env
DATABASE_URL="mysql://root:TU_PASSWORD@localhost:3306/gestion_restaurant"
```

### Copiar archivos al frontend

```bash
# Ejecutar desde la carpeta que contiene gestion-restaurant/ y backend/
mkdir -p gestion-restaurant/src/services
cp frontend-patches/api.ts               gestion-restaurant/src/services/api.ts
cp frontend-patches/AdminProducts.tsx    gestion-restaurant/src/pages/AdminProducts.tsx
cp frontend-patches/AdminNewProduct.tsx  gestion-restaurant/src/pages/AdminNewProduct.tsx
cp frontend-patches/AdminEditProduct.tsx gestion-restaurant/src/pages/AdminEditProduct.tsx
cp frontend-patches/.env                 gestion-restaurant/.env
```

### Correr todo

```bash
bash setup.sh
```

O manualmente en dos terminales:

```bash
# Terminal 1 — Backend
cd backend
npm install
npx prisma generate
npx prisma migrate dev --name init
npx ts-node src/seed.ts
npm run dev

# Terminal 2 — Frontend
cd gestion-restaurant
npm install
npm run dev
```

---

## 📡 API Endpoints

| Método | Ruta | Descripción |
|--------|------|-------------|
| GET | `/api/products` | Lista con paginación y búsqueda |
| GET | `/api/products/:id` | Producto por ID |
| POST | `/api/products` | Crear (multipart/form-data) |
| PUT | `/api/products/:id` | Editar (multipart/form-data) |
| DELETE | `/api/products/:id` | Eliminar |
| GET | `/api/categories` | Lista categorías |

### Parámetros de búsqueda

```
GET /api/products?search=hamburguesa&categoryId=1&page=1&limit=10
```

---

## 🗂️ Modelos (Prisma)

```prisma
model Category {
  id       Int       @id @default(autoincrement())
  name     String    @unique
  icon     String
  products Product[]
}

model Product {
  id         Int      @id @default(autoincrement())
  name       String
  price      Decimal
  image      String?  // URL o emoji
  categoryId Int
  category   Category @relation(...)
}
```

---

## 🛠️ Scripts backend

```bash
npm run dev          # Hot reload con ts-node-dev
npm run db:migrate   # Crear tablas
npm run db:seed      # Datos de prueba
npm run db:studio    # Prisma Studio (GUI)
```
