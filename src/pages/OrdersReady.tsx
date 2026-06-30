import { useState, useEffect, useCallback } from 'react';
import Navbar from '../components/Navbar';
import AdminTabs from '../components/AdminTabs';
import { getReadyOrders } from '../services/api';
import type { Order } from '../services/api';

export default function OrdersReady() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchOrders = useCallback(async () => {
    const { orders: data } = await getReadyOrders();
    setOrders(data);
    setLoading(false);
  }, []);

  useEffect(() => {
    fetchOrders();
    const interval = setInterval(fetchOrders, 5000);
    return () => clearInterval(interval);
  }, [fetchOrders]);

  return (
    <div className="min-h-screen flex flex-col bg-surface">
      <Navbar />
      <AdminTabs />

      <main className="flex-1 w-full max-w-6xl mx-auto px-6 py-10">
        <div className="text-center mb-10">
          <h1 className="font-serif text-4xl md:text-5xl font-bold text-gray-900">Órdenes Listas</h1>
          <div className="w-20 h-1 bg-brand rounded-full mx-auto mt-3" />
        </div>

        {loading ? (
          <p className="text-center text-gray-500">Cargando órdenes...</p>
        ) : orders.length === 0 ? (
          <p className="text-center text-gray-500">No hay órdenes listas</p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {orders.map((order) => (
              <div key={order.id} className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 space-y-4 border-l-4 border-l-brand">
                <p className="font-serif text-2xl font-bold text-gray-900">{order.name}</p>
                <ul className="divide-y divide-gray-100 border-t border-gray-100">
                  {order.orderItems.map((item) => (
                    <li key={item.id} className="flex items-center gap-2 py-3 text-gray-700">
                      <span className="font-bold text-brand">({item.quantity})</span>
                      {item.product.name}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
