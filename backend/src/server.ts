import express from 'express';
import cors from 'cors';
import path from 'path';
import 'dotenv/config';

import categoriesRouter from './routes/categories';
import productsRouter from './routes/products';
import ordersRouter from './routes/orders';
import authRouter from './routes/auth';
import chatRouter from './routes/chat';
import paymentsRouter from './routes/payments';
import settingsRouter from './routes/settings';

const app = express();

// Detrás del proxy de Vercel: sin esto req.protocol sería "http" y la URL del
// webhook que le damos a Mercado Pago apuntaría a http:// (MP no sigue el
// redirect a https y la notificación se pierde).
app.set('trust proxy', 1);

const PORT = process.env.PORT || 3001;
const uploadsDir = process.env.UPLOADS_DIR || 'uploads';

// ─── Middlewares ──────────────────────────────────────────────────────────────
// Orígenes permitidos: localhost (dev) + FRONTEND_URL (prod) + cualquier *.vercel.app
const allowedOrigins = [
  'http://localhost:5173',
  'http://localhost:3000',
  process.env.FRONTEND_URL,
].filter(Boolean) as string[];

app.use(cors({
  origin: (origin, cb) => {
    // Permite herramientas sin origin (curl, health checks)
    if (!origin) return cb(null, true);
    let isVercel = false;
    try {
      isVercel = new URL(origin).hostname.endsWith('.vercel.app');
    } catch {
      isVercel = false;
    }
    if (allowedOrigins.includes(origin) || isVercel) return cb(null, true);
    return cb(new Error(`Origen no permitido por CORS: ${origin}`));
  },
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
}));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve uploaded images statically
app.use(`/${uploadsDir}`, express.static(path.join(process.cwd(), uploadsDir)));

// ─── Routes ───────────────────────────────────────────────────────────────────
app.use('/api/auth', authRouter);
app.use('/api/categories', categoriesRouter);
app.use('/api/products', productsRouter);
app.use('/api/orders', ordersRouter);
app.use('/api/chat', chatRouter);
app.use('/api/payments', paymentsRouter);
app.use('/api/settings', settingsRouter);

// Health check
app.get('/api/health', (_req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// ─── Start ────────────────────────────────────────────────────────────────────
// En Vercel (serverless) NO se levanta un servidor: se exporta el `app` como handler.
// Solo escuchamos un puerto en ejecución local / hosts tradicionales.
if (!process.env.VERCEL) {
  app.listen(PORT, () => {
  console.log(`\n🚀 Backend corriendo en: http://localhost:${PORT}`);
  console.log(`📦 API disponible en:    http://localhost:${PORT}/api`);
  console.log(`\nEndpoints disponibles:`);
  console.log(`  POST   /api/auth/register`);
  console.log(`  POST   /api/auth/login`);
  console.log(`  GET    /api/products`);
  console.log(`  GET    /api/products/:id`);
  console.log(`  POST   /api/products`);
  console.log(`  PUT    /api/products/:id`);
  console.log(`  DELETE /api/products/:id`);
  console.log(`  GET    /api/categories`);
  console.log(`  GET    /api/orders/pending`);
  console.log(`  GET    /api/orders/ready`);
  console.log(`  POST   /api/orders`);
  console.log(`  PUT    /api/orders/:id/complete`);
  console.log(`  POST   /api/chat`);
  console.log(`  GET    /api/settings`);
  console.log(`  PUT    /api/settings`);
  console.log(`  POST   /api/settings/upload`);
  console.log(`  GET    /api/health\n`);
  });
}

export default app;
