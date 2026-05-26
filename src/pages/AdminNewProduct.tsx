import { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import AdminSidebar from '../components/AdminSidebar';
import { createProduct } from '../services/api';
import type { Category } from '../services/api';
import { CATEGORIES } from '../data/mockData';

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

export default function AdminNewProduct() {
  const navigate = useNavigate();
  const [name, setName] = useState('');
  const [price, setPrice] = useState('');
  const [categoryId, setCategoryId] = useState('');
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  function handleImageChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (file) setImagePreview(URL.createObjectURL(file));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);

    if (!name || !price || !categoryId) {
      setError('Por favor completa todos los campos');
      setLoading(false);
      return;
    }

    const { product, error: err } = await createProduct(
      name,
      Number(price),
      Number(categoryId),
      imagePreview || undefined
    );

    if (err) {
      setError(err);
      setLoading(false);
    } else {
      setSaved(true);
      setTimeout(() => navigate('/vistas/admin/products'), 1800);
    }
  }

  return (
    <div style={{ display: 'flex', minHeight: '100vh', fontFamily: "'Inter', sans-serif", background: '#f3f4f6' }}>
      <AdminSidebar active="products" />

      <main style={{ flex: 1, padding: 24, overflowY: 'auto' }}>
        <h1 style={{ fontSize: 28, fontWeight: 900, color: '#111827', marginBottom: 28 }}>
          Nuevo Producto
        </h1>

        {saved && (
          <div style={{ background: '#dcfce7', border: '1px solid #86efac', borderRadius: 4, padding: '12px 16px', marginBottom: 20, color: '#166534', fontWeight: 600 }}>
            ✓ Producto guardado correctamente. Redirigiendo...
          </div>
        )}

        {error && (
          <div style={{ background: '#fee2e2', border: '1px solid #fca5a5', borderRadius: 4, padding: '12px 16px', marginBottom: 20, color: '#991b1b', fontWeight: 600 }}>
            ✗ {error}
          </div>
        )}

        <div style={{ background: '#fff', maxWidth: 640, borderRadius: 4, padding: 32 }}>
          <form onSubmit={handleSubmit}>
            <div style={{ marginBottom: 20 }}>
              <label style={{ display: 'block', color: '#1e293b', fontWeight: 500, marginBottom: 8 }}>Nombre:</label>
              <input type="text" value={name} onChange={(e) => setName(e.target.value)} placeholder="Nombre Producto" required style={inputStyle} />
            </div>

            <div style={{ marginBottom: 20 }}>
              <label style={{ display: 'block', color: '#1e293b', fontWeight: 500, marginBottom: 8 }}>Precio:</label>
              <input type="number" value={price} onChange={(e) => setPrice(e.target.value)} placeholder="Precio Producto" required min={0} step={0.01} style={inputStyle} />
            </div>

            <div style={{ marginBottom: 20 }}>
              <label style={{ display: 'block', color: '#1e293b', fontWeight: 500, marginBottom: 8 }}>Categoría:</label>
              <select value={categoryId} onChange={(e) => setCategoryId(e.target.value)} required style={inputStyle}>
                <option value="">-- Seleccione --</option>
                {CATEGORIES.map((cat) => (
                  <option key={cat.id} value={cat.id}>{cat.name}</option>
                ))}
              </select>
            </div>

            <div
              onClick={() => fileRef.current?.click()}
              style={{ border: '2px dashed #d1d5db', borderRadius: 8, padding: 40, textAlign: 'center', cursor: 'pointer', background: '#f9fafb', marginBottom: 20, transition: 'border-color .15s, background .15s' }}
            >
              {imagePreview ? (
                <img src={imagePreview} alt="preview" style={{ maxHeight: 140, objectFit: 'contain', borderRadius: 8 }} />
              ) : (
                <>
                  <div style={{ fontSize: 40, marginBottom: 12 }}>📷</div>
                  <p style={{ fontSize: 15, fontWeight: 600, color: '#374151' }}>Subir imagen del producto</p>
                  <p style={{ fontSize: 13, color: '#9ca3af', marginTop: 4 }}>Arrastra y suelta o haz clic para seleccionar</p>
                  <p style={{ fontSize: 12, color: '#9ca3af', marginTop: 8 }}>PNG, JPG, WEBP hasta 5MB</p>
                </>
              )}
              <input ref={fileRef} type="file" accept="image/*" style={{ display: 'none' }} onChange={handleImageChange} />
            </div>

            <button
              type="submit"
              disabled={loading}
              style={{
                width: '100%', padding: 14,
                background: loading ? '#9ca3af' : '#4f46e5', color: '#fff',
                border: 'none', fontWeight: 700, fontSize: 16,
                textTransform: 'uppercase', cursor: loading ? 'not-allowed' : 'pointer',
                letterSpacing: 0.5, borderRadius: 2, marginTop: 8,
                fontFamily: "'Inter', sans-serif",
              }}
            >
              {loading ? 'Guardando...' : 'Guardar Producto'}
            </button>
          </form>
        </div>
      </main>
    </div>
  );
}
