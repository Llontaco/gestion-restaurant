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

    const { name, userId, order, delivery, payer } = req.body as {
      name?: string;
      userId?: number;
      order?: CartLine[];
      delivery?: { type: string; address?: string; lat?: number; lng?: number; phone?: string };
      // Datos opcionales del comprador: mejoran la calidad de la integración
      // y la tasa de aprobación de MP
      payer?: { phone?: string; dni?: string };
    };

    if (!name || !order || !Array.isArray(order) || order.length === 0) {
      return res.status(400).json({ error: 'name y order son requeridos' });
    }

    // Precios reales desde la BD
    const ids = order.map((l) => parseInt(String(l.id)));
    const products = await prisma.product.findMany({
      where: { id: { in: ids } },
      include: { category: true },
    });
    if (products.length !== ids.length) {
      return res.status(400).json({ error: 'Hay productos inválidos en el carrito' });
    }

    const items = order.map((line) => {
      const p = products.find((x) => x.id === line.id)!;
      const qty = Math.max(1, parseInt(String(line.quantity)) || 1);
      return {
        id: String(p.id),
        title: p.name,
        description: `${p.category.name} — Fresh Coffee`,
        category_id: 'food',
        quantity: qty,
        unit_price: Number(p.price),
        currency_id: 'PEN',
      };
    });

    // Email del comprador (si inició sesión): mejora la calidad de la integración
    // y la tasa de aprobación de MP.
    let payerEmail: string | null = null;
    if (userId) {
      const u = await prisma.user.findUnique({ where: { id: parseInt(String(userId)) } });
      payerEmail = u?.email ?? null;
    }

    // Delivery: validar y recalcular el cargo en el servidor
    const isDelivery = delivery?.type === 'DELIVERY';
    let distanceKm = 0;
    let deliveryFee = 0;
    let deliveryPhone = '';
    if (isDelivery) {
      if (!delivery?.address || delivery.lat == null || delivery.lng == null) {
        return res.status(400).json({ error: 'El delivery requiere dirección y ubicación' });
      }
      // Teléfono de contacto para el repartidor (7 a 15 dígitos)
      deliveryPhone = String(delivery.phone ?? '').trim().slice(0, 20);
      const phoneDigits = deliveryPhone.replace(/\D/g, '');
      if (phoneDigits.length < 7 || phoneDigits.length > 15) {
        return res.status(400).json({ error: 'El delivery requiere un teléfono de contacto válido' });
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
          description: 'Envío a domicilio — Fresh Coffee',
          category_id: 'services',
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
            p: deliveryPhone,
            la: Number(delivery!.lat),
            ln: Number(delivery!.lng),
            k: distanceKm,
            f: deliveryFee,
          }
        : { t: 'PICKUP' },
    };

    // ─── Datos del comprador para MP (suben la tasa de aprobación) ───
    // Nombre y apellido a partir del campo único "Tu nombre"
    const nameParts = String(name).trim().split(/\s+/);
    const firstName = nameParts[0];
    const surname = nameParts.slice(1).join(' ');
    // Teléfono: el que escriba en el checkout o, en delivery, el del repartidor
    const payerPhone = String(payer?.phone ?? '').replace(/\D/g, '') ||
                       deliveryPhone.replace(/\D/g, '');
    // DNI peruano: exactamente 8 dígitos; si no, no se envía
    const payerDni = String(payer?.dni ?? '').replace(/\D/g, '');

    const mpPayer = {
      name: firstName,
      ...(surname ? { surname } : {}),
      ...(payerEmail ? { email: payerEmail } : {}),
      ...(payerPhone.length >= 7 ? { phone: { number: payerPhone } } : {}),
      ...(payerDni.length === 8 ? { identification: { type: 'DNI', number: payerDni } } : {}),
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
        payer: mpPayer,
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

// ─── Código público del pedido (ej. "FC-8K3N2A") ────────────────────────────
// Sin 0/O ni 1/I para que sea fácil de leer y dictar por teléfono.
const CODE_CHARS = 'ABCDEFGHJKMNPQRSTUVWXYZ23456789';
function genOrderCode(): string {
  let s = '';
  for (let i = 0; i < 6; i++) s += CODE_CHARS[Math.floor(Math.random() * CODE_CHARS.length)];
  return `FC-${s}`;
}

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
    status_detail?: string;
    transaction_amount: number;
    currency_id?: string;
    payment_method_id?: string;
    payment_type_id?: string;
    installments?: number;
    external_reference?: string;
    payer?: { email?: string | null };
    transaction_details?: { net_received_amount?: number };
    fee_details?: { amount?: number }[];
    metadata?: { order_json?: string };
  };

  // Registrar el pago en la tabla payments, sea cual sea su estado.
  // Upsert: el webhook puede avisar varias veces (pending → approved).
  const feeAmount = (payment.fee_details ?? []).reduce((s, f) => s + (Number(f.amount) || 0), 0);
  const paymentData = {
    status: payment.status,
    statusDetail: payment.status_detail ?? null,
    amount: payment.transaction_amount,
    currency: payment.currency_id ?? 'PEN',
    method: payment.payment_method_id ?? null,
    methodType: payment.payment_type_id ?? null,
    installments: payment.installments ?? null,
    payerEmail: payment.payer?.email ?? null,
    feeAmount: feeAmount || null,
    netAmount: payment.transaction_details?.net_received_amount ?? null,
    externalReference: payment.external_reference ?? null,
  };
  const payRecord = await prisma.payment.upsert({
    where: { mpPaymentId: String(paymentId) },
    update: paymentData,
    create: { mpPaymentId: String(paymentId), ...paymentData },
  });

  if (payment.status !== 'approved') {
    return { error: null, order: null, status: payment.status };
  }

  const raw = payment.metadata?.order_json;
  if (!raw) return { error: 'El pago no contiene los datos del pedido', order: null, status: payment.status };

  const p = JSON.parse(raw) as {
    n: string;
    u: number | null;
    i: [number, number][];
    d: { t: string; a?: string; p?: string; la?: number; ln?: number; k?: number; f?: number };
  };

  const isDelivery = p.d?.t === 'DELIVERY';
  const data = {
    name: p.n,
    total: payment.transaction_amount,
    userId: p.u ?? null,
    deliveryType: isDelivery ? 'DELIVERY' : 'PICKUP',
    deliveryAddress: isDelivery ? p.d.a ?? null : null,
    deliveryPhone: isDelivery ? p.d.p ?? null : null,
    deliveryLat: isDelivery ? p.d.la ?? null : null,
    deliveryLng: isDelivery ? p.d.ln ?? null : null,
    distanceKm: isDelivery ? p.d.k ?? null : null,
    deliveryFee: isDelivery ? p.d.f ?? 0 : 0,
    paymentId: String(paymentId),
    paymentStatus: 'approved',
    orderItems: {
      create: p.i.map(([productId, quantity]) => ({ productId, quantity })),
    },
  };

  // Reintenta si el código aleatorio choca con uno existente; si el conflicto
  // es por paymentId, otro proceso (webhook/confirm) ya registró la orden.
  for (let attempt = 0; attempt < 5; attempt++) {
    try {
      const order = await prisma.order.create({
        data: { ...data, code: genOrderCode() },
        include: { orderItems: { include: { product: true } } },
      });
      // Vincular el registro del pago con la orden creada
      await prisma.payment.update({ where: { id: payRecord.id }, data: { orderId: order.id } });
      return { error: null, order, status: 'approved' };
    } catch (e: any) {
      if (e?.code === 'P2002') {
        const dup = await prisma.order.findFirst({
          where: { paymentId: String(paymentId) },
          include: { orderItems: { include: { product: true } } },
        });
        if (dup) {
          await prisma.payment.update({ where: { id: payRecord.id }, data: { orderId: dup.id } });
          return { error: null, order: dup, status: 'approved' };
        }
        continue; // colisión de código: genera otro
      }
      throw e;
    }
  }
  return { error: 'No se pudo registrar la orden', order: null, status: 'approved' };
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
