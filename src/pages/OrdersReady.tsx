import { useState } from 'react';
import Logo from '../components/Logo';
import { ORDERS_MOCK, type Order } from '../data/mockData';

export default function OrdersReady() {
  const [orders] = useState<Order[]>(ORDERS_MOCK.filter((o) => o.status === 'ready'));

  return (
    <div
      style={{
        fontFamily: "'Inter', sans-serif",
        background: '#fff',
        minHeight: '100vh',
        paddingBottom: 60,
      }}
    >
      <h1
        style={{
          textAlign: 'center',
          marginTop: 80,
          fontSize: 60,
          fontWeight: 900,
          color: '#111827',
          letterSpacing: -1,
        }}
      >
        Ordenes Listas
      </h1>

      <div style={{ display: 'flex', justifyContent: 'center', marginTop: 32 }}>
        <Logo size={140} />
      </div>

      {orders.length === 0 ? (
        <p style={{ textAlign: 'center', marginTop: 60, color: '#6b7280', fontSize: 18 }}>
          No hay órdenes listas en este momento.
        </p>
      ) : (
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(2, 1fr)',
            gap: 20,
            maxWidth: 900,
            margin: '40px auto 0',
            padding: '0 20px',
          }}
        >
          {orders.map((order) => (
            <div
              key={order.id}
              style={{
                background: '#fff',
                borderRadius: 12,
                boxShadow: '0 2px 12px rgba(0,0,0,0.10)',
                padding: 20,
                border: '2px solid #fbbf24',
              }}
            >
              <p style={{ fontSize: 22, fontWeight: 700, color: '#475569', marginBottom: 16 }}>
                Cliente: {order.clientName}
              </p>
              <ul style={{ listStyle: 'none', borderTop: '1px solid #e5e7eb' }}>
                {order.products.map((p, idx) => (
                  <li
                    key={idx}
                    style={{
                      display: 'flex',
                      padding: '20px 0',
                      borderBottom: '1px solid #e5e7eb',
                      fontSize: 17,
                      color: '#374151',
                    }}
                  >
                    <span style={{ fontWeight: 700, marginRight: 8 }}>({p.quantity})</span>
                    {p.name}
                  </li>
                ))}
              </ul>
              <p style={{ marginTop: 12, fontWeight: 900, fontSize: 16, color: '#f59e0b' }}>
                Total: ${order.total.toFixed(2)}
              </p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
