import { Router, Request, Response } from 'express';
import prisma from '../prismaClient';

const router = Router();

const MP_API = 'https://api.mercadopago.com';

// ─── Configuración de delivery (misma que el frontend) ──────────────────────
const STORE_LOCATION = { lat: -12.0531, lng: -77.0817 };
const RATE_PER_KM = 1.5;
const MAX_DELIVERY_KM = 10;
const ROAD_FACTOR = 1.3;

function haversineKm(a: { lat: number; lng: number }, b: { lat: number; lng: number }): number {
  const R = 6371;
  const dLat = ((b.lat - a.lat) * Math.PI) / 180;
  const dLng = ((b.lng - a.lng) * Math.PI) / 180;
  const s =
    Math.sin(dLat / 2) ** 2 +
    Math.cos((a.lat * Math.PI) / 180) * Math.cos((b.lat * Math.PI) / 180) * Math.sin(dLng / 2) ** 2;
  return 2 * R * Math.asin(Math.sqrt(s));
}

type CartLine = { id: number; quantity: number };

// ─── POST /api/payments/create ───────────────────────────────────────────────
// Crea la preferencia de Checkout Pro. Los precios se recalculan desde la BD
// (el cliente no puede manipularlos). La orden NO se crea aquí: se crea recién
// cuando el pago está aprobado (confirm/webhook).
router.post('/create', async (req: Request, res: Response) => {
  try {
    const token = process.env.MP_ACCESS_TOKEN;
    if (!token) return res.status(500).json({ error: 'Pagos no configurados (falta MP_ACCESS_TOKEN)' });

    const { name, userId, order, delivery } = req.body as {
      name?: string;
      userId?: number;
      order?: CartLine[];
      delivery?: { type: string; address?: string; lat?: number; lng?: number };
    };

    if (!name || !order || !Array.isArray(order) || order.length === 0) {
      return res.status(400).json({ error: 'name y order son requeridos' });
    }

    // Precios reales desde la BD
    const ids = order.map((l) => parseInt(String(l.id)));
    const products = await prisma.product.findMany({ where: { id: { in: ids } } });
    if (products.length !== ids.length) {
      return res.status(400).json({ error: 'Hay productos inválidos en el carrito' });
    }

    const items = order.map((line) => {
      const p = products.find((x) => x.id === line.id)!;
      const qty = Math.max(1, parseInt(String(line.quantity)) || 1);
      return {
        id: String(p.id),
        title: p.name,
        quantity: qty,
        unit_price: Number(p.price),
        currency_id: 'PEN',
      };
    });

    // Delivery: validar y recalcular el cargo en el servidor
    const isDelivery = delivery?.type === 'DELIVERY';
    let distanceKm = 0;
    let deliveryFee = 0;
    if (isDelivery) {
      if (!delivery?.address || delivery.lat == null || delivery.lng == null) {
        return res.status(400).json({ error: 'El delivery requiere dirección y ubicación' });
      }
      const straight = haversineKm(STORE_LOCATION, { lat: Number(delivery.lat), lng: Number(delivery.lng) });
      distanceKm = Math.round(straight * ROAD_FACTOR * 10) / 10;
      if (distanceKm > MAX_DELIVERY_KM) {
        return res.status(400).json({ error: `La ubicación excede el radio de delivery (${MAX_DELIVERY_KM} km)` });
      }
      deliveryFee = Math.round(distanceKm * RATE_PER_KM * 100) / 100;
      if (deliveryFee > 0) {
        items.push({
          id: 'delivery',
          title: `Delivery (${distanceKm} km)`,
          quantity: 1,
          unit_price: deliveryFee,
          currency_id: 'PEN',
        });
      }
    }

    // Payload compacto del pedido; viaja en metadata y se usa al aprobar el pago
    const orderPayload = {
      n: String(name).slice(0, 200),
      u: userId ? parseInt(String(userId)) : null,
      i: order.map((l) => [l.id, Math.max(1, parseInt(String(l.quantity)) || 1)]),
      d: isDelivery
        ? {
            t: 'DELIVERY',
            a: String(delivery!.address).slice(0, 300),
            la: Number(delivery!.lat),
            ln: Number(delivery!.lng),
            k: distanceKm,
            f: deliveryFee,
          }
        : { t: 'PICKUP' },
    };

    // URL del frontend para volver tras el pago
    const origin = req.get('origin') || process.env.FRONTEND_URL || 'http://localhost:5173';
    const backendBase = `${req.protocol}://${req.get('host')}`;

    const prefRes = await fetch(`${MP_API}/checkout/preferences`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({
        items,
        payer: { name: String(name) },
        metadata: { order_json: JSON.stringify(orderPayload) },
        external_reference: `fc-${Date.now()}-${Math.floor(Math.random() * 1e6)}`,
        back_urls: {
          success: `${origin}/vistas/kiosk?mp=success`,
          failure: `${origin}/vistas/kiosk?mp=failure`,
          pending: `${origin}/vistas/kiosk?mp=pending`,
        },
        auto_return: 'approved',
        notification_url: `${backendBase}/api/payments/webhook`,
        statement_descriptor: 'FRESH COFFEE',
      }),
    });

    if (!prefRes.ok) {
      const detail = await prefRes.text().catch(() => '');
      console.error('Error MP preferences:', prefRes.status, detail);
      return res.status(502).json({ error: 'No se pudo iniciar el pago' });
    }

    const pref = (await prefRes.json()) as { id: string; init_point: string };
    res.json({ initPoint: pref.init_point, preferenceId: pref.id });
  } catch (e) {
    console.error('Error en /payments/create:', e);
    res.status(500).json({ error: 'Error al iniciar el pago' });
  }
});

// ─── Núcleo: verificar un pago con MP y registrar la orden (idempotente) ────
async function verifyAndRegister(paymentId: string) {
  const token = process.env.MP_ACCESS_TOKEN;
  if (!token) return { error: 'Pagos no configurados' as string, order: null, status: null };

  // ¿Ya registramos esta compra? (webhook + confirm pueden llegar ambos)
  const existing = await prisma.order.findFirst({
    where: { paymentId: String(paymentId) },
    include: { orderItems: { include: { product: true } } },
  });
  if (existing) return { error: null, order: existing, status: 'approved' };

  const payRes = await fetch(`${MP_API}/v1/payments/${paymentId}`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  if (!payRes.ok) return { error: 'Pago no encontrado en Mercado Pago', order: null, status: null };

  const payment = (await payRes.json()) as {
    status: string;
    transaction_amount: number;
    metadata?: { order_json?: string };
  };

  if (payment.status !== 'approved') {
    return { error: null, order: null, status: payment.status };
  }

  const raw = payment.metadata?.order_json;
  if (!raw) return { error: 'El pago no contiene los datos del pedido', order: null, status: payment.status };

  const p = JSON.parse(raw) as {
    n: string;
    u: number | null;
    i: [number, number][];
    d: { t: string; a?: string; la?: number; ln?: number; k?: number; f?: number };
  };

  const isDelivery = p.d?.t === 'DELIVERY';
  const order = await prisma.order.create({
    data: {
      name: p.n,
      total: payment.transaction_amount,
      userId: p.u ?? null,
      deliveryType: isDelivery ? 'DELIVERY' : 'PICKUP',
      deliveryAddress: isDelivery ? p.d.a ?? null : null,
      deliveryLat: isDelivery ? p.d.la ?? null : null,
      deliveryLng: isDelivery ? p.d.ln ?? null : null,
      distanceKm: isDelivery ? p.d.k ?? null : null,
      deliveryFee: isDelivery ? p.d.f ?? 0 : 0,
      paymentId: String(paymentId),
      paymentStatus: 'approved',
      orderItems: {
        create: p.i.map(([productId, quantity]) => ({ productId, quantity })),
      },
    },
    include: { orderItems: { include: { product: true } } },
  });

  return { error: null, order, status: 'approved' };
}

// ─── POST /api/payments/confirm — el frontend confirma al volver de MP ───────
router.post('/confirm', async (req: Request, res: Response) => {
  try {
    const paymentId = String(req.body.paymentId ?? '');
    if (!paymentId) return res.status(400).json({ error: 'paymentId es requerido' });

    const { error, order, status } = await verifyAndRegister(paymentId);
    if (error) return res.status(400).json({ error });
    if (!order) return res.status(409).json({ error: `El pago aún no está aprobado (estado: ${status})` });

    res.json(order);
  } catch (e) {
    console.error('Error en /payments/confirm:', e);
    res.status(500).json({ error: 'Error al confirmar el pago' });
  }
});

// ─── POST /api/payments/webhook — notificaciones de Mercado Pago ─────────────
// Respaldo por si el cliente cierra el navegador antes de volver: MP nos avisa
// y registramos la orden igual. Siempre respondemos 200 para que no reintente.
router.post('/webhook', async (req: Request, res: Response) => {
  try {
    const type = req.body?.type ?? req.query.type ?? req.query.topic;
    const id = req.body?.data?.id ?? req.query['data.id'] ?? req.query.id;
    if (type === 'payment' && id) {
      await verifyAndRegister(String(id));
    }
  } catch (e) {
    console.error('Error en webhook MP:', e);
  }
  res.sendStatus(200);
});

export default router;
