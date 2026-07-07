import { Router, Request, Response } from 'express';
import prisma from '../prismaClient';

const router = Router();

// GET /api/categories — listar todas las categorías
router.get('/', async (_req: Request, res: Response) => {
  try {
    const categories = await prisma.category.findMany({
      orderBy: { id: 'asc' },
    });
    res.json(categories);
  } catch (error) {
    res.status(500).json({ error: 'Error al obtener categorías' });
  }
});

// GET /api/categories/:id — obtener una categoría por id
router.get('/:id', async (req: Request, res: Response) => {
  try {
    const id = parseInt(req.params.id);
    const category = await prisma.category.findUnique({ where: { id } });
    if (!category) return res.status(404).json({ error: 'Categoría no encontrada' });
    res.json(category);
  } catch (error) {
    res.status(500).json({ error: 'Error al obtener categoría' });
  }
});

// POST /api/categories — crear categoría (solo admin, validado en el frontend)
router.post('/', async (req: Request, res: Response) => {
  try {
    const name = String(req.body.name ?? '').trim();
    const icon = String(req.body.icon ?? '').trim();

    if (!name) return res.status(400).json({ error: 'El nombre es requerido' });
    if (!icon) return res.status(400).json({ error: 'El ícono (emoji) es requerido' });

    const existing = await prisma.category.findUnique({ where: { name } });
    if (existing) return res.status(409).json({ error: 'Ya existe una categoría con ese nombre' });

    const category = await prisma.category.create({ data: { name, icon } });
    res.status(201).json(category);
  } catch {
    res.status(500).json({ error: 'Error al crear categoría' });
  }
});

// PUT /api/categories/:id — actualizar categoría
router.put('/:id', async (req: Request, res: Response) => {
  try {
    const id = parseInt(req.params.id);
    const existing = await prisma.category.findUnique({ where: { id } });
    if (!existing) return res.status(404).json({ error: 'Categoría no encontrada' });

    const name = req.body.name !== undefined ? String(req.body.name).trim() : existing.name;
    const icon = req.body.icon !== undefined ? String(req.body.icon).trim() : existing.icon;

    if (!name) return res.status(400).json({ error: 'El nombre es requerido' });
    if (!icon) return res.status(400).json({ error: 'El ícono (emoji) es requerido' });

    // Evita duplicar el nombre con otra categoría
    const dup = await prisma.category.findUnique({ where: { name } });
    if (dup && dup.id !== id) {
      return res.status(409).json({ error: 'Ya existe una categoría con ese nombre' });
    }

    const category = await prisma.category.update({ where: { id }, data: { name, icon } });
    res.json(category);
  } catch {
    res.status(500).json({ error: 'Error al actualizar categoría' });
  }
});

// DELETE /api/categories/:id — eliminar categoría (bloqueado si tiene productos)
router.delete('/:id', async (req: Request, res: Response) => {
  try {
    const id = parseInt(req.params.id);
    const existing = await prisma.category.findUnique({ where: { id } });
    if (!existing) return res.status(404).json({ error: 'Categoría no encontrada' });

    const productCount = await prisma.product.count({ where: { categoryId: id } });
    if (productCount > 0) {
      return res.status(409).json({
        error: `No se puede eliminar: la categoría tiene ${productCount} producto(s). Reasígnalos o elimínalos primero.`,
      });
    }

    await prisma.category.delete({ where: { id } });
    res.json({ message: 'Categoría eliminada correctamente' });
  } catch {
    res.status(500).json({ error: 'Error al eliminar categoría' });
  }
});

export default router;
