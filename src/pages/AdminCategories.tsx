import { useState, useEffect } from 'react';
import AdminLayout from '../components/AdminLayout';
import { getCategories, createCategory, updateCategory, deleteCategory } from '../services/api';
import { PlusIcon, XIcon } from '../components/icons';
import type { Category } from '../services/api';

export default function AdminCategories() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Formulario de creación
  const [newName, setNewName] = useState('');
  const [newIcon, setNewIcon] = useState('');
  const [creating, setCreating] = useState(false);

  // Edición (modal)
  const [editing, setEditing] = useState<Category | null>(null);
  const [editName, setEditName] = useState('');
  const [editIcon, setEditIcon] = useState('');
  const [savingEdit, setSavingEdit] = useState(false);

  async function load() {
    setLoading(true);
    const { categories: cats, error: err } = await getCategories();
    if (err) setError(err);
    else setCategories(cats);
    setLoading(false);
  }

  useEffect(() => { load(); }, []);

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault();
    if (!newName.trim() || !newIcon.trim()) return;
    setCreating(true);
    setError(null);
    const { error: err } = await createCategory(newName.trim(), newIcon.trim());
    setCreating(false);
    if (err) { setError(err); return; }
    setNewName('');
    setNewIcon('');
    load();
  }

  function openEdit(cat: Category) {
    setEditing(cat);
    setEditName(cat.name);
    setEditIcon(cat.icon);
    setError(null);
  }

  async function handleSaveEdit(e: React.FormEvent) {
    e.preventDefault();
    if (!editing) return;
    setSavingEdit(true);
    setError(null);
    const { error: err } = await updateCategory(editing.id, {
      name: editName.trim(),
      icon: editIcon.trim(),
    });
    setSavingEdit(false);
    if (err) { setError(err); return; }
    setEditing(null);
    load();
  }

  async function handleDelete(cat: Category) {
    if (!confirm(`¿Eliminar la categoría "${cat.name}"?`)) return;
    setError(null);
    const { error: err } = await deleteCategory(cat.id);
    if (err) { setError(err); return; }
    load();
  }

  return (
    <AdminLayout title="Administrar categorías">
      {error && (
        <div className="mb-5 bg-red-50 border border-red-200 text-red-700 rounded-lg p-3 text-sm">
          {error}
        </div>
      )}

      {/* Crear categoría */}
      <form
        onSubmit={handleCreate}
        className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 mb-6 flex flex-col sm:flex-row gap-3 sm:items-end"
      >
        <div className="flex-1">
          <label className="block text-gray-700 font-semibold mb-1.5 text-sm">Nombre</label>
          <input
            type="text"
            value={newName}
            onChange={(e) => setNewName(e.target.value)}
            placeholder="Ej. Bebidas"
            className="w-full bg-stone-50 border border-gray-200 rounded-lg px-3 py-2.5 text-sm outline-none focus:border-brand"
          />
        </div>
        <div className="w-full sm:w-28">
          <label className="block text-gray-700 font-semibold mb-1.5 text-sm">Ícono</label>
          <input
            type="text"
            value={newIcon}
            onChange={(e) => setNewIcon(e.target.value)}
            placeholder="🥤"
            maxLength={4}
            className="w-full bg-stone-50 border border-gray-200 rounded-lg px-3 py-2.5 text-center text-lg outline-none focus:border-brand"
          />
        </div>
        <button
          type="submit"
          disabled={creating || !newName.trim() || !newIcon.trim()}
          className="flex items-center justify-center gap-2 bg-brand hover:bg-brand-dark disabled:opacity-50 text-white font-bold px-5 py-2.5 rounded-lg transition-colors"
        >
          <PlusIcon className="w-5 h-5" />
          {creating ? 'Creando...' : 'Crear'}
        </button>
      </form>

      {/* Listado */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        {loading ? (
          <p className="text-center py-12 text-gray-500">Cargando categorías...</p>
        ) : categories.length === 0 ? (
          <div className="text-center py-12">
            <p className="font-serif text-xl font-bold text-gray-900 mb-1">Sin categorías</p>
            <p className="text-gray-500">Crea la primera con el formulario de arriba.</p>
          </div>
        ) : (
          <ul className="divide-y divide-gray-100">
            {categories.map((cat) => (
              <li key={cat.id} className="flex items-center gap-4 px-4 sm:px-6 py-4">
                <span className="w-11 h-11 rounded-xl bg-brand-light flex items-center justify-center text-2xl flex-shrink-0">
                  {cat.icon}
                </span>
                <span className="flex-1 font-semibold text-gray-900">{cat.name}</span>
                <button
                  onClick={() => openEdit(cat)}
                  className="text-sm font-semibold text-brand hover:text-brand-dark px-2"
                >
                  Editar
                </button>
                <button
                  onClick={() => handleDelete(cat)}
                  className="text-sm font-semibold text-red-500 hover:text-red-700 px-2"
                >
                  Eliminar
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>

      {/* Modal de edición */}
      {editing && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-serif text-2xl font-bold text-gray-900">Editar categoría</h2>
              <button
                onClick={() => setEditing(null)}
                className="text-gray-400 hover:text-gray-700"
                aria-label="Cerrar"
              >
                <XIcon className="w-5 h-5" />
              </button>
            </div>
            <form onSubmit={handleSaveEdit} className="space-y-4">
              <div>
                <label className="block text-gray-700 font-semibold mb-1.5 text-sm">Nombre</label>
                <input
                  type="text"
                  value={editName}
                  onChange={(e) => setEditName(e.target.value)}
                  className="w-full bg-stone-50 border border-gray-200 rounded-lg px-3 py-2.5 text-sm outline-none focus:border-brand"
                />
              </div>
              <div>
                <label className="block text-gray-700 font-semibold mb-1.5 text-sm">Ícono (emoji)</label>
                <input
                  type="text"
                  value={editIcon}
                  onChange={(e) => setEditIcon(e.target.value)}
                  maxLength={4}
                  className="w-full bg-stone-50 border border-gray-200 rounded-lg px-3 py-2.5 text-center text-lg outline-none focus:border-brand"
                />
              </div>
              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setEditing(null)}
                  className="flex-1 border border-gray-200 text-gray-700 font-semibold py-2.5 rounded-lg hover:bg-stone-50"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={savingEdit || !editName.trim() || !editIcon.trim()}
                  className="flex-1 bg-brand hover:bg-brand-dark disabled:opacity-50 text-white font-bold py-2.5 rounded-lg transition-colors"
                >
                  {savingEdit ? 'Guardando...' : 'Guardar'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </AdminLayout>
  );
}
