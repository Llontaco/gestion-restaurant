import { useState, useEffect, useCallback } from 'react';
import Logo from '../components/Logo';
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
    <div className="min-h-screen bg-white pb-16">
      <h1 className="text-center mt-20 text-6xl font-black text-gray-900">Ordenes Listas</h1>

      <Logo />

      {loading ? (
        <p className="text-center mt-10 text-gray-500">Cargando órdenes...</p>
      ) : orders.length === 0 ? (
        <p className="text-center mt-10 text-gray-500">No hay ordenes listas</p>
      ) : (
        <div className="grid grid-cols-2 gap-5 max-w-5xl mx-auto mt-10 px-5">
          {orders.map((order) => (
            <div key={order.id} className="bg-white shadow p-5 space-y-5 rounded-lg border-2 border-amber-400">
              <p className="text-2xl font-bold text-slate-600">Cliente: {order.name}</p>
              <ul className="divide-y divide-gray-200 border-t border-gray-200 text-sm font-medium text-gray-500">
                {order.orderItems.map((item) => (
                  <li key={item.id} className="flex py-6 text-lg">
                    <span className="font-bold mr-2">({item.quantity})</span>
                    {item.product.name}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
