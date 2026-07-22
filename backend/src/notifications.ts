import nodemailer from 'nodemailer';

// ─── Notificaciones al cliente cuando su pago es aprobado ────────────────────
// Ambos canales son opcionales: si faltan las variables de entorno, se omiten
// sin afectar el registro de la orden.
//
//  WhatsApp (Meta Cloud API):  WHATSAPP_TOKEN + WHATSAPP_PHONE_ID
//  Correo (Gmail):             GMAIL_USER + GMAIL_APP_PASSWORD

type OrderLike = {
  code: string | null;
  name: string;
  total: unknown;
  deliveryType: string;
  deliveryAddress: string | null;
  deliveryFee: unknown;
  distanceKm: number | null;
  orderItems: { quantity: number; product: { name: string; price: unknown } }[];
};

function formatPEN(n: unknown): string {
  return `S/ ${Number(n).toFixed(2)}`;
}

function orderSummaryText(order: OrderLike): string {
  const lines = order.orderItems.map(
    (i) => `• ${i.quantity}x ${i.product.name} — ${formatPEN(Number(i.product.price) * i.quantity)}`
  );
  const entrega =
    order.deliveryType === 'DELIVERY'
      ? `🛵 Delivery a: ${order.deliveryAddress} (${order.distanceKm} km, envío ${formatPEN(order.deliveryFee)})`
      : '🏪 Recojo en local: Fresh Coffee — Puerta 1 UNMSM';
  return [
    `¡Hola ${order.name}! Tu pago fue aprobado y tu pedido *${order.code ?? ''}* está confirmado y en preparación. 🎉`,
    '',
    'Tu pedido:',
    ...lines,
    '',
    `Total: ${formatPEN(order.total)}`,
    entrega,
    '',
    'Gracias por tu compra — Fresh Coffee ☕',
  ].join('\n');
}

// ─── WhatsApp vía Meta Cloud API ─────────────────────────────────────────────
async function sendWhatsApp(phone: string, body: string): Promise<void> {
  const token = process.env.WHATSAPP_TOKEN;
  const phoneId = process.env.WHATSAPP_PHONE_ID;
  if (!token || !phoneId) return;

  const digits = phone.replace(/\D/g, '');
  if (digits.length < 7) return;
  // Números peruanos de 9 dígitos: anteponer el código de país
  const to = digits.length === 9 ? `51${digits}` : digits;

  const res = await fetch(`https://graph.facebook.com/v20.0/${phoneId}/messages`, {
    method: 'POST',
    headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({
      messaging_product: 'whatsapp',
      to,
      type: 'text',
      text: { body },
    }),
  });
  if (!res.ok) {
    console.error('WhatsApp no enviado:', res.status, await res.text().catch(() => ''));
  }
}

// ─── Correo vía Gmail (contraseña de aplicación) ─────────────────────────────
async function sendEmail(email: string, order: OrderLike, text: string): Promise<void> {
  const user = process.env.GMAIL_USER;
  const pass = process.env.GMAIL_APP_PASSWORD;
  if (!user || !pass || !email.includes('@')) return;

  const transporter = nodemailer.createTransport({ service: 'gmail', auth: { user, pass } });

  const items = order.orderItems
    .map(
      (i) =>
        `<tr><td style="padding:6px 12px">${i.quantity}x ${i.product.name}</td>` +
        `<td style="padding:6px 12px;text-align:right">${formatPEN(Number(i.product.price) * i.quantity)}</td></tr>`
    )
    .join('');
  const entrega =
    order.deliveryType === 'DELIVERY'
      ? `🛵 Delivery a: ${order.deliveryAddress}`
      : '🏪 Recojo en local: Fresh Coffee — Puerta 1 UNMSM';

  await transporter.sendMail({
    from: `"Fresh Coffee" <${user}>`,
    to: email,
    subject: `✅ Pedido ${order.code ?? ''} confirmado — Fresh Coffee`,
    text,
    html: `
      <div style="font-family:Arial,sans-serif;max-width:520px;margin:auto">
        <h2>¡Gracias por tu compra, ${order.name}!</h2>
        <p>Tu pago fue aprobado y tu pedido <b>${order.code ?? ''}</b> está confirmado y en preparación. 🎉</p>
        <table style="border-collapse:collapse;width:100%;background:#faf7f2;border-radius:8px">${items}</table>
        <p style="font-size:18px"><b>Total: ${formatPEN(order.total)}</b></p>
        <p>${entrega}</p>
        <p style="color:#888;font-size:12px">Fresh Coffee — este correo es automático, no respondas.</p>
      </div>`,
  });
}

// ─── Punto de entrada: notificar pedido confirmado ───────────────────────────
// Nunca lanza: las notificaciones no deben romper el registro del pago.
export async function notifyOrderConfirmed(
  order: OrderLike,
  phone: string | null,
  email: string | null
): Promise<void> {
  const text = orderSummaryText(order);
  const tasks: Promise<void>[] = [];
  if (phone) tasks.push(sendWhatsApp(phone, text));
  if (email) tasks.push(sendEmail(email, order, text));
  if (tasks.length === 0) return;
  const results = await Promise.allSettled(tasks);
  for (const r of results) {
    if (r.status === 'rejected') console.error('Error enviando notificación:', r.reason);
  }
}
