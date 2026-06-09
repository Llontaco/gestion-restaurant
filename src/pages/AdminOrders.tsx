import { useState, useEffect, useCallback } from 'react';
import AdminSidebar from '../components/AdminSidebar';
import { getPendingOrders, completeOrder } from '../services/api';
import { formatCurrency } from '../utils';
import type { Order } from '../services/api';

export default function AdminOrders() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [completing, setCompleting] = useState<number | null>(null);

  const fetchOrders = useCallback(async () => {
    const { orders: data } = await getPendingOrders();
    setOrders(data);
    setLoading(false);
  }, []);

  useEffect(() => {
    fetchOrders();
    const interval = setInterval(fetchOrders, 5000);
    return () => clearInterval(interval);
  }, [fetchOrders]);

  async function handleComplete(id: number) {
    setCompleting(id);
    await completeOrder(id);
    setOrders((prev) => prev.filter((o) => o.id !== id));
    setCompleting(null);
  }

  return (
    <div className="md:flex min-h-screen bg-gray-100">
      <AdminSidebar />

      <main className="md:flex-1 p-5 overflow-y-auto">
        <h1 className="text-3xl font-black text-gray-900 mb-5">Administrar ordenes</h1>

        {loading ? (
          <p className="text-center text-gray-500 mt-20">Cargando órdenes...</p>
        ) : orders.length === 0 ? (
          <p className="text-center text-gray-500 mt-20">No hay ordenes pendientes</p>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 2xl:grid-cols-3 gap-5 mt-5">
            {orders.map((order) => (
              <section
                key={order.id}
                className="mt-4 rounded-lg bg-gray-50 px-4 py-6 sm:p-6 lg:mt-0 lg:p-8 space-y-4"
                aria-labelledby="summary-heading"
              >
                <p className="text-2xl font-medium text-gray-900">Cliente: {order.name}</p>
                <p className="text-lg font-medium text-gray-900">Productos Ordenados:</p>
                <dl className="mt-6 space-y-4">
                  {order.orderItems.map((item) => (
                    <div key={item.id} className="flex items-center gap-2 border-t border-gray-200 pt-4">
                      <dt className="text-sm text-gray-600">
                        <span className="font-black">({item.quantity})</span>
                      </dt>
                      <dd className="text-sm font-medium text-gray-900">{item.product.name}</dd>
                    </div>
                  ))}
                  <div className="flex items-center justify-between border-t border-gray-200 pt-4">
                    <dt className="text-base font-medium text-gray-900">Total a Pagar:</dt>
                    <dd className="text-base font-medium text-gray-900">{formatCurrency(Number(order.total))}</dd>
                  </div>
                </dl>

                <button
                  onClick={() => handleComplete(order.id)}
                  disabled={completing === order.id}
                  className="bg-indigo-600 hover:bg-indigo-800 disabled:bg-gray-400 text-white w-full mt-5 p-3 uppercase font-bold cursor-pointer transition-colors"
                >
                  {completing === order.id ? 'Procesando...' : 'Marcar Orden Completada'}
                </button>
              </section>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
