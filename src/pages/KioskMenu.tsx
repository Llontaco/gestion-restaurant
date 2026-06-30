import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Navbar from '../components/Navbar';
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
import { getCategories, getProducts, createOrder } from '../services/api';
import { getImagePath, formatCurrency } from '../utils';
import type { Category, Product, CartItem } from '../services/api';

const FREE_SHIPPING_THRESHOLD = 50;

export default function KioskMenu() {
  const navigate = useNavigate();
  const [categories, setCategories] = useState<Category[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [activeCategoryId, setActiveCategoryId] = useState<number | null>(null);
  const [cart, setCart] = useState<CartItem[]>([]);
  const [clientName, setClientName] = useState('');
  const [confirmed, setConfirmed] = useState(false);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

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
  const shipping = 0; // Envío gratis (promoción)
  const total = subtotal + shipping;

  async function handleConfirm(e: React.FormEvent) {
    e.preventDefault();
    if (!clientName.trim() || cart.length === 0) return;
    setSubmitting(true);
    setError(null);
    const { error: err } = await createOrder(clientName, total, cart);
    if (err) { setError(err); setSubmitting(false); }
    else { setConfirmed(true); setSubmitting(false); }
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
          <h1 className="font-serif text-4xl font-bold text-gray-900">¡Pedido Confirmado!</h1>
          <p className="text-lg text-gray-500">
            Gracias <strong className="text-gray-900">{clientName}</strong>, tu pedido está siendo preparado.
          </p>
          <p className="font-serif text-3xl font-extrabold text-brand">{formatCurrency(total)}</p>
          <button
            onClick={() => { setCart([]); setClientName(''); setConfirmed(false); }}
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

          {/* Promoción envío gratis */}
          <div className="p-5">
            <div className="rounded-xl border border-gray-100 bg-surface p-4 flex items-center gap-3">
              <TruckIcon className="w-9 h-9 text-brand flex-shrink-0" />
              <div>
                <p className="font-bold text-gray-900 text-sm">Envío gratis</p>
                <p className="text-xs text-gray-500">
                  Por compras mayores a{' '}
                  <span className="text-brand font-semibold">{formatCurrency(FREE_SHIPPING_THRESHOLD)}</span>
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
                      className="mt-auto flex items-center justify-center gap-2 bg-gray-900 hover:bg-black text-white font-semibold py-3 rounded-lg transition-colors"
                    >
                      <CartIcon className="w-5 h-5" />
                      Agregar
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
                  Envío <InfoIcon className="w-4 h-4 text-gray-400" />
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
                <input
                  type="text"
                  placeholder="Tu nombre"
                  value={clientName}
                  onChange={(e) => setClientName(e.target.value)}
                  required
                  className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm outline-none focus:border-brand"
                />
              )}
              <button
                type="submit"
                disabled={submitting || cart.length === 0}
                className="w-full flex items-center justify-center gap-2 bg-brand hover:bg-brand-dark disabled:opacity-50 disabled:hover:bg-brand text-white font-bold py-3.5 rounded-lg transition-colors"
              >
                <LockIcon className="w-4 h-4" />
                {submitting ? 'Enviando...' : 'Confirmar Pedido'}
              </button>
            </form>
          </div>
        </aside>
      </div>
    </div>
  );
}
