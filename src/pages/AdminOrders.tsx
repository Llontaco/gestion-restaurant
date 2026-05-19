import { useState } from 'react';
import AdminSidebar from '../components/AdminSidebar';
import { ORDERS_MOCK, type Order } from '../data/mockData';

export default function AdminOrders() {
  const [orders, setOrders] = useState<Order[]>(
    ORDERS_MOCK.filter((o) => o.status === 'pending')
  );

  function markCompleted(id: number) {
    setOrders((prev) => prev.filter((o) => o.id !== id));
  }

  return (
    <div style={{ display: 'flex', minHeight: '100vh', fontFamily: "'Inter', sans-serif", background: '#f3f4f6' }}>
      <AdminSidebar active="orders" />

      <main style={{ flex: 1, padding: 24, overflowY: 'auto' }}>
        <h1 style={{ fontSize: 28, fontWeight: 900, color: '#111827', marginBottom: 24 }}>
          Administrar ordenes
        </h1>

        {orders.length === 0 ? (
          <div style={{ textAlign: 'center', marginTop: 60 }}>
            <div style={{ fontSize: 56, marginBottom: 16 }}>✅</div>
            <p style={{ color: '#6b7280', fontSize: 17 }}>
              No hay órdenes pendientes. ¡Todo al día!
            </p>
          </div>
        ) : (
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))',
              gap: 20,
            }}
          >
            {orders.map((order) => (
              <section
                key={order.id}
                style={{ background: '#f9fafb', borderRadius: 8, padding: '24px 24px 20px' }}
              >
                <p style={{ fontSize: 20, fontWeight: 500, color: '#111827', marginBottom: 4 }}>
                  Cliente: {order.clientName}
                </p>
                <p style={{ fontSize: 15, fontWeight: 500, color: '#111827', marginBottom: 16 }}>
                  Productos Ordenados:
                </p>
                <dl>
                  {order.products.map((p, idx) => (
                    <div
                      key={idx}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: 8,
                        borderTop: '1px solid #e5e7eb',
                        padding: '12px 0',
                      }}
                    >
                      <dt style={{ fontWeight: 900, fontSize: 14, color: '#4b5563' }}>
                        ({p.quantity})
                      </dt>
                      <dd style={{ fontSize: 14, color: '#111827', fontWeight: 500 }}>
                        {p.name}
                      </dd>
                    </div>
                  ))}
                  <div
                    style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      borderTop: '1px solid #e5e7eb',
                      padding: '16px 0 0',
                      marginTop: 8,
                    }}
                  >
                    <dt style={{ fontSize: 16, fontWeight: 500, color: '#111827' }}>Total a Pagar:</dt>
                    <dd style={{ fontSize: 16, fontWeight: 500, color: '#111827' }}>
                      ${order.total.toFixed(2)}
                    </dd>
                  </div>
                </dl>
                <button
                  onClick={() => markCompleted(order.id)}
                  style={{
                    display: 'block',
                    width: '100%',
                    marginTop: 16,
                    background: '#4f46e5',
                    color: '#fff',
                    border: 'none',
                    padding: 12,
                    fontWeight: 700,
                    fontSize: 14,
                    textTransform: 'uppercase',
                    cursor: 'pointer',
                    borderRadius: 2,
                    letterSpacing: 0.5,
                    fontFamily: "'Inter', sans-serif",
                    transition: 'background .15s',
                  }}
                  onMouseEnter={(e) => ((e.currentTarget as HTMLButtonElement).style.background = '#3730a3')}
                  onMouseLeave={(e) => ((e.currentTarget as HTMLButtonElement).style.background = '#4f46e5')}
                >
                  Marcar Orden Completada
                </button>
              </section>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
