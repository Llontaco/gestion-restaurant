import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Logo from '../components/Logo';
import { CATEGORIES, PRODUCTS, type OrderProduct } from '../data/mockData';

export default function KioskMenu() {
  const navigate = useNavigate();
  const [activeCategoryId, setActiveCategoryId] = useState(1);
  const [cart, setCart] = useState<OrderProduct[]>([]);
  const [clientName, setClientName] = useState('');
  const [confirmed, setConfirmed] = useState(false);

  const filtered = PRODUCTS.filter((p) => p.categoryId === activeCategoryId);

  function addToCart(productId: number) {
    const product = PRODUCTS.find((p) => p.id === productId)!;
    setCart((prev) => {
      const existing = prev.find((i) => i.id === productId);
      if (existing) return prev.map((i) => i.id === productId ? { ...i, quantity: i.quantity + 1 } : i);
      return [...prev, { id: product.id, name: product.name, price: product.price, quantity: 1 }];
    });
  }

  function removeFromCart(id: number) {
    setCart((prev) => prev.filter((i) => i.id !== id));
  }

  function changeQty(id: number, delta: number) {
    setCart((prev) =>
      prev
        .map((i) => i.id === id ? { ...i, quantity: i.quantity + delta } : i)
        .filter((i) => i.quantity > 0)
    );
  }

  const total = cart.reduce((s, i) => s + i.price * i.quantity, 0);

  function handleConfirm(e: React.FormEvent) {
    e.preventDefault();
    if (!clientName.trim() || cart.length === 0) return;
    setConfirmed(true);
  }

  /* ── PANTALLA DE CONFIRMACIÓN ── */
  if (confirmed) {
    return (
      <div
        style={{
          minHeight: '100vh',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          fontFamily: "'Inter', sans-serif",
          background: '#f3f4f6',
          gap: 20,
          textAlign: 'center',
          padding: 24,
        }}
      >
        <Logo size={120} />
        <div style={{ fontSize: 56 }}>🎉</div>
        <h1 style={{ fontSize: 36, fontWeight: 900, color: '#111827' }}>
          ¡Pedido Confirmado!
        </h1>
        <p style={{ fontSize: 18, color: '#6b7280' }}>
          Gracias <strong>{clientName}</strong>, tu pedido está siendo preparado.
        </p>
        <p style={{ fontSize: 22, fontWeight: 900, color: '#f59e0b' }}>
          Total: ${total.toFixed(2)}
        </p>
        <button
          onClick={() => { setCart([]); setClientName(''); setConfirmed(false); }}
          style={{
            marginTop: 8,
            background: '#111827',
            color: '#fff',
            border: 'none',
            padding: '12px 36px',
            fontWeight: 700,
            fontSize: 15,
            cursor: 'pointer',
            borderRadius: 4,
            textTransform: 'uppercase',
          }}
        >
          Nuevo Pedido
        </button>
        <button
          onClick={() => navigate('/vistas')}
          style={{
            background: 'none',
            border: 'none',
            color: '#6b7280',
            fontSize: 14,
            cursor: 'pointer',
            textDecoration: 'underline',
          }}
        >
          ← Volver al índice
        </button>
      </div>
    );
  }

  /* ── VISTA PRINCIPAL ── */
  return (
    <div style={{ display: 'flex', minHeight: '100vh', fontFamily: "'Inter', sans-serif", background: '#f3f4f6' }}>

      {/* ── CATEGORÍAS ── */}
      <aside style={{ width: 288, minHeight: '100vh', background: '#fff', display: 'flex', flexDirection: 'column', flexShrink: 0, borderRight: '1px solid #e5e7eb' }}>
        <div style={{ display: 'flex', justifyContent: 'center', padding: '24px 16px', borderBottom: '1px solid #e5e7eb' }}>
          <Logo />
        </div>
        <nav>
          {CATEGORIES.map((cat) => (
            <button
              key={cat.id}
              onClick={() => setActiveCategoryId(cat.id)}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 16,
                padding: '12px 16px',
                borderTop: '1px solid #e5e7eb',
                width: '100%',
                textAlign: 'left',
                background: activeCategoryId === cat.id ? '#fbbf24' : 'transparent',
                border: 'none',
                cursor: 'pointer',
                fontWeight: 700,
                fontSize: 18,
                color: '#111827',
                fontFamily: "'Inter', sans-serif",
                transition: 'background .15s',
              }}
            >
              <div style={{ width: 56, height: 56, background: '#f3f4f6', borderRadius: 8, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 28, flexShrink: 0 }}>
                {cat.icon}
              </div>
              {cat.name}
            </button>
          ))}
        </nav>
      </aside>

      {/* ── PRODUCTOS ── */}
      <main style={{ flex: 1, padding: 24, overflowY: 'auto' }}>
        <h1 style={{ fontSize: 28, fontWeight: 900, color: '#111827', marginBottom: 20 }}>
          Elige y personaliza tu pedido a continuación
        </h1>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))', gap: 16 }}>
          {filtered.map((product) => (
            <div key={product.id} style={{ background: '#fff', border: '1px solid #e5e7eb', borderRadius: 4, overflow: 'hidden' }}>
              <div style={{ width: '100%', height: 200, background: 'linear-gradient(135deg, #fef3c7, #fde68a)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 64 }}>
                {product.image}
              </div>
              <div style={{ padding: 20 }}>
                <h3 style={{ fontSize: 20, fontWeight: 700, color: '#111827' }}>{product.name}</h3>
                <p style={{ fontSize: 32, fontWeight: 900, color: '#f59e0b', marginTop: 12 }}>
                  ${product.price.toFixed(2)}
                </p>
                <button
                  onClick={() => addToCart(product.id)}
                  style={{
                    display: 'block', width: '100%', marginTop: 16,
                    background: '#111827', color: '#fff', border: 'none',
                    padding: 10, fontWeight: 700, fontSize: 15,
                    cursor: 'pointer', textTransform: 'uppercase',
                    letterSpacing: 0.5, borderRadius: 2, fontFamily: "'Inter', sans-serif",
                  }}
                >
                  Agregar
                </button>
              </div>
            </div>
          ))}
        </div>
      </main>

      {/* ── CARRITO ── */}
      <aside style={{ width: 320, minHeight: '100vh', background: '#fff', borderLeft: '1px solid #e5e7eb', padding: 20, display: 'flex', flexDirection: 'column', flexShrink: 0, overflowY: 'auto' }}>
        <h2 style={{ textAlign: 'center', fontSize: 28, fontWeight: 900, color: '#111827', marginBottom: 16 }}>
          MIS PEDIDOS
        </h2>

        {cart.length === 0 ? (
          <p style={{ textAlign: 'center', color: '#6b7280', marginTop: 32, fontSize: 15 }}>
            Agrega productos para comenzar tu pedido.
          </p>
        ) : (
          <>
            {cart.map((item) => (
              <div key={item.id} style={{ borderTop: '1px solid #e5e7eb', padding: '16px 0' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                  <p style={{ fontWeight: 700, fontSize: 17 }}>{item.name}</p>
                  <button onClick={() => removeFromCart(item.id)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#dc2626', fontSize: 22, lineHeight: 1 }}>✕</button>
                </div>
                <p style={{ color: '#f59e0b', fontWeight: 900, fontSize: 20, margin: '4px 0' }}>
                  ${item.price.toFixed(2)}
                </p>
                <div style={{ display: 'flex', gap: 20, alignItems: 'center', background: '#f3f4f6', padding: '8px 24px', borderRadius: 8, width: 'fit-content', marginTop: 8 }}>
                  <button onClick={() => changeQty(item.id, -1)} style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: 20, fontWeight: 700, color: '#374151' }}>−</button>
                  <span style={{ fontSize: 16, fontWeight: 900 }}>{item.quantity}</span>
                  <button onClick={() => changeQty(item.id, 1)} style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: 20, fontWeight: 700, color: '#374151' }}>+</button>
                </div>
                <p style={{ fontSize: 17, fontWeight: 900, color: '#374151', marginTop: 8 }}>
                  Subtotal: <span style={{ fontWeight: 400 }}>${(item.price * item.quantity).toFixed(2)}</span>
                </p>
              </div>
            ))}

            <p style={{ fontSize: 20, textAlign: 'center', marginTop: 'auto', paddingTop: 32 }}>
              Total a pagar: <strong>${total.toFixed(2)}</strong>
            </p>

            <form onSubmit={handleConfirm} style={{ marginTop: 24, display: 'flex', flexDirection: 'column', gap: 16 }}>
              <input
                type="text"
                placeholder="Tu Nombre"
                value={clientName}
                onChange={(e) => setClientName(e.target.value)}
                required
                style={{ border: '1px solid #e5e7eb', padding: 10, width: '100%', fontSize: 15, fontFamily: "'Inter', sans-serif" }}
              />
              <button
                type="submit"
                style={{
                  padding: 10, background: '#111827', color: '#fff',
                  border: 'none', fontWeight: 700, fontSize: 15,
                  textTransform: 'uppercase', cursor: 'pointer',
                  borderRadius: 2, fontFamily: "'Inter', sans-serif",
                }}
              >
                Confirmar Pedido
              </button>
            </form>
          </>
        )}
      </aside>
    </div>
  );
}
