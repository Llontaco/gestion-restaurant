import { useState, useEffect, useRef } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import AdminSidebar from '../components/AdminSidebar';
import { getCategories, getProductById, updateProduct, deleteProduct } from '../services/api';
import { formatCurrency, getImagePath } from '../utils';
import type { Product, Category } from '../services/api';

export default function AdminEditProduct() {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();

  const [categories, setCategories] = useState<Category[]>([]);
  const [product, setProduct] = useState<Product | null>(null);
  const [name, setName] = useState('');
  const [price, setPrice] = useState('');
  const [categoryId, setCategoryId] = useState('');
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [saved, setSaved] = useState(false);
  const [deleted, setDeleted] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  useEffect(() => { getCategories().then(({ categories: cats }) => setCategories(cats)); }, []);

  useEffect(() => {
    if (!id) return;
    getProductById(Number(id)).then(({ product: data, error: err }) => {
      if (err) { setError(err); }
      else if (data) { setProduct(data); setName(data.name); setPrice(String(data.price)); setCategoryId(String(data.categoryId)); }
      setLoading(false);
    });
  }, [id]);

  function handleImageChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (file) { setImageFile(file); setImagePreview(URL.createObjectURL(file)); }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!id) return;
    setError(null); setIsSaving(true);
    const { product: updated, error: err } = await updateProduct(Number(id), { name, price: Number(price), categoryId: Number(categoryId), imageFile: imageFile ?? undefined });
    if (err) { setError(err); setIsSaving(false); }
    else { setProduct(updated); setSaved(true); setTimeout(() => navigate('/vistas/admin/products'), 1800); }
  }

  async function handleDelete() {
    if (!id) return;
    setShowModal(false); setIsDeleting(true);
    const { error: err } = await deleteProduct(Number(id));
    if (err) { setError(err); setIsDeleting(false); }
    else { setDeleted(true); setTimeout(() => navigate('/vistas/admin/products'), 1800); }
  }

  if (loading) return (
    <div className="md:flex min-h-screen bg-gray-100">
      <AdminSidebar />
      <main className="flex-1 flex items-center justify-center"><p className="text-gray-500">Cargando producto...</p></main>
    </div>
  );

  if (!product) return (
    <div className="md:flex min-h-screen bg-gray-100">
      <AdminSidebar />
      <main className="flex-1 flex items-center justify-center"><p className="text-gray-500">Producto no encontrado</p></main>
    </div>
  );

  return (
    <div className="md:flex min-h-screen bg-gray-100">
      <AdminSidebar />

      <main className="md:flex-1 p-5 overflow-y-auto">
        <div className="flex items-center justify-between mb-5">
          <h1 className="text-3xl font-black text-gray-900">Editar Producto</h1>
          <Link to="/vistas/admin/products" className="text-indigo-600 hover:text-indigo-800 font-semibold text-sm">
            ← Volver
          </Link>
        </div>

        {(saved || deleted) && (
          <div className={`${deleted ? 'bg-red-100 border-red-300 text-red-800' : 'bg-green-100 border-green-300 text-green-800'} border rounded p-3 mb-4 font-semibold`}>
            {deleted ? '✓ Producto eliminado. Redirigiendo...' : '✓ Cambios guardados. Redirigiendo...'}
          </div>
        )}
        {error && (
          <div className="bg-red-100 border border-red-300 text-red-800 rounded p-3 mb-4">
            Error: {error}
          </div>
        )}

        {/* Modal confirmación */}
        {showModal && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
            <div className="bg-white p-8 rounded-xl max-w-sm w-full text-center shadow-2xl">
              <p className="text-5xl mb-3">⚠️</p>
              <p className="text-xl font-bold mb-2">¿Eliminar producto?</p>
              <p className="text-gray-500 mb-6 text-sm">Esta acción no se puede deshacer.</p>
              <div className="flex gap-3 justify-center">
                <button onClick={() => setShowModal(false)} className="px-6 py-2 bg-gray-100 rounded font-semibold">Cancelar</button>
                <button onClick={handleDelete} disabled={isDeleting} className="px-6 py-2 bg-red-600 text-white rounded font-bold disabled:opacity-60">
                  {isDeleting ? 'Eliminando...' : 'Eliminar'}
                </button>
              </div>
            </div>
          </div>
        )}

        <div className="bg-white shadow rounded-lg p-8 max-w-2xl">
          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block text-slate-800 font-medium mb-2">Nombre:</label>
              <input type="text" value={name} onChange={(e) => setName(e.target.value)} required className="bg-slate-100 p-3 w-full outline-none" />
            </div>
            <div>
              <label className="block text-slate-800 font-medium mb-2">Precio:</label>
              <input type="number" value={price} onChange={(e) => setPrice(e.target.value)} required min={0} step={0.01} className="bg-slate-100 p-3 w-full outline-none" />
            </div>
            <div>
              <label className="block text-slate-800 font-medium mb-2">Categoría:</label>
              <select value={categoryId} onChange={(e) => setCategoryId(e.target.value)} required className="bg-slate-100 p-3 w-full outline-none">
                <option value="">-- Seleccione --</option>
                {categories.map((cat) => (
                  <option key={cat.id} value={cat.id}>{cat.name}</option>
                ))}
              </select>
            </div>

            {/* Current image */}
            <div>
              <p className="text-sm font-semibold text-gray-700 mb-2">Imagen actual:</p>
              <div className="w-40 h-32 bg-amber-50 rounded-lg overflow-hidden border border-gray-200 flex items-center justify-center">
                {product.image && product.image.startsWith('http') ? (
                  <img src={product.image} alt={product.name} className="w-full h-full object-cover" />
                ) : (
                  <span className="text-5xl">{product.image || '📦'}</span>
                )}
              </div>
            </div>

            {/* Upload new image */}
            <div
              onClick={() => fileRef.current?.click()}
              className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center cursor-pointer bg-gray-50 hover:bg-gray-100 transition-colors"
            >
              {imagePreview ? (
                <img src={imagePreview} alt="nueva imagen" className="max-h-28 object-contain mx-auto" />
              ) : (
                <>
                  <p className="text-3xl mb-2">📷</p>
                  <p className="font-semibold text-gray-700">Cambiar imagen</p>
                  <p className="text-xs text-gray-400 mt-1">PNG, JPG, WEBP hasta 5MB</p>
                </>
              )}
              <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={handleImageChange} />
            </div>

            <div className="flex gap-3">
              <button type="submit" disabled={isSaving} className="flex-1 bg-indigo-600 hover:bg-indigo-800 disabled:bg-gray-400 text-white p-3 uppercase font-bold transition-colors">
                {isSaving ? 'Guardando...' : 'Guardar Cambios'}
              </button>
              <button type="button" onClick={() => setShowModal(true)} disabled={isDeleting} className="px-6 bg-red-600 hover:bg-red-800 text-white font-bold transition-colors disabled:opacity-60">
                Eliminar
              </button>
            </div>
          </form>
        </div>
      </main>
    </div>
  );
}
