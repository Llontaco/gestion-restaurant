import { Router, Request, Response } from 'express';
import prisma from '../prismaClient';

const router = Router();

// GET /api/orders/pending — órdenes pendientes (status = false)
router.get('/pending', async (_req: Request, res: Response) => {
  try {
    const orders = await prisma.order.findMany({
      where: { status: false },
      include: {
        orderItems: {
          include: { product: true },
        },
      },
      orderBy: { createdAt: 'asc' },
    });
    res.json(orders);
  } catch {
    res.status(500).json({ error: 'Error al obtener órdenes pendientes' });
  }
});

// GET /api/orders/ready — últimas 5 órdenes completadas (aún no finalizadas)
router.get('/ready', async (_req: Request, res: Response) => {
  try {
    const orders = await prisma.order.findMany({
      where: { orderReadyAt: { not: null }, finalizedAt: null },
      include: {
        orderItems: {
          include: { product: true },
        },
      },
      orderBy: { orderReadyAt: 'desc' },
      take: 5,
    });
    res.json(orders);
  } catch {
    res.status(500).json({ error: 'Error al obtener órdenes listas' });
  }
});

// GET /api/orders/mine?userId=N — historial de pedidos de un cliente
router.get('/mine', async (req: Request, res: Response) => {
  try {
    const userId = parseInt(String(req.query.userId));
    if (!userId || isNaN(userId)) {
      return res.status(400).json({ error: 'userId es requerido' });
    }
    const orders = await prisma.order.findMany({
      where: { userId },
      include: {
        orderItems: {
          include: { product: true },
        },
      },
      orderBy: { createdAt: 'desc' },
      take: 20,
    });
    res.json(orders);
  } catch {
    res.status(500).json({ error: 'Error al obtener tus pedidos' });
  }
});

// POST /api/orders — crear nueva orden
router.post('/', async (req: Request, res: Response) => {
  try {
    const { name, total, order, userId } = req.body;

    if (!name || !total || !order || !Array.isArray(order) || order.length === 0) {
      return res.status(400).json({ error: 'name, total y order son requeridos' });
    }

    const newOrder = await prisma.order.create({
      data: {
        name: String(name),
        total: parseFloat(total),
        userId: userId ? parseInt(userId) : null,
        orderItems: {
          create: order.map((item: { id: number; quantity: number }) => ({
            productId: item.id,
            quantity: item.quantity,
          })),
        },
      },
      include: {
        orderItems: {
          include: { product: true },
        },
      },
    });

    res.status(201).json(newOrder);
  } catch {
    res.status(500).json({ error: 'Error al crear la orden' });
  }
});

// PUT /api/orders/:id/complete — marcar orden como completada
router.put('/:id/complete', async (req: Request, res: Response) => {
  try {
    const id = parseInt(req.params.id);
    const existing = await prisma.order.findUnique({ where: { id } });
    if (!existing) return res.status(404).json({ error: 'Orden no encontrada' });

    const order = await prisma.order.update({
      where: { id },
      data: {
        status: true,
        orderReadyAt: new Date(),
      },
    });

    res.json(order);
  } catch {
    res.status(500).json({ error: 'Error al completar la orden' });
  }
});

// PUT /api/orders/:id/finalize — marcar orden lista como entregada (sale del display)
router.put('/:id/finalize', async (req: Request, res: Response) => {
  try {
    const id = parseInt(req.params.id);
    const existing = await prisma.order.findUnique({ where: { id } });
    if (!existing) return res.status(404).json({ error: 'Orden no encontrada' });

    const order = await prisma.order.update({
      where: { id },
      data: { finalizedAt: new Date() },
    });

    res.json(order);
  } catch {
    res.status(500).json({ error: 'Error al finalizar la orden' });
  }
});

export default router;
