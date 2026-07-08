import { useState, useEffect, useCallback } from 'react';
import AdminLayout from '../components/AdminLayout';
import SalesReportExport from '../components/SalesReportExport';
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
    <AdminLayout title="Administrar órdenes" action={<SalesReportExport />}>
      {loading ? (
        <p className="text-center text-gray-500 mt-20">Cargando órdenes...</p>
      ) : orders.length === 0 ? (
        <p className="text-center text-gray-500 mt-20">No hay órdenes pendientes</p>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 2xl:grid-cols-3 gap-5">
          {orders.map((order) => (
            <section
              key={order.id}
              className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 space-y-4"
            >
              <div className="flex items-center justify-between">
                <p className="font-serif text-xl font-bold text-gray-900">{order.name}</p>
                <div className="flex items-center gap-1.5">
                  {order.paymentStatus === 'approved' && (
                    <span className="text-xs font-semibold text-green-700 bg-green-100 px-2.5 py-1 rounded-full">
                      ✓ Pagado
                    </span>
                  )}
                  <span className="text-xs font-semibold text-brand bg-brand-light px-2.5 py-1 rounded-full">
                    Pendiente
                  </span>
                </div>
              </div>

              {/* Modo de entrega */}
              {order.deliveryType === 'DELIVERY' ? (
                <div className="bg-blue-50 border border-blue-100 rounded-lg p-2.5 text-xs text-blue-900 space-y-0.5">
                  <p className="font-bold">🛵 Delivery · {order.distanceKm} km · {formatCurrency(Number(order.deliveryFee))}</p>
                  <p>{order.deliveryAddress}</p>
                  {order.deliveryLat != null && (
                    <a
                      href={`https://www.google.com/maps?q=${order.deliveryLat},${order.deliveryLng}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="font-semibold underline"
                    >
                      Ver en Google Maps
                    </a>
                  )}
                </div>
              ) : (
                <p className="text-xs font-semibold text-gray-500">🏪 Recojo en local</p>
              )}

              <dl className="space-y-3">
                {order.orderItems.map((item) => (
                  <div key={item.id} className="flex items-center gap-2 border-t border-gray-100 pt-3">
                    <dt className="text-sm font-bold text-gray-400">({item.quantity})</dt>
                    <dd className="text-sm font-medium text-gray-800">{item.product.name}</dd>
                  </div>
                ))}
                <div className="flex items-center justify-between border-t border-gray-100 pt-3">
                  <dt className="text-sm font-semibold text-gray-500">Total a pagar</dt>
                  <dd className="font-serif text-lg font-extrabold text-brand">
                    {formatCurrency(Number(order.total))}
                  </dd>
                </div>
              </dl>

              <button
                onClick={() => handleComplete(order.id)}
                disabled={completing === order.id}
                className="bg-gray-900 hover:bg-black disabled:opacity-50 text-white w-full py-3 rounded-lg font-semibold transition-colors"
              >
                {completing === order.id ? 'Procesando...' : 'Marcar orden completada'}
              </button>
            </section>
          ))}
        </div>
      )}
    </AdminLayout>
  );
}
