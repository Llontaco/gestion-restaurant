import { useState, useRef } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import AdminSidebar from '../components/AdminSidebar';
import { CATEGORIES, PRODUCTS } from '../data/mockData';

const inputStyle: React.CSSProperties = {
  display: 'block',
  width: '100%',
  padding: 12,
  background: '#f1f5f9',
  border: 'none',
  outline: 'none',
  fontSize: 15,
  color: '#111827',
  fontFamily: "'Inter', sans-serif",
};

export default function AdminEditProduct() {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const source = PRODUCTS.find((p) => p.id === Number(id)) ?? PRODUCTS[0];

  const [name, setName] = useState(source.name);
  const [price, setPrice] = useState(String(source.price));
  const [categoryId, setCategoryId] = useState(String(source.categoryId));
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [saved, setSaved] = useState(false);
  const [deleted, setDeleted] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  function handleImageChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (file) setImagePreview(URL.createObjectURL(file));
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    // En producción: PUT /api/products/:id
    setSaved(true);
    setTimeout(() => navigate('/vistas/admin/products'), 1800);
  }

  function handleDelete() {
    setShowModal(false);
    // En producción: DELETE /api/products/:id
    setDeleted(true);
    setTimeout(() => navigate('/vistas/admin/products'), 1800);
  }

  return (
    <div style={{ display: 'flex', minHeight: '100vh', fontFamily: "'Inter', sans-serif", background: '#f3f4f6' }}>
      <AdminSidebar active="products" />

      <main style={{ flex: 1, padding: 24, overflowY: 'auto' }}>
        <h1 style={{ fontSize: 28, fontWeight: 900, color: '#111827', marginBottom: 12 }}>
          Editar Producto: {source.name}
        </h1>

        <button
          onClick={() => navigate('/vistas/admin/products')}
          style={{
            display: 'inline-flex', alignItems: 'center', gap: 8,
            background: '#111827', color: '#fff', padding: '10px 20px',
            border: 'none', fontWeight: 600, fontSize: 14,
            cursor: 'pointer', marginBottom: 24, borderRadius: 2,
            fontFamily: "'Inter', sans-serif",
          }}
        >
          ← Volver
        </button>

        {/* Banners */}
        {(saved || deleted) && (
          <div
            style={{
              background: deleted ? '#fee2e2' : '#dcfce7',
              border: `1px solid ${deleted ? '#fca5a5' : '#86efac'}`,
              borderRadius: 4, padding: '12px 16px', marginBottom: 16,
              color: deleted ? '#991b1b' : '#166534', fontWeight: 600,
            }}
          >
            {deleted ? '✓ Producto eliminado. Redirigiendo...' : '✓ Cambios guardados. Redirigiendo...'}
          </div>
        )}

        {/* Modal Confirmación */}
        {showModal && (
          <div
            style={{
              position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)',
              display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 100,
            }}
          >
            <div style={{ background: '#fff', padding: 32, borderRadius: 12, maxWidth: 400, textAlign: 'center', boxShadow: '0 20px 60px rgba(0,0,0,0.3)' }}>
              <div style={{ fontSize: 48, marginBottom: 12 }}>⚠️</div>
              <p style={{ fontSize: 20, fontWeight: 700, marginBottom: 8 }}>¿Eliminar producto?</p>
              <p style={{ color: '#6b7280', marginBottom: 24, fontSize: 15 }}>
                Esta acción no se puede deshacer.
              </p>
              <div style={{ display: 'flex', gap: 12, justifyContent: 'center' }}>
                <button
                  onClick={() => setShowModal(false)}
                  style={{ padding: '10px 24px', background: '#f3f4f6', border: 'none', fontWeight: 600, cursor: 'pointer', borderRadius: 4, fontFamily: "'Inter', sans-serif" }}
                >
                  Cancelar
                </button>
                <button
                  onClick={handleDelete}
                  style={{ padding: '10px 24px', background: '#dc2626', color: '#fff', border: 'none', fontWeight: 700, cursor: 'pointer', borderRadius: 4, fontFamily: "'Inter', sans-serif" }}
                >
                  Eliminar
                </button>
              </div>
            </div>
          </div>
        )}

        <div style={{ background: '#fff', maxWidth: 640, borderRadius: 4, padding: 32 }}>
          <form onSubmit={handleSubmit}>
            {/* Nombre */}
            <div style={{ marginBottom: 20 }}>
              <label style={{ display: 'block', color: '#1e293b', fontWeight: 500, marginBottom: 8 }}>Nombre:</label>
              <input type="text" value={name} onChange={(e) => setName(e.target.value)} required style={inputStyle} />
            </div>

            {/* Precio */}
            <div style={{ marginBottom: 20 }}>
              <label style={{ display: 'block', color: '#1e293b', fontWeight: 500, marginBottom: 8 }}>Precio:</label>
              <input type="number" value={price} onChange={(e) => setPrice(e.target.value)} required min={0} style={inputStyle} />
            </div>

            {/* Categoría */}
            <div style={{ marginBottom: 20 }}>
              <label style={{ display: 'block', color: '#1e293b', fontWeight: 500, marginBottom: 8 }}>Categoría:</label>
              <select value={categoryId} onChange={(e) => setCategoryId(e.target.value)} required style={inputStyle}>
                <option value="">-- Seleccione --</option>
                {CATEGORIES.map((cat) => (
                  <option key={cat.id} value={cat.id}>{cat.name}</option>
                ))}
              </select>
            </div>

            {/* Imagen actual */}
            <div style={{ marginBottom: 16 }}>
              <p style={{ fontSize: 14, fontWeight: 600, color: '#374151', marginBottom: 8 }}>Imagen actual:</p>
              <div style={{ width: 160, height: 120, background: 'linear-gradient(135deg, #fef3c7, #fde68a)', borderRadius: 8, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 48, border: '1px solid #e5e7eb' }}>
                {source.image}
              </div>
            </div>

            {/* Nueva imagen */}
            <div
              onClick={() => fileRef.current?.click()}
              style={{ border: '2px dashed #d1d5db', borderRadius: 8, padding: 32, textAlign: 'center', cursor: 'pointer', background: '#f9fafb', marginBottom: 20 }}
            >
              {imagePreview ? (
                <img src={imagePreview} alt="nueva imagen" style={{ maxHeight: 100, objectFit: 'contain' }} />
              ) : (
                <>
                  <div style={{ fontSize: 36, marginBottom: 8 }}>📷</div>
                  <p style={{ fontSize: 15, fontWeight: 600, color: '#374151' }}>Cambiar imagen</p>
                  <p style={{ fontSize: 13, color: '#9ca3af', marginTop: 4 }}>PNG, JPG, WEBP hasta 5MB</p>
                </>
              )}
              <input ref={fileRef} type="file" accept="image/*" style={{ display: 'none' }} onChange={handleImageChange} />
            </div>

            <div style={{ display: 'flex', gap: 12, marginTop: 8 }}>
              <button type="submit" style={{ flex: 1, padding: 14, background: '#4f46e5', color: '#fff', border: 'none', fontWeight: 700, fontSize: 16, textTransform: 'uppercase', cursor: 'pointer', borderRadius: 2, fontFamily: "'Inter', sans-serif" }}>
                Guardar Cambios
              </button>
              <button type="button" onClick={() => setShowModal(true)} style={{ padding: '14px 24px', background: '#dc2626', color: '#fff', border: 'none', fontWeight: 700, fontSize: 16, cursor: 'pointer', borderRadius: 2, fontFamily: "'Inter', sans-serif" }}>
                Eliminar
              </button>
            </div>
          </form>
        </div>
      </main>
    </div>
  );
}
