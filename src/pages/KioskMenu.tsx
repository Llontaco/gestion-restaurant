import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Logo from '../components/Logo';
import { getCategories, getProducts, createOrder } from '../services/api';
import { getImagePath, formatCurrency } from '../utils';
import type { Category, Product, CartItem } from '../services/api';

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

  const total = cart.reduce((s, i) => s + i.price * i.quantity, 0);

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
      <div className="min-h-screen flex flex-col items-center justify-center bg-gray-100 gap-5 text-center p-6">
        <Logo />
        <p className="text-6xl">🎉</p>
        <h1 className="text-4xl font-black text-gray-900">¡Pedido Confirmado!</h1>
        <p className="text-lg text-gray-500">
          Gracias <strong>{clientName}</strong>, tu pedido está siendo preparado.
        </p>
        <p className="text-2xl font-black text-amber-500">{formatCurrency(total)}</p>
        <button
          onClick={() => { setCart([]); setClientName(''); setConfirmed(false); }}
          className="mt-2 bg-black text-white font-bold px-9 py-3 rounded uppercase"
        >
          Nuevo Pedido
        </button>
        <button onClick={() => navigate('/vistas')} className="text-gray-400 text-sm underline">
          ← Volver al índice
        </button>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-gray-500 text-lg">Cargando menú...</p>
      </div>
    );
  }

  /* ── VISTA PRINCIPAL ── */
  return (
    <div className="md:flex min-h-screen bg-gray-100">

      {/* ── CATEGORÍAS ── */}
      <aside className="md:w-72 md:h-screen bg-white border-r border-gray-200 flex-shrink-0">
        <Logo />
        <nav className="mt-10">
          {categories.map((cat) => (
            <button
              key={cat.id}
              onClick={() => setActiveCategoryId(cat.id)}
              className={`${activeCategoryId === cat.id ? 'bg-amber-400' : ''} flex items-center gap-4 w-full border-t border-gray-200 p-3 last:border-b cursor-pointer hover:bg-amber-50 transition-colors`}
            >
              <span className="text-xl font-bold text-gray-900">{cat.name}</span>
            </button>
          ))}
        </nav>
      </aside>

      {/* ── PRODUCTOS ── */}
      <main className="md:flex-1 md:h-screen md:overflow-y-scroll p-5">
        <h1 className="text-3xl font-black text-gray-900 mb-5">
          Elige y personaliza tu pedido a continuación
        </h1>
        <div className="grid grid-cols-1 xl:grid-cols-2 2xl:grid-cols-4 gap-4 items-start">
          {products.map((product) => (
            <div key={product.id} className="border bg-white">
              <div className="w-full h-48 overflow-hidden bg-amber-50 flex items-center justify-center">
                {getImagePath(product.image) ? (
                  <img
                    src={getImagePath(product.image)}
                    alt={product.name}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <span className="text-6xl">📦</span>
                )}
              </div>
              <div className="p-5">
                <h3 className="text-2xl font-bold text-gray-900">{product.name}</h3>
                <p className="mt-5 font-black text-4xl text-amber-500">
                  {formatCurrency(Number(product.price))}
                </p>
                <button
                  onClick={() => addToCart(product)}
                  className="bg-black text-white w-full mt-5 p-3 uppercase font-bold cursor-pointer hover:bg-gray-800 transition-colors"
                >
                  Agregar
                </button>
              </div>
            </div>
          ))}
        </div>
      </main>

      {/* ── CARRITO ── */}
      <aside className="md:w-72 lg:w-96 md:h-screen md:overflow-y-scroll p-5 bg-white border-l border-gray-200">
        <h2 className="text-4xl font-black text-center text-gray-900">MIS PEDIDOS</h2>

        {error && (
          <div className="mt-4 bg-red-100 border border-red-300 text-red-800 rounded p-3 text-sm">
            {error}
          </div>
        )}

        {cart.length === 0 ? (
          <p className="text-center text-gray-400 my-10">El pedido está vacío</p>
        ) : (
          <div className="mt-5">
            {cart.map((item) => (
              <div key={item.id} className="border-t border-gray-200 py-4">
                <div className="flex justify-between items-start">
                  <p className="font-bold text-gray-900">{item.name}</p>
                  <button onClick={() => removeFromCart(item.id)} className="text-red-500 font-bold text-lg leading-none">✕</button>
                </div>
                <p className="text-amber-500 font-black text-xl mt-1">{formatCurrency(item.price)}</p>
                <div className="flex gap-5 items-center bg-gray-100 px-6 py-2 rounded-lg w-fit mt-2">
                  <button onClick={() => changeQty(item.id, -1)} className="font-bold text-xl text-gray-700">−</button>
                  <span className="font-black">{item.quantity}</span>
                  <button onClick={() => changeQty(item.id, 1)} className="font-bold text-xl text-gray-700">+</button>
                </div>
                <p className="text-sm font-bold text-gray-600 mt-2">
                  Subtotal: <span className="font-normal">{formatCurrency(item.price * item.quantity)}</span>
                </p>
              </div>
            ))}

            <p className="text-2xl mt-10 text-center">
              Total a pagar: <span className="font-bold">{formatCurrency(total)}</span>
            </p>

            <form onSubmit={handleConfirm} className="w-full mt-10 space-y-5">
              <input
                type="text"
                placeholder="Tu Nombre"
                value={clientName}
                onChange={(e) => setClientName(e.target.value)}
                required
                className="bg-white border border-gray-200 p-2 w-full"
              />
              <button
                type="submit"
                disabled={submitting}
                className="py-2 rounded uppercase text-white bg-black w-full font-bold cursor-pointer disabled:bg-gray-400"
              >
                {submitting ? 'Enviando...' : 'Confirmar Pedido'}
              </button>
            </form>
          </div>
        )}
      </aside>
    </div>
  );
}
