import express from 'express';
import cors from 'cors';
import path from 'path';
import 'dotenv/config';

import categoriesRouter from './routes/categories';
import productsRouter from './routes/products';

const app = express();
const PORT = process.env.PORT || 3001;
const uploadsDir = process.env.UPLOADS_DIR || 'uploads';

// ─── Middlewares ──────────────────────────────────────────────────────────────
app.use(cors({
  origin: ['http://localhost:5173', 'http://localhost:3000'],
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
}));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve uploaded images statically
app.use(`/${uploadsDir}`, express.static(path.join(process.cwd(), uploadsDir)));

// ─── Routes ───────────────────────────────────────────────────────────────────
app.use('/api/categories', categoriesRouter);
app.use('/api/products', productsRouter);

// Health check
app.get('/api/health', (_req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// ─── Start ────────────────────────────────────────────────────────────────────
app.listen(PORT, () => {
  console.log(`\n🚀 Backend corriendo en: http://localhost:${PORT}`);
  console.log(`📦 API disponible en:    http://localhost:${PORT}/api`);
  console.log(`\nEndpoints disponibles:`);
  console.log(`  GET    /api/products`);
  console.log(`  GET    /api/products/:id`);
  console.log(`  POST   /api/products`);
  console.log(`  PUT    /api/products/:id`);
  console.log(`  DELETE /api/products/:id`);
  console.log(`  GET    /api/categories`);
  console.log(`  GET    /api/health\n`);
});

export default app;
