import { Router, Request, Response } from 'express';
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import { getSettings, updateSettings, resetSettings } from '../services/settingsService';

const router = Router();

// ─── Multer (mismo patrón que products.ts) ────────────────────────────────────
// En Vercel serverless el FS del bundle es de solo lectura; usar /tmp (efímero).
const uploadsDir = process.env.UPLOADS_DIR || (process.env.VERCEL ? '/tmp/uploads' : 'uploads');
try {
  if (!fs.existsSync(uploadsDir)) fs.mkdirSync(uploadsDir, { recursive: true });
} catch (err) {
  console.warn(`No se pudo crear el directorio de uploads (${uploadsDir}):`, err);
}

const storage = multer.diskStorage({
  destination: (_req, _file, cb) => cb(null, uploadsDir),
  filename: (_req, file, cb) => {
    const unique = `${Date.now()}-${Math.round(Math.random() * 1e9)}`;
    cb(null, `branding-${unique}${path.extname(file.originalname)}`);
  },
});

const upload = multer({
  storage,
  limits: { fileSize: 3 * 1024 * 1024 }, // 3 MB
  fileFilter: (_req, file, cb) => {
    // Logos/portada: raster + SVG + ICO (favicon).
    const allowed = /jpeg|jpg|png|webp|svg|x-icon|vnd\.microsoft\.icon|gif/;
    const ok = allowed.test(path.extname(file.originalname).toLowerCase().replace('.', '')) ||
               allowed.test(file.mimetype);
    ok ? cb(null, true) : cb(new Error('Formato no permitido (usa png, jpg, webp, svg o ico)'));
  },
});

function assetUrl(req: Request, filename: string): string {
  return `${req.protocol}://${req.get('host')}/${uploadsDir}/${filename}`;
}

// ─── GET /api/settings ────────────────────────────────────────────────────────
// Público: el login necesita la marca/colores ANTES de autenticar.
router.get('/', async (_req: Request, res: Response) => {
  try {
    const settings = await getSettings();
    res.json(settings);
  } catch (error) {
    console.error('GET /settings', error);
    res.status(500).json({ error: 'Error al obtener la configuración' });
  }
});

// ─── PUT /api/settings ────────────────────────────────────────────────────────
// Parche parcial: solo los campos enviados se actualizan.
router.put('/', async (req: Request, res: Response) => {
  try {
    const settings = await updateSettings(req.body ?? {});
    res.json(settings);
  } catch (error) {
    console.error('PUT /settings', error);
    res.status(500).json({ error: 'Error al guardar la configuración' });
  }
});

// ─── POST /api/settings/reset ─────────────────────────────────────────────────
router.post('/reset', async (_req: Request, res: Response) => {
  try {
    const settings = await resetSettings();
    res.json(settings);
  } catch (error) {
    console.error('POST /settings/reset', error);
    res.status(500).json({ error: 'Error al restaurar la configuración' });
  }
});

// ─── POST /api/settings/upload ────────────────────────────────────────────────
// Sube una imagen (logo, logo oscuro, favicon o portada) y devuelve su URL.
router.post('/upload', upload.single('file'), (req: Request, res: Response) => {
  if (!req.file) return res.status(400).json({ error: 'No se recibió ningún archivo' });
  res.status(201).json({ url: assetUrl(req, req.file.filename) });
});

export default router;
