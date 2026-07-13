import { Router, Request, Response } from 'express';
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import { put, del } from '@vercel/blob';
import prisma from '../prismaClient';

const router = Router();

// ─── Almacenamiento de imágenes ──────────────────────────────────────────────
// En producción las imágenes van a Vercel Blob (el FS serverless es efímero:
// un archivo guardado en disco desaparece y la imagen se ve rota). Sin token
// (desarrollo local sin configurar), caen al disco como antes.
const BLOB_ENABLED = !!process.env.BLOB_READ_WRITE_TOKEN;
const uploadsDir = process.env.UPLOADS_DIR || (process.env.VERCEL ? '/tmp/uploads' : 'uploads');

// Multer en memoria: el buffer se sube a Blob (o se escribe a disco en local)
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 5 * 1024 * 1024 }, // 5 MB
  fileFilter: (_req, file, cb) => {
    const allowed = /jpeg|jpg|png|webp/;
    const ok = allowed.test(path.extname(file.originalname).toLowerCase()) &&
               allowed.test(file.mimetype);
    ok ? cb(null, true) : cb(new Error('Solo se permiten imágenes (jpg, png, webp)'));
  },
});

// Guarda la imagen y devuelve lo que se persiste en la BD:
// URL pública del Blob en producción, o ruta "uploads/..." en local.
async function saveImage(file: Express.Multer.File): Promise<string> {
  const unique = `${Date.now()}-${Math.round(Math.random() * 1e9)}${path.extname(file.originalname).toLowerCase()}`;
  if (BLOB_ENABLED) {
    const blob = await put(`products/${unique}`, file.buffer, {
      access: 'public',
      contentType: file.mimetype,
    });
    return blob.url;
  }
  if (!fs.existsSync(uploadsDir)) fs.mkdirSync(uploadsDir, { recursive: true });
  fs.writeFileSync(path.join(uploadsDir, unique), file.buffer);
  return `${uploadsDir}/${unique}`;
}

// Borra la imagen anterior si era subida (Blob o disco). Los emojis y las
// imágenes del seed (/products/...) no se tocan.
function deleteImage(image: string | null) {
  if (!image) return;
  if (image.includes('.blob.vercel-storage.com/')) {
    del(image).catch(() => {});
  } else if (image.startsWith(uploadsDir)) {
    fs.unlink(image, () => {});
  }
}

// ─── Helpers ─────────────────────────────────────────────────────────────────
function imageUrl(req: Request, filename: string | null): string | null {
  if (!filename) return null;
  // already a full URL or an emoji (no slash) → return as-is
  if (filename.startsWith('http') || !filename.includes('/')) return filename;
  // paths starting with / are frontend public-folder assets → return as-is
  if (filename.startsWith('/')) return filename;
  // otherwise it's an uploads/ file → build full backend URL
  return `${req.protocol}://${req.get('host')}/${filename}`;
}

// ─── GET /api/products ────────────────────────────────────────────────────────
router.get('/', async (req: Request, res: Response) => {
  try {
    const { search, categoryId, page = '1', limit = '10' } = req.query;

    const where: Record<string, unknown> = {};

    if (search) {
      where.name = { contains: String(search), mode: 'insensitive' };
    }
    if (categoryId) {
      where.categoryId = parseInt(String(categoryId));
    }

    const skip = (parseInt(String(page)) - 1) * parseInt(String(limit));
    const take = parseInt(String(limit));

    const [products, total] = await Promise.all([
      prisma.product.findMany({
        where,
        include: { category: true },
        orderBy: { id: 'asc' },
        skip,
        take,
      }),
      prisma.product.count({ where }),
    ]);

    res.json({
      data: products.map((p) => ({ ...p, image: imageUrl(req, p.image) })),
      total,
      page: parseInt(String(page)),
      totalPages: Math.ceil(total / take),
    });
  } catch (error) {
    res.status(500).json({ error: 'Error al obtener productos' });
  }
});

// ─── GET /api/products/:id ────────────────────────────────────────────────────
router.get('/:id', async (req: Request, res: Response) => {
  try {
    const id = parseInt(req.params.id);
    const product = await prisma.product.findUnique({
      where: { id },
      include: { category: true },
    });
    if (!product) return res.status(404).json({ error: 'Producto no encontrado' });
    res.json({ ...product, image: imageUrl(req, product.image) });
  } catch (error) {
    res.status(500).json({ error: 'Error al obtener producto' });
  }
});

// ─── POST /api/products ───────────────────────────────────────────────────────
router.post('/', upload.single('image'), async (req: Request, res: Response) => {
  try {
    const { name, price, categoryId } = req.body;

    if (!name || !price || !categoryId) {
      return res.status(400).json({ error: 'name, price y categoryId son requeridos' });
    }

    // Verify category exists
    const category = await prisma.category.findUnique({
      where: { id: parseInt(categoryId) },
    });
    if (!category) return res.status(400).json({ error: 'Categoría no encontrada' });

    const imageValue = req.file
      ? await saveImage(req.file)
      : (req.body.imageEmoji ?? null);

    const product = await prisma.product.create({
      data: {
        name: String(name),
        price: parseFloat(price),
        categoryId: parseInt(categoryId),
        image: imageValue,
      },
      include: { category: true },
    });

    res.status(201).json({ ...product, image: imageUrl(req, product.image) });
  } catch (error) {
    res.status(500).json({ error: 'Error al crear producto' });
  }
});

// ─── PUT /api/products/:id ────────────────────────────────────────────────────
router.put('/:id', upload.single('image'), async (req: Request, res: Response) => {
  try {
    const id = parseInt(req.params.id);

    const existing = await prisma.product.findUnique({ where: { id } });
    if (!existing) return res.status(404).json({ error: 'Producto no encontrado' });

    const { name, price, categoryId, imageEmoji } = req.body;

    if (categoryId) {
      const cat = await prisma.category.findUnique({
        where: { id: parseInt(categoryId) },
      });
      if (!cat) return res.status(400).json({ error: 'Categoría no encontrada' });
    }

    // Si suben una imagen nueva, borra la anterior (Blob o disco)
    if (req.file) deleteImage(existing.image);

    const imageValue = req.file
      ? await saveImage(req.file)
      : imageEmoji !== undefined
      ? imageEmoji
      : existing.image;

    const product = await prisma.product.update({
      where: { id },
      data: {
        ...(name && { name: String(name) }),
        ...(price && { price: parseFloat(price) }),
        ...(categoryId && { categoryId: parseInt(categoryId) }),
        image: imageValue,
      },
      include: { category: true },
    });

    res.json({ ...product, image: imageUrl(req, product.image) });
  } catch (error) {
    res.status(500).json({ error: 'Error al actualizar producto' });
  }
});

// ─── DELETE /api/products/:id ─────────────────────────────────────────────────
router.delete('/:id', async (req: Request, res: Response) => {
  try {
    const id = parseInt(req.params.id);

    const existing = await prisma.product.findUnique({ where: { id } });
    if (!existing) return res.status(404).json({ error: 'Producto no encontrado' });

    // Borra la imagen si era subida (Blob o disco)
    deleteImage(existing.image);

    await prisma.product.delete({ where: { id } });
    res.json({ message: 'Producto eliminado correctamente' });
  } catch (error) {
    res.status(500).json({ error: 'Error al eliminar producto' });
  }
});

export default router;
