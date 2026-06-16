import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import AdminLayout from '../components/AdminLayout';
import { getProducts } from '../services/api';
import { formatCurrency } from '../utils';
import { PlusIcon, SearchIcon } from '../components/icons';
import type { Product } from '../services/api';

const PER_PAGE = 7;

export default function AdminProducts() {
  const [products, setProducts] = useState<Product[]>([]);
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [pagination, setPagination] = useState<{ total: number; pages: number } | null>(null);

  useEffect(() => {
    setLoading(true);
    getProducts(search || undefined, undefined, page, PER_PAGE).then(({ products: data, pagination: pag }) => {
      setProducts(data);
      setPagination(pag);
      setLoading(false);
    });
  }, [search, page]);

  return (
    <AdminLayout
      title="Administrar productos"
      action={
        <Link
          to="/vistas/admin/products/new"
          className="flex items-center gap-2 bg-brand hover:bg-brand-dark text-white font-bold px-5 py-3 rounded-lg transition-colors"
        >
          <PlusIcon className="w-5 h-5" />
          Crear Producto
        </Link>
      }
    >
      {/* Buscador */}
      <div className="relative mb-6 max-w-md">
        <SearchIcon className="w-5 h-5 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
        <input
          type="text"
          placeholder="Buscar producto..."
          value={search}
          onChange={(e) => { setSearch(e.target.value); setPage(1); }}
          className="w-full bg-white border border-gray-200 rounded-lg pl-10 pr-3 py-2.5 text-sm outline-none focus:border-brand"
        />
      </div>

      {/* Tabla */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        {loading ? (
          <p className="text-center py-12 text-gray-500">Cargando productos...</p>
        ) : products.length === 0 ? (
          <div className="text-center py-12">
            <p className="font-serif text-xl font-bold text-gray-900 mb-1">No se encontraron resultados</p>
            <p className="text-gray-500">{search ? `No hay productos con "${search}"` : 'No hay productos'}</p>
          </div>
        ) : (
          <table className="min-w-full divide-y divide-gray-100">
            <thead className="bg-stone-50">
              <tr>
                {['Producto', 'Precio', 'Categoría', ''].map((h) => (
                  <th
                    key={h}
                    scope="col"
                    className="px-6 py-3.5 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider"
                  >
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {products.map((product) => (
                <tr key={product.id} className="hover:bg-stone-50 transition-colors">
                  <td className="px-6 py-4 text-sm font-semibold text-gray-900">{product.name}</td>
                  <td className="px-6 py-4 text-sm font-bold text-brand">{formatCurrency(product.price)}</td>
                  <td className="px-6 py-4 text-sm text-gray-500">{product.category?.name || 'Sin categoría'}</td>
                  <td className="px-6 py-4 text-right text-sm">
                    <Link
                      to={`/vistas/admin/products/${product.id}/edit`}
                      className="font-semibold text-brand hover:text-brand-dark"
                    >
                      Editar
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* Paginación */}
      {pagination && pagination.pages > 1 && (
        <nav className="flex justify-center gap-1.5 mt-8">
          <button
            onClick={() => setPage((p) => Math.max(1, p - 1))}
            disabled={page === 1}
            className="px-3.5 py-2 bg-white border border-gray-200 rounded-lg text-sm disabled:opacity-40"
          >
            «
          </button>
          {Array.from({ length: pagination.pages }, (_, i) => i + 1).map((n) => (
            <button
              key={n}
              onClick={() => setPage(n)}
              className={`px-3.5 py-2 rounded-lg border text-sm transition-colors ${
                n === page
                  ? 'bg-brand text-white border-brand font-bold'
                  : 'bg-white border-gray-200 hover:bg-stone-50'
              }`}
            >
              {n}
            </button>
          ))}
          <button
            onClick={() => setPage((p) => Math.min(pagination.pages, p + 1))}
            disabled={page === pagination.pages}
            className="px-3.5 py-2 bg-white border border-gray-200 rounded-lg text-sm disabled:opacity-40"
          >
            »
          </button>
        </nav>
      )}
    </AdminLayout>
  );
}
