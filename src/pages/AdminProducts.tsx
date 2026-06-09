import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import AdminSidebar from '../components/AdminSidebar';
import { getProducts } from '../services/api';
import { formatCurrency } from '../utils';
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
    <div className="md:flex min-h-screen bg-gray-100">
      <AdminSidebar />

      <main className="md:flex-1 p-5 overflow-y-auto">
        <h1 className="text-3xl font-black text-gray-900 mb-5">Administrar productos</h1>

        {/* Toolbar */}
        <div className="flex flex-wrap justify-between items-center gap-4 mb-8">
          <Link
            to="/vistas/admin/products/new"
            className="bg-amber-400 hover:bg-amber-500 text-black font-bold text-lg px-9 py-3 transition-colors"
          >
            Crear Producto
          </Link>
          <div className="flex">
            <input
              type="text"
              placeholder="Buscar Producto"
              value={search}
              onChange={(e) => { setSearch(e.target.value); setPage(1); }}
              className="bg-white border border-gray-200 p-2.5 w-64 outline-none"
            />
            <button className="bg-indigo-600 hover:bg-indigo-800 text-white px-5 font-semibold uppercase transition-colors">
              Buscar
            </button>
          </div>
        </div>

        {/* Table */}
        <div className="px-4 sm:px-6 lg:px-8">
          <div className="mt-2 flow-root">
            <div className="-mx-4 -my-2 overflow-x-auto sm:-mx-6 lg:-mx-8">
              <div className="inline-block min-w-full py-2 align-middle sm:px-6 lg:px-8 bg-white p-5">
                {loading ? (
                  <p className="text-center py-10 text-gray-500">Cargando productos...</p>
                ) : products.length === 0 ? (
                  <div className="text-center py-10">
                    <p className="text-xl font-bold text-gray-900 mb-2">No se encontraron resultados</p>
                    <p className="text-gray-500">{search ? `No hay productos con "${search}"` : 'No hay productos'}</p>
                  </div>
                ) : (
                  <table className="min-w-full divide-y divide-gray-300">
                    <thead>
                      <tr>
                        {['Producto', 'Precio', 'Categoría', ''].map((h) => (
                          <th key={h} scope="col" className="py-3.5 pl-4 pr-3 text-left text-sm font-semibold text-gray-900 sm:pl-0">
                            {h}
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200">
                      {products.map((product) => (
                        <tr key={product.id}>
                          <td className="whitespace-nowrap py-4 pl-4 pr-3 text-sm font-medium text-gray-900 sm:pl-0">
                            {product.name}
                          </td>
                          <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                            {formatCurrency(product.price)}
                          </td>
                          <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                            {product.category?.name || 'Sin categoría'}
                          </td>
                          <td className="relative whitespace-nowrap py-4 pl-3 pr-4 text-right text-sm font-medium sm:pr-0">
                            <Link
                              to={`/vistas/admin/products/${product.id}/edit`}
                              className="text-indigo-600 hover:text-indigo-800"
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
            </div>
          </div>
        </div>

        {/* Pagination */}
        {pagination && pagination.pages > 1 && (
          <nav className="flex justify-center gap-1 py-9">
            <button
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={page === 1}
              className="px-4 py-2 bg-white border border-gray-200 text-sm disabled:opacity-40"
            >
              «
            </button>
            {Array.from({ length: pagination.pages }, (_, i) => i + 1).map((n) => (
              <button
                key={n}
                onClick={() => setPage(n)}
                className={`px-4 py-2 border text-sm ${n === page ? 'bg-indigo-600 text-white border-indigo-600 font-bold' : 'bg-white border-gray-200'}`}
              >
                {n}
              </button>
            ))}
            <button
              onClick={() => setPage((p) => Math.min(pagination.pages, p + 1))}
              disabled={page === pagination.pages}
              className="px-4 py-2 bg-white border border-gray-200 text-sm disabled:opacity-40"
            >
              »
            </button>
          </nav>
        )}
      </main>
    </div>
  );
}
