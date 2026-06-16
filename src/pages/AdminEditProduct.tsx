import { useState, useEffect, useRef } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import AdminLayout from '../components/AdminLayout';
import { getCategories, getProductById, updateProduct, deleteProduct } from '../services/api';
import { getImagePath } from '../utils';
import { ArrowLeftIcon, CameraIcon } from '../components/icons';
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

  const backLink = (
    <Link
      to="/vistas/admin/products"
      className="flex items-center gap-1.5 text-gray-500 hover:text-gray-900 font-semibold text-sm"
    >
      <ArrowLeftIcon className="w-4 h-4" />
      Volver
    </Link>
  );

  if (loading) return (
    <AdminLayout title="Editar Producto" action={backLink}>
      <p className="text-gray-500">Cargando producto...</p>
    </AdminLayout>
  );

  if (!product) return (
    <AdminLayout title="Editar Producto" action={backLink}>
      <p className="text-gray-500">Producto no encontrado</p>
    </AdminLayout>
  );

  return (
    <AdminLayout title="Editar Producto" action={backLink}>
      {(saved || deleted) && (
        <div className={`${deleted ? 'bg-red-50 border-red-200 text-red-700' : 'bg-green-50 border-green-200 text-green-700'} border rounded-lg p-3 mb-4 font-semibold`}>
          {deleted ? '✓ Producto eliminado. Redirigiendo...' : '✓ Cambios guardados. Redirigiendo...'}
        </div>
      )}
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 rounded-lg p-3 mb-4">
          Error: {error}
        </div>
      )}

      {/* Modal confirmación */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white p-8 rounded-2xl max-w-sm w-full text-center shadow-2xl">
            <p className="font-serif text-xl font-bold mb-2 text-gray-900">¿Eliminar producto?</p>
            <p className="text-gray-500 mb-6 text-sm">Esta acción no se puede deshacer.</p>
            <div className="flex gap-3 justify-center">
              <button onClick={() => setShowModal(false)} className="px-6 py-2.5 bg-stone-100 hover:bg-stone-200 rounded-lg font-semibold transition-colors">Cancelar</button>
              <button onClick={handleDelete} disabled={isDeleting} className="px-6 py-2.5 bg-red-600 hover:bg-red-700 text-white rounded-lg font-bold disabled:opacity-60 transition-colors">
                {isDeleting ? 'Eliminando...' : 'Eliminar'}
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-8 max-w-2xl">
        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="block text-gray-700 font-semibold mb-2 text-sm">Nombre</label>
            <input type="text" value={name} onChange={(e) => setName(e.target.value)} required className="bg-stone-50 border border-gray-200 rounded-lg p-3 w-full outline-none focus:border-brand" />
          </div>
          <div>
            <label className="block text-gray-700 font-semibold mb-2 text-sm">Precio</label>
            <input type="number" value={price} onChange={(e) => setPrice(e.target.value)} required min={0} step={0.01} className="bg-stone-50 border border-gray-200 rounded-lg p-3 w-full outline-none focus:border-brand" />
          </div>
          <div>
            <label className="block text-gray-700 font-semibold mb-2 text-sm">Categoría</label>
            <select value={categoryId} onChange={(e) => setCategoryId(e.target.value)} required className="bg-stone-50 border border-gray-200 rounded-lg p-3 w-full outline-none focus:border-brand">
              <option value="">-- Seleccione --</option>
              {categories.map((cat) => (
                <option key={cat.id} value={cat.id}>{cat.name}</option>
              ))}
            </select>
          </div>

          {/* Imagen actual */}
          <div>
            <p className="text-sm font-semibold text-gray-700 mb-2">Imagen actual</p>
            <div className="w-40 h-32 bg-brand-light rounded-xl overflow-hidden border border-gray-100 flex items-center justify-center">
              {getImagePath(product.image) ? (
                <img src={getImagePath(product.image)} alt={product.name} className="w-full h-full object-cover" />
              ) : (
                <CameraIcon className="w-8 h-8 text-gray-300" />
              )}
            </div>
          </div>

          {/* Nueva imagen */}
          <div
            onClick={() => fileRef.current?.click()}
            className="border-2 border-dashed border-gray-200 rounded-xl p-8 text-center cursor-pointer bg-stone-50 hover:bg-stone-100 transition-colors"
          >
            {imagePreview ? (
              <img src={imagePreview} alt="nueva imagen" className="max-h-28 object-contain mx-auto" />
            ) : (
              <>
                <CameraIcon className="w-9 h-9 mx-auto text-gray-400 mb-2" />
                <p className="font-semibold text-gray-700">Cambiar imagen</p>
                <p className="text-xs text-gray-400 mt-1">PNG, JPG, WEBP hasta 5MB</p>
              </>
            )}
            <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={handleImageChange} />
          </div>

          <div className="flex gap-3">
            <button type="submit" disabled={isSaving} className="flex-1 bg-brand hover:bg-brand-dark disabled:opacity-50 text-white py-3 rounded-lg font-bold transition-colors">
              {isSaving ? 'Guardando...' : 'Guardar Cambios'}
            </button>
            <button type="button" onClick={() => setShowModal(true)} disabled={isDeleting} className="px-6 bg-red-600 hover:bg-red-700 text-white rounded-lg font-bold transition-colors disabled:opacity-60">
              Eliminar
            </button>
          </div>
        </form>
      </div>
    </AdminLayout>
  );
}
