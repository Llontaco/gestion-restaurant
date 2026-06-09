import { useState, useRef, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import AdminSidebar from '../components/AdminSidebar';
import { createProduct, getCategories } from '../services/api';
import type { Category } from '../services/api';

export default function AdminNewProduct() {
  const navigate = useNavigate();
  const [categories, setCategories] = useState<Category[]>([]);
  const [name, setName] = useState('');
  const [price, setPrice] = useState('');
  const [categoryId, setCategoryId] = useState('');
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    getCategories().then(({ categories: cats }) => setCategories(cats));
  }, []);

  function handleImageChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (file) { setImageFile(file); setImagePreview(URL.createObjectURL(file)); }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    const { error: err } = await createProduct(name, Number(price), Number(categoryId), imageFile ?? undefined);
    if (err) { setError(err); setLoading(false); }
    else { setSaved(true); setTimeout(() => navigate('/vistas/admin/products'), 1800); }
  }

  return (
    <div className="md:flex min-h-screen bg-gray-100">
      <AdminSidebar />

      <main className="md:flex-1 p-5 overflow-y-auto">
        <div className="flex items-center justify-between mb-5">
          <h1 className="text-3xl font-black text-gray-900">Nuevo Producto</h1>
          <Link to="/vistas/admin/products" className="text-indigo-600 hover:text-indigo-800 font-semibold text-sm">
            ← Volver
          </Link>
        </div>

        {saved && (
          <div className="bg-green-100 border border-green-300 text-green-800 rounded p-3 mb-4 font-semibold">
            ✓ Producto guardado correctamente. Redirigiendo...
          </div>
        )}
        {error && (
          <div className="bg-red-100 border border-red-300 text-red-800 rounded p-3 mb-4 font-semibold">
            ✗ {error}
          </div>
        )}

        <div className="bg-white shadow rounded-lg p-8 max-w-2xl">
          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block text-slate-800 font-medium mb-2">Nombre:</label>
              <input
                type="text" value={name} onChange={(e) => setName(e.target.value)}
                placeholder="Nombre Producto" required
                className="bg-slate-100 p-3 w-full outline-none"
              />
            </div>
            <div>
              <label className="block text-slate-800 font-medium mb-2">Precio:</label>
              <input
                type="number" value={price} onChange={(e) => setPrice(e.target.value)}
                placeholder="Precio Producto" required min={0} step={0.01}
                className="bg-slate-100 p-3 w-full outline-none"
              />
            </div>
            <div>
              <label className="block text-slate-800 font-medium mb-2">Categoría:</label>
              <select
                value={categoryId} onChange={(e) => setCategoryId(e.target.value)} required
                className="bg-slate-100 p-3 w-full outline-none"
              >
                <option value="">-- Seleccione --</option>
                {categories.map((cat) => (
                  <option key={cat.id} value={cat.id}>{cat.name}</option>
                ))}
              </select>
            </div>

            {/* Image upload */}
            <div
              onClick={() => fileRef.current?.click()}
              className="border-2 border-dashed border-gray-300 rounded-lg p-10 text-center cursor-pointer bg-gray-50 hover:bg-gray-100 transition-colors"
            >
              {imagePreview ? (
                <img src={imagePreview} alt="preview" className="max-h-36 object-contain rounded-lg mx-auto" />
              ) : (
                <>
                  <p className="text-4xl mb-3">📷</p>
                  <p className="font-semibold text-gray-700">Subir imagen del producto</p>
                  <p className="text-xs text-gray-400 mt-1">PNG, JPG, WEBP hasta 5MB</p>
                </>
              )}
              <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={handleImageChange} />
            </div>

            <button
              type="submit" disabled={loading}
              className="bg-indigo-600 hover:bg-indigo-800 disabled:bg-gray-400 text-white w-full p-3 uppercase font-bold transition-colors"
            >
              {loading ? 'Guardando...' : 'Guardar Producto'}
            </button>
          </form>
        </div>
      </main>
    </div>
  );
}
