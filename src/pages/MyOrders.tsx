import { useState, useEffect, useCallback } from 'react';
import Navbar from '../components/Navbar';
import { getMyOrders } from '../services/api';
import { formatCurrency } from '../utils';
import { useAuth } from '../context/AuthContext';
import type { Order } from '../services/api';

// Estado legible de un pedido para el cliente
function orderStatus(order: Order): { label: string; classes: string } {
  if (order.finalizedAt)
    return { label: 'Entregado', classes: 'bg-gray-100 text-gray-500' };
  if (order.orderReadyAt)
    return { label: '¡Listo para recoger!', classes: 'bg-green-100 text-green-700' };
  return { label: 'En preparación', classes: 'bg-amber-100 text-amber-700' };
}

export default function MyOrders() {
  const { user } = useAuth();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchOrders = useCallback(async () => {
    if (!user) return;
    const { orders: data } = await getMyOrders(user.id);
    setOrders(data);
    setLoading(false);
  }, [user]);

  useEffect(() => {
    fetchOrders();
    const interval = setInterval(fetchOrders, 5000);
    return () => clearInterval(interval);
  }, [fetchOrders]);

  return (
    <div className="min-h-screen flex flex-col bg-surface">
      <Navbar />

      <main className="flex-1 w-full max-w-4xl mx-auto px-4 sm:px-6 py-8 sm:py-10">
        <div className="mb-8">
          <h1 className="font-serif text-3xl sm:text-4xl font-bold text-gray-900">Mis Pedidos</h1>
          <div className="w-16 h-1 bg-brand rounded-full mt-2 mb-2" />
          <p className="text-gray-500 text-sm">
            Aquí puedes seguir el estado de tus pedidos. Se actualiza automáticamente.
          </p>
        </div>

        {loading ? (
          <p className="text-center text-gray-500 mt-16">Cargando tus pedidos...</p>
        ) : orders.length === 0 ? (
          <div className="text-center mt-16">
            <p className="font-serif text-xl font-bold text-gray-900 mb-1">Aún no tienes pedidos</p>
            <p className="text-gray-500 text-sm">Haz tu primer pedido desde el Quiosco. 🍔</p>
          </div>
        ) : (
          <div className="space-y-4">
            {orders.map((order) => {
              const st = orderStatus(order);
              return (
                <section
                  key={order.id}
                  className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 sm:p-6"
                >
                  <div className="flex flex-wrap items-center justify-between gap-2 mb-3">
                    <div>
                      <p className="font-serif text-lg font-bold text-gray-900">
                        Pedido #{order.id}
                      </p>
                      <p className="text-xs text-gray-400">
                        {new Date(order.createdAt).toLocaleString('es-PE', {
                          dateStyle: 'medium',
                          timeStyle: 'short',
                        })}
                      </p>
                    </div>
                    <span className={`text-xs font-bold px-3 py-1.5 rounded-full ${st.classes}`}>
                      {st.label}
                    </span>
                  </div>

                  <ul className="divide-y divide-gray-100 border-t border-gray-100">
                    {order.orderItems.map((item) => (
                      <li key={item.id} className="flex items-center justify-between py-2.5 text-sm">
                        <span className="text-gray-700">
                          <span className="font-bold text-brand">({item.quantity})</span>{' '}
                          {item.product.name}
                        </span>
                        <span className="font-semibold text-gray-600">
                          {formatCurrency(Number(item.product.price) * item.quantity)}
                        </span>
                      </li>
                    ))}
                  </ul>

                  <div className="flex items-center justify-between border-t border-gray-100 pt-3 mt-1">
                    <span className="text-sm font-semibold text-gray-500">Total</span>
                    <span className="font-serif text-lg font-extrabold text-brand">
                      {formatCurrency(Number(order.total))}
                    </span>
                  </div>
                </section>
              );
            })}
          </div>
        )}
      </main>
    </div>
  );
}
