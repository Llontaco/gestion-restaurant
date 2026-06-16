import { useState, useRef, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import AdminLayout from '../components/AdminLayout';
import { createProduct, getCategories } from '../services/api';
import { ArrowLeftIcon, CameraIcon } from '../components/icons';
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
    <AdminLayout
      title="Nuevo Producto"
      action={
        <Link
          to="/vistas/admin/products"
          className="flex items-center gap-1.5 text-gray-500 hover:text-gray-900 font-semibold text-sm"
        >
          <ArrowLeftIcon className="w-4 h-4" />
          Volver
        </Link>
      }
    >
      {saved && (
        <div className="bg-green-50 border border-green-200 text-green-700 rounded-lg p-3 mb-4 font-semibold">
          ✓ Producto guardado correctamente. Redirigiendo...
        </div>
      )}
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 rounded-lg p-3 mb-4 font-semibold">
          ✗ {error}
        </div>
      )}

      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-8 max-w-2xl">
        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="block text-gray-700 font-semibold mb-2 text-sm">Nombre</label>
            <input
              type="text" value={name} onChange={(e) => setName(e.target.value)}
              placeholder="Nombre del producto" required
              className="bg-stone-50 border border-gray-200 rounded-lg p-3 w-full outline-none focus:border-brand"
            />
          </div>
          <div>
            <label className="block text-gray-700 font-semibold mb-2 text-sm">Precio</label>
            <input
              type="number" value={price} onChange={(e) => setPrice(e.target.value)}
              placeholder="Precio del producto" required min={0} step={0.01}
              className="bg-stone-50 border border-gray-200 rounded-lg p-3 w-full outline-none focus:border-brand"
            />
          </div>
          <div>
            <label className="block text-gray-700 font-semibold mb-2 text-sm">Categoría</label>
            <select
              value={categoryId} onChange={(e) => setCategoryId(e.target.value)} required
              className="bg-stone-50 border border-gray-200 rounded-lg p-3 w-full outline-none focus:border-brand"
            >
              <option value="">-- Seleccione --</option>
              {categories.map((cat) => (
                <option key={cat.id} value={cat.id}>{cat.name}</option>
              ))}
            </select>
          </div>

          {/* Subida de imagen */}
          <div
            onClick={() => fileRef.current?.click()}
            className="border-2 border-dashed border-gray-200 rounded-xl p-10 text-center cursor-pointer bg-stone-50 hover:bg-stone-100 transition-colors"
          >
            {imagePreview ? (
              <img src={imagePreview} alt="preview" className="max-h-36 object-contain rounded-lg mx-auto" />
            ) : (
              <>
                <CameraIcon className="w-10 h-10 mx-auto text-gray-400 mb-2" />
                <p className="font-semibold text-gray-700">Subir imagen del producto</p>
                <p className="text-xs text-gray-400 mt-1">PNG, JPG, WEBP hasta 5MB</p>
              </>
            )}
            <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={handleImageChange} />
          </div>

          <button
            type="submit" disabled={loading}
            className="bg-brand hover:bg-brand-dark disabled:opacity-50 text-white w-full py-3 rounded-lg font-bold transition-colors"
          >
            {loading ? 'Guardando...' : 'Guardar Producto'}
          </button>
        </form>
      </div>
    </AdminLayout>
  );
}
