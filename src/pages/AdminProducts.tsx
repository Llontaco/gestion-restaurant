import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import AdminSidebar from '../components/AdminSidebar';
import { getProducts } from '../services/api';
import type { Product } from '../services/api';

const PER_PAGE = 7;

function paginationBtn(active: boolean): React.CSSProperties {
  return {
    display: 'inline-block',
    padding: '8px 16px',
    background: '#fff',
    color: '#111827',
    fontSize: 14,
    border: 'none',
    boxShadow: '0 0 0 1px #d1d5db inset',
    cursor: 'pointer',
    fontWeight: active ? 900 : 400,
    fontFamily: "'Inter', sans-serif",
  };
}

export default function AdminProducts() {
  const [products, setProducts] = useState<Product[]>([]);
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [pagination, setPagination] = useState<any>(null);

  // Cargar productos cuando cambia la búsqueda o página
  useEffect(() => {
    async function fetchProducts() {
      setLoading(true);
      setError(null);
      const { products: data, pagination: pag, error: err } = await getProducts(search || undefined, undefined, page, PER_PAGE);
      if (err) {
        setError(err);
        setProducts([]);
      } else {
        setProducts(data);
        setPagination(pag);
      }
      setLoading(false);
    }
    fetchProducts();
  }, [search, page]);

  function handleSearch(e: React.FormEvent) {
    e.preventDefault();
    setPage(1);
  }

  return (
    <div style={{ display: 'flex', minHeight: '100vh', fontFamily: "'Inter', sans-serif", background: '#f3f4f6' }}>
      <AdminSidebar active="products" />

      <main style={{ flex: 1, padding: 24, overflowY: 'auto' }}>
        <h1 style={{ fontSize: 28, fontWeight: 900, color: '#111827', marginBottom: 24 }}>
          Administrar productos
        </h1>

        {/* Toolbar */}
        <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'space-between', alignItems: 'center', gap: 16, marginBottom: 32 }}>
          <Link
            to="/vistas/admin/products/new"
            style={{
              display: 'inline-block',
              background: '#fbbf24',
              color: '#111827',
              padding: '12px 36px',
              fontWeight: 700,
              fontSize: 18,
              textDecoration: 'none',
              whiteSpace: 'nowrap',
            }}
          >
            Crear Producto
          </Link>
          <form onSubmit={handleSearch} style={{ display: 'flex' }}>
            <input
              type="text"
              placeholder="Buscar Producto"
              value={search}
              onChange={(e) => { setSearch(e.target.value); setPage(1); }}
              style={{
                padding: '10px 14px',
                background: '#fff',
                border: '1px solid #d1d5db',
                fontSize: 15,
                width: 260,
                color: '#111827',
                outline: 'none',
                borderRight: 'none',
                fontFamily: "'Inter', sans-serif",
              }}
            />
            <button
              type="submit"
              style={{
                background: '#4f46e5',
                color: '#fff',
                border: 'none',
                padding: '10px 20px',
                fontSize: 15,
                fontWeight: 600,
                cursor: 'pointer',
                textTransform: 'uppercase',
                fontFamily: "'Inter', sans-serif",
              }}
            >
              Buscar
            </button>
          </form>
        </div>

        {/* Tabla */}
        <div style={{ background: '#fff', padding: 20, overflowX: 'auto' }}>
          {loading ? (
            <div style={{ textAlign: 'center', padding: '40px 0' }}>
              <p style={{ fontSize: 16, color: '#6b7280' }}>Cargando productos...</p>
            </div>
          ) : error ? (
            <div style={{ background: '#fee2e2', border: '1px solid #fca5a5', borderRadius: 4, padding: '12px 16px', color: '#991b1b' }}>
              Error: {error}
            </div>
          ) : products.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '40px 0' }}>
              <p style={{ fontSize: 20, fontWeight: 700, color: '#111827', marginBottom: 8 }}>
                No se encontraron resultados
              </p>
              <p style={{ color: '#6b7280' }}>
                {search ? `No hay productos que coincidan con "${search}"` : 'No hay productos disponibles'}
              </p>
            </div>
          ) : (
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr>
                  {['Producto', 'Precio', 'Categoría', ''].map((h) => (
                    <th
                      key={h}
                      style={{
                        textAlign: 'left',
                        fontSize: 13,
                        fontWeight: 600,
                        color: '#111827',
                        padding: '12px 12px 12px 4px',
                        borderBottom: '2px solid #e5e7eb',
                      }}
                    >
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {products.map((product) => (
                  <tr key={product.id} style={{ borderBottom: '1px solid #e5e7eb' }}>
                    <td style={{ padding: '16px 12px 16px 4px', fontSize: 14, color: '#111827' }}>
                      <span style={{ marginRight: 8 }}>{product.image || '📦'}</span>
                      {product.name}
                    </td>
                    <td style={{ padding: '16px 12px 16px 4px', fontSize: 14, color: '#6b7280' }}>
                      ${product.price.toFixed(2)}
                    </td>
                    <td style={{ padding: '16px 12px 16px 4px', fontSize: 14, color: '#6b7280' }}>
                      {product.category?.name || 'Sin categoría'}
                    </td>
                    <td style={{ padding: '16px 12px 16px 4px' }}>
                      <Link
                        to={`/vistas/admin/products/${product.id}/edit`}
                        style={{ color: '#4f46e5', textDecoration: 'none', fontWeight: 500, fontSize: 14 }}
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
          <nav style={{ display: 'flex', justifyContent: 'center', padding: '36px 0' }}>
            <button onClick={() => setPage((p) => Math.max(1, p - 1))} disabled={page === 1} style={paginationBtn(false)}>«</button>
            {Array.from({ length: pagination.pages }, (_, i) => i + 1).map((n) => (
              <button key={n} onClick={() => setPage(n)} style={paginationBtn(n === page)}>{n}</button>
            ))}
            <button onClick={() => setPage((p) => Math.min(pagination.pages, p + 1))} disabled={page === pagination.pages} style={paginationBtn(false)}>»</button>
          </nav>
        )}
      </main>
    </div>
  );
}
