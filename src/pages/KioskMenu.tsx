import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Navbar from '../components/Navbar';
import ChatWidget from '../components/ChatWidget';
import {
  CartIcon,
  BasketIcon,
  LockIcon,
  InfoIcon,
  TruckIcon,
  PlusIcon,
  MinusIcon,
  XIcon,
  CategoryIcon,
} from '../components/icons';
import { getCategories, getProducts, createPaymentPreference, confirmPayment } from '../services/api';
import { getImagePath, formatCurrency } from '../utils';
import { useAuth } from '../context/AuthContext';
import DeliveryMapPicker, { RATE_PER_KM, MAX_DELIVERY_KM } from '../components/DeliveryMapPicker';
import type { DeliverySelection } from '../components/DeliveryMapPicker';
import type { Category, Product, CartItem } from '../services/api';

export default function KioskMenu() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [categories, setCategories] = useState<Category[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [activeCategoryId, setActiveCategoryId] = useState<number | null>(null);
  const [cart, setCart] = useState<CartItem[]>([]);
  const [clientName, setClientName] = useState('');
  const [confirmed, setConfirmed] = useState(false);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  // Feedback visual al agregar un producto (id del último agregado)
  const [addedId, setAddedId] = useState<number | null>(null);
  // ─── Entrega: recojo en local o delivery ───
  const [deliveryMode, setDeliveryMode] = useState<'PICKUP' | 'DELIVERY'>('PICKUP');
  const [deliverySel, setDeliverySel] = useState<DeliverySelection | null>(null);
  const [deliveryAddress, setDeliveryAddress] = useState('');
  const [deliveryPhone, setDeliveryPhone] = useState('');
  const [feeAccepted, setFeeAccepted] = useState(false);
  // DNI opcional del comprador: mejora la tasa de aprobación en Mercado Pago
  const [payerDni, setPayerDni] = useState('');
  // Correo del comprador: MP lo exige en la preferencia para bajar el score de
  // riesgo (cc_rejected_high_risk). Los usuarios logueados usan el de su cuenta.
  const [payerEmail, setPayerEmail] = useState('');
  // ─── Pago (Mercado Pago) ───
  const [paidTotal, setPaidTotal] = useState<number | null>(null); // total del pedido ya pagado
  const [paidCode, setPaidCode] = useState<string | null>(null);   // código único del pedido pagado
  const [confirmingPay, setConfirmingPay] = useState(false);       // verificando pago al volver de MP

  useEffect(() => {
    async function load() {
      const { categories: cats, error: err } = await getCategories();
      if (err) { setError(err); }
      else {
        setCategories(cats);
        if (cats.length > 0) setActiveCategoryId(cats[0].id);
      }
      setLoading(false);
    }
    load();
  }, []);

  // ─── Retorno desde Mercado Pago ───
  // MP nos devuelve a /vistas/kiosk?mp=success|failure|pending&payment_id=...
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const mp = params.get('mp');
    if (!mp) return;

    // Limpia la URL (evita re-procesar al refrescar)
    window.history.replaceState({}, '', window.location.pathname);

    const restoreCheckout = () => {
      try {
        const raw = localStorage.getItem('fc_pending_checkout');
        if (!raw) return;
        const saved = JSON.parse(raw);
        setCart(saved.cart ?? []);
        setClientName(saved.clientName ?? '');
        setDeliveryMode(saved.deliveryMode ?? 'PICKUP');
        setDeliverySel(saved.deliverySel ?? null);
        setDeliveryAddress(saved.deliveryAddress ?? '');
        setDeliveryPhone(saved.deliveryPhone ?? '');
        setPayerDni(saved.payerDni ?? '');
        setPayerEmail(saved.payerEmail ?? '');
        setFeeAccepted(false);
      } catch { /* carrito no recuperable */ }
    };

    if (mp === 'success') {
      const paymentId = params.get('payment_id') || params.get('collection_id');
      if (!paymentId) { restoreCheckout(); setError('No se recibió el pago. Intenta de nuevo.'); return; }
      setConfirmingPay(true);
      confirmPayment(paymentId).then(({ order, error: err }) => {
        setConfirmingPay(false);
        if (order) {
          localStorage.removeItem('fc_pending_checkout');
          setClientName(order.name);
          setPaidTotal(Number(order.total));
          setPaidCode(order.code ?? null);
          setConfirmed(true);
        } else {
          restoreCheckout();
          setError(err ?? 'No se pudo verificar el pago. Si te cobraron, contáctanos.');
        }
      });
    } else {
      // failure o pending: registramos el intento en el backend (queda en la
      // tabla payments con su motivo) y restauramos el carrito para reintentar
      const paymentId = params.get('payment_id') || params.get('collection_id');
      if (paymentId && paymentId !== 'null') void confirmPayment(paymentId);
      restoreCheckout();
      setError(
        mp === 'pending'
          ? 'Tu pago quedó pendiente. Cuando se apruebe, tu pedido aparecerá en "Mis Pedidos".'
          : 'El pago no se completó. Puedes intentarlo de nuevo.'
      );
    }
  }, []);

  useEffect(() => {
    if (!activeCategoryId) return;
    getProducts(undefined, activeCategoryId, 1, 50).then(({ products: prods }) => setProducts(prods));
  }, [activeCategoryId]);

  function addToCart(product: Product) {
    setCart((prev) => {
      const existing = prev.find((i) => i.id === product.id);
      if (existing) return prev.map((i) => i.id === product.id ? { ...i, quantity: i.quantity + 1 } : i);
      return [...prev, { id: product.id, name: product.name, price: product.price, quantity: 1 }];
    });
    // Resalta el botón un instante como confirmación
    setAddedId(product.id);
    window.setTimeout(() => setAddedId((cur) => (cur === product.id ? null : cur)), 900);
  }

  function removeFromCart(id: number) {
    setCart((prev) => prev.filter((i) => i.id !== id));
  }

  function changeQty(id: number, delta: number) {
    setCart((prev) =>
      prev.map((i) => i.id === id ? { ...i, quantity: i.quantity + delta } : i).filter((i) => i.quantity > 0)
    );
  }

  const subtotal = cart.reduce((s, i) => s + i.price * i.quantity, 0);
  const isDelivery = deliveryMode === 'DELIVERY';
  const shipping = isDelivery && deliverySel ? deliverySel.fee : 0;
  const total = subtotal + shipping;

  // Para confirmar un delivery hace falta: ubicación, dirección, teléfono y aceptar el cargo
  const phoneValid = deliveryPhone.replace(/\D/g, '').length >= 7;
  const deliveryIncomplete =
    isDelivery && (!deliverySel || !deliveryAddress.trim() || !phoneValid || !feeAccepted);

  async function handleConfirm(e: React.FormEvent) {
    e.preventDefault();
    if (!clientName.trim() || cart.length === 0 || deliveryIncomplete) return;
    setSubmitting(true);
    setError(null);

    const delivery = isDelivery && deliverySel
      ? {
          type: 'DELIVERY' as const,
          address: deliveryAddress.trim(),
          phone: deliveryPhone.trim(),
          lat: deliverySel.lat,
          lng: deliverySel.lng,
          distanceKm: deliverySel.distanceKm,
          fee: deliverySel.fee,
        }
      : { type: 'PICKUP' as const };

    // Guardamos el checkout por si el pago falla y hay que reintentarlo
    localStorage.setItem(
      'fc_pending_checkout',
      JSON.stringify({ cart, clientName, deliveryMode, deliverySel, deliveryAddress, deliveryPhone, payerDni, payerEmail })
    );

    // Creamos la preferencia de pago y redirigimos a Mercado Pago.
    // La orden se registra recién cuando el pago esté aprobado.
    const { initPoint, error: err } = await createPaymentPreference({
      name: clientName,
      userId: user?.id,
      order: cart.map((i) => ({ id: i.id, quantity: i.quantity })),
      delivery,
      payer: {
        phone: deliveryPhone.trim(),
        dni: payerDni.trim(),
        email: (user?.email ?? payerEmail).trim(),
      },
    });

    if (err || !initPoint) {
      setError(err ?? 'No se pudo iniciar el pago');
      setSubmitting(false);
      return;
    }
    window.location.href = initPoint;
  }

  /* ── VERIFICANDO PAGO (retorno de Mercado Pago) ── */
  if (confirmingPay) {
    return (
      <div className="min-h-screen flex flex-col bg-surface">
        <Navbar />
        <div className="flex-1 flex flex-col items-center justify-center gap-4 text-center p-6">
          <div className="w-16 h-16 rounded-full border-4 border-brand border-t-transparent animate-spin" />
          <h1 className="font-serif text-2xl font-bold text-gray-900">Verificando tu pago...</h1>
          <p className="text-gray-500 text-sm">Un momento, estamos confirmando con Mercado Pago.</p>
        </div>
      </div>
    );
  }

  /* ── CONFIRMACIÓN ── */
  if (confirmed) {
    return (
      <div className="min-h-screen flex flex-col bg-surface">
        <Navbar />
        <div className="flex-1 flex flex-col items-center justify-center gap-5 text-center p-6">
          <div className="w-20 h-20 rounded-full bg-brand-light flex items-center justify-center">
            <CartIcon className="w-10 h-10 text-brand" />
          </div>
          <h1 className="font-serif text-4xl font-bold text-gray-900">¡Pedido Realizado!</h1>
          <p className="text-lg text-gray-500">
            Gracias <strong className="text-gray-900">{clientName}</strong>, tu pago fue aprobado y
            tu pedido está siendo preparado.
          </p>
          {paidCode && (
            <div className="bg-brand-light border border-brand/30 rounded-xl px-6 py-3">
              <p className="text-xs font-bold uppercase tracking-widest text-gray-500">
                Código de tu pedido
              </p>
              <p className="font-mono text-2xl font-extrabold text-gray-900 tracking-wider">
                {paidCode}
              </p>
            </div>
          )}
          <p className="font-serif text-3xl font-extrabold text-brand">
            {formatCurrency(paidTotal ?? total)}
          </p>
          <button
            onClick={() => { setCart([]); setClientName(''); setConfirmed(false); setPaidTotal(null); setPaidCode(null); }}
            className="mt-2 bg-gray-900 hover:bg-black text-white font-bold px-9 py-3 rounded-lg transition-colors"
          >
            Nuevo Pedido
          </button>
          <button onClick={() => navigate('/vistas')} className="text-gray-400 text-sm hover:text-gray-600">
            ← Volver al índice
          </button>
        </div>
      </div>
    );
  }

  /* ── VISTA PRINCIPAL ── */
  return (
    <div className="min-h-screen flex flex-col bg-surface">
      <Navbar />

      <div className="flex-1 lg:flex">

        {/* ── CATEGORÍAS ── */}
        <aside className="lg:w-72 bg-white border-r border-gray-200 lg:h-[calc(100vh-5rem)] lg:sticky lg:top-20 flex flex-col flex-shrink-0">
          <div className="flex-1 overflow-y-auto p-5">
            <p className="text-xs font-bold uppercase tracking-widest text-gray-400 mb-4">Menú</p>
            <nav className="space-y-1">
              {categories.map((cat) => {
                const active = activeCategoryId === cat.id;
                return (
                  <button
                    key={cat.id}
                    onClick={() => setActiveCategoryId(cat.id)}
                    className={`w-full flex items-center gap-3 px-3 py-3 rounded-xl text-left transition-colors ${
                      active
                        ? 'bg-brand text-gray-900 font-bold shadow-sm'
                        : 'text-gray-700 hover:bg-brand-light'
                    }`}
                  >
                    <CategoryIcon name={cat.name} className="w-6 h-6 flex-shrink-0" />
                    <span className="font-semibold">{cat.name}</span>
                  </button>
                );
              })}
            </nav>
          </div>

          {/* Info de delivery */}
          <div className="p-5">
            <div className="rounded-xl border border-gray-100 bg-surface p-4 flex items-center gap-3">
              <TruckIcon className="w-9 h-9 text-brand flex-shrink-0" />
              <div>
                <p className="font-bold text-gray-900 text-sm">Delivery disponible</p>
                <p className="text-xs text-gray-500">
                  <span className="text-brand font-semibold">{formatCurrency(RATE_PER_KM)}</span> por km
                  · hasta {MAX_DELIVERY_KM} km del local
                </p>
              </div>
            </div>
          </div>
        </aside>

        {/* ── PRODUCTOS ── */}
        <main className="flex-1 p-6 lg:p-8 lg:h-[calc(100vh-5rem)] lg:overflow-y-auto">
          <div className="mb-6">
            <h1 className="font-serif text-3xl md:text-4xl font-bold text-gray-900">
              Elige y personaliza tu pedido
            </h1>
            <div className="w-16 h-1 bg-brand rounded-full mt-2 mb-3" />
            <p className="text-gray-500">Selecciona los productos que deseas ordenar.</p>
          </div>

          {loading ? (
            <p className="text-gray-500 mt-10">Cargando menú...</p>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4 gap-5">
              {products.map((product) => (
                <div
                  key={product.id}
                  className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden flex flex-col"
                >
                  <div className="h-44 bg-brand-light overflow-hidden flex items-center justify-center">
                    {getImagePath(product.image) ? (
                      <img
                        src={getImagePath(product.image)}
                        alt={product.name}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <CartIcon className="w-12 h-12 text-brand/50" />
                    )}
                  </div>
                  <div className="p-5 flex flex-col flex-1">
                    <h3 className="font-serif text-xl font-bold text-gray-900">{product.name}</h3>
                    <p className="font-serif text-2xl font-extrabold text-brand mt-2 mb-4">
                      {formatCurrency(Number(product.price))}
                    </p>
                    <button
                      onClick={() => addToCart(product)}
                      className={`mt-auto flex items-center justify-center gap-2 font-bold py-3 rounded-lg transition-all duration-150 active:scale-95 ${
                        addedId === product.id
                          ? 'bg-green-600 text-white shadow-md ring-2 ring-green-300'
                          : 'bg-brand hover:bg-brand-dark text-white shadow-sm hover:shadow-md hover:-translate-y-0.5'
                      }`}
                    >
                      <CartIcon className="w-5 h-5" />
                      {addedId === product.id ? '✓ Agregado' : 'Agregar'}
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </main>

        {/* ── MI PEDIDO ── */}
        <aside className="lg:w-96 bg-white border-l border-gray-200 lg:h-[calc(100vh-5rem)] lg:sticky lg:top-20 flex flex-col flex-shrink-0">
          <div className="p-6 border-b border-gray-100 flex items-center gap-3">
            <CartIcon className="w-7 h-7 text-gray-900" />
            <h2 className="font-serif text-2xl font-bold text-gray-900">Mi Pedido</h2>
          </div>

          <div className="flex-1 overflow-y-auto p-6">
            {error && (
              <div className="mb-4 bg-red-50 border border-red-200 text-red-700 rounded-lg p-3 text-sm">
                {error}
              </div>
            )}

            {cart.length === 0 ? (
              <div className="flex flex-col items-center text-center mt-10">
                <div className="w-24 h-24 rounded-full bg-stone-100 flex items-center justify-center mb-5">
                  <BasketIcon className="w-10 h-10 text-gray-400" />
                </div>
                <p className="font-serif text-xl font-bold text-gray-900">El pedido está vacío</p>
                <p className="text-gray-500 mt-1 text-sm">Agrega productos para comenzar tu orden.</p>
              </div>
            ) : (
              <div className="space-y-4">
                {cart.map((item) => (
                  <div key={item.id} className="border-b border-gray-100 pb-4 last:border-b-0">
                    <div className="flex justify-between items-start gap-2">
                      <p className="font-serif font-bold text-gray-900">{item.name}</p>
                      <button
                        onClick={() => removeFromCart(item.id)}
                        className="text-gray-300 hover:text-red-500 transition-colors"
                        aria-label="Quitar"
                      >
                        <XIcon className="w-4 h-4" />
                      </button>
                    </div>
                    <p className="text-brand font-bold mt-1">{formatCurrency(item.price)}</p>
                    <div className="flex items-center justify-between mt-2">
                      <div className="flex items-center gap-3 bg-stone-100 rounded-lg px-3 py-1.5">
                        <button onClick={() => changeQty(item.id, -1)} className="text-gray-600 hover:text-gray-900">
                          <MinusIcon className="w-4 h-4" />
                        </button>
                        <span className="font-bold w-4 text-center">{item.quantity}</span>
                        <button onClick={() => changeQty(item.id, 1)} className="text-gray-600 hover:text-gray-900">
                          <PlusIcon className="w-4 h-4" />
                        </button>
                      </div>
                      <span className="text-sm font-semibold text-gray-700">
                        {formatCurrency(item.price * item.quantity)}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* ── ENTREGA: recojo en local o delivery ── */}
            {cart.length > 0 && (
              <div className="mt-6 pt-5 border-t border-gray-100 space-y-3">
                <p className="text-xs font-bold uppercase tracking-widest text-gray-400">
                  ¿Cómo quieres recibir tu pedido?
                </p>

                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setDeliveryMode('PICKUP')}
                    className={`rounded-xl border-2 p-3 text-center transition-colors ${
                      !isDelivery
                        ? 'border-brand bg-brand-light text-gray-900'
                        : 'border-gray-200 text-gray-500 hover:border-gray-300'
                    }`}
                  >
                    <span className="block text-xl mb-0.5">🏪</span>
                    <span className="block text-sm font-bold">Recojo en local</span>
                    <span className="block text-[11px] text-gray-500">Gratis</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setDeliveryMode('DELIVERY')}
                    className={`rounded-xl border-2 p-3 text-center transition-colors ${
                      isDelivery
                        ? 'border-brand bg-brand-light text-gray-900'
                        : 'border-gray-200 text-gray-500 hover:border-gray-300'
                    }`}
                  >
                    <span className="block text-xl mb-0.5">🛵</span>
                    <span className="block text-sm font-bold">Delivery</span>
                    <span className="block text-[11px] text-gray-500">
                      {formatCurrency(RATE_PER_KM)}/km
                    </span>
                  </button>
                </div>

                {isDelivery && (
                  <div className="space-y-3">
                    <DeliveryMapPicker
                      onSelect={(sel) => { setDeliverySel(sel); setFeeAccepted(false); }}
                    />

                    <input
                      type="text"
                      value={deliveryAddress}
                      onChange={(e) => setDeliveryAddress(e.target.value)}
                      placeholder="Dirección y referencia (ej. Av. Perú 123, dpto 4)"
                      maxLength={300}
                      className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm outline-none focus:border-brand"
                    />

                    <input
                      type="tel"
                      value={deliveryPhone}
                      onChange={(e) => setDeliveryPhone(e.target.value)}
                      placeholder="Teléfono de contacto (ej. 987654321)"
                      maxLength={20}
                      className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm outline-none focus:border-brand"
                    />
                    <p className="text-[11px] text-gray-400 -mt-1.5">
                      El repartidor te llamará a este número cuando llegue y te
                      confirmaremos tu pedido por WhatsApp.
                    </p>

                    {/* Aviso del cargo por delivery + confirmación */}
                    {deliverySel && (
                      <div className="bg-amber-50 border border-amber-200 rounded-xl p-3.5 space-y-2.5">
                        <p className="text-sm text-amber-900">
                          ⚠️ Se añadirá{' '}
                          <span className="font-extrabold">{formatCurrency(deliverySel.fee)}</span>{' '}
                          a tu pedido por el delivery ({deliverySel.distanceKm} km ×{' '}
                          {formatCurrency(RATE_PER_KM)}/km).
                        </p>
                        <label className="flex items-start gap-2 text-sm text-amber-900 cursor-pointer">
                          <input
                            type="checkbox"
                            checked={feeAccepted}
                            onChange={(e) => setFeeAccepted(e.target.checked)}
                            className="mt-0.5 w-4 h-4 accent-amber-600"
                          />
                          <span className="font-semibold">Acepto el cargo adicional por delivery</span>
                        </label>
                      </div>
                    )}
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Resumen + confirmar */}
          <div className="border-t border-gray-100 p-6 space-y-4">
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-500">Subtotal</span>
                <span className="font-semibold text-gray-900">{formatCurrency(subtotal)}</span>
              </div>
              <div className="flex justify-between">
                <span className="flex items-center gap-1 text-gray-500">
                  {isDelivery && deliverySel
                    ? `Delivery (${deliverySel.distanceKm} km)`
                    : 'Envío'}
                  <InfoIcon className="w-4 h-4 text-gray-400" />
                </span>
                <span className="font-semibold text-gray-900">{formatCurrency(shipping)}</span>
              </div>
              <div className="border-t border-gray-100 pt-3 flex justify-between items-center">
                <span className="font-serif text-lg font-bold text-gray-900">Total</span>
                <span className="font-serif text-lg font-extrabold text-brand">{formatCurrency(total)}</span>
              </div>
            </div>

            <form onSubmit={handleConfirm} className="space-y-3">
              {cart.length > 0 && (
                <>
                  <input
                    type="text"
                    placeholder="Tu nombre y apellido"
                    value={clientName}
                    onChange={(e) => setClientName(e.target.value)}
                    required
                    className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm outline-none focus:border-brand"
                  />
                  {!isDelivery && (
                    <input
                      type="tel"
                      placeholder="Celular (opcional, te confirmamos por WhatsApp)"
                      value={deliveryPhone}
                      onChange={(e) => setDeliveryPhone(e.target.value)}
                      maxLength={20}
                      className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm outline-none focus:border-brand"
                    />
                  )}
                  <input
                    type="text"
                    inputMode="numeric"
                    placeholder="DNI (opcional, agiliza la aprobación del pago)"
                    value={payerDni}
                    onChange={(e) => setPayerDni(e.target.value.replace(/\D/g, ''))}
                    maxLength={8}
                    className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm outline-none focus:border-brand"
                  />
                  {!user && (
                    <input
                      type="email"
                      placeholder="Tu correo (te confirmamos el pedido)"
                      value={payerEmail}
                      onChange={(e) => setPayerEmail(e.target.value)}
                      required
                      maxLength={100}
                      className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm outline-none focus:border-brand"
                    />
                  )}
                </>
              )}
              <button
                type="submit"
                disabled={submitting || cart.length === 0 || deliveryIncomplete}
                className="w-full flex items-center justify-center gap-2 bg-brand hover:bg-brand-dark disabled:opacity-50 disabled:hover:bg-brand text-white font-bold py-3.5 rounded-lg transition-colors"
              >
                <LockIcon className="w-4 h-4" />
                {submitting ? 'Redirigiendo al pago...' : 'Pagar y Confirmar Pedido'}
              </button>
              {deliveryIncomplete && cart.length > 0 && (
                <p className="text-[11px] text-gray-400 text-center">
                  Para confirmar: marca tu ubicación (o usa tu ubicación actual), escribe tu
                  dirección y teléfono, y acepta el cargo de delivery.
                </p>
              )}
            </form>
          </div>
        </aside>
      </div>

      <ChatWidget />
    </div>
  );
}
