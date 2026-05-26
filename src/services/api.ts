// ─── Tipos ────────────────────────────────────────────────────────────────────
export type Category = {
  id: number;
  name: string;
  icon: string;
};
 
export type Product = {
  id: number;
  name: string;
  price: number;
  categoryId: number;
  image: string | null;
  category?: Category;
};
 
type Pagination = {
  total: number;
  page: number;
  pages: number;
};
 
// ─── Config ───────────────────────────────────────────────────────────────────
const BASE_URL = (import.meta as any).env?.VITE_API_URL ?? 'http://localhost:3001/api';
 
async function request<T>(path: string, options?: RequestInit): Promise<T> {
  const res = await fetch(`${BASE_URL}${path}`, options);
  if (!res.ok) {
    const err = await res.json().catch(() => ({ error: res.statusText }));
    throw new Error(err.error ?? 'Error en la petición');
  }
  return res.json() as Promise<T>;
}
 
// ─── getProducts ─────────────────────────────────────────────────────────────
// Devuelve { products, pagination, error }
export async function getProducts(
  search?: string,
  categoryId?: number,
  page = 1,
  limit = 10
): Promise<{ products: Product[]; pagination: Pagination; error: string | null }> {
  try {
    const q = new URLSearchParams();
    if (search)     q.set('search', search);
    if (categoryId) q.set('categoryId', String(categoryId));
    q.set('page', String(page));
    q.set('limit', String(limit));
 
    const data = await request<{ data: Product[]; total: number; page: number; totalPages: number }>(
      `/products?${q}`
    );
 
    return {
      products: data.data.map((p) => ({ ...p, price: Number(p.price) })),
      pagination: { total: data.total, page: data.page, pages: data.totalPages },
      error: null,
    };
  } catch (e) {
    return { products: [], pagination: { total: 0, page: 1, pages: 0 }, error: (e as Error).message };
  }
}
 
// ─── getProductById ───────────────────────────────────────────────────────────
// Devuelve { product, error }
export async function getProductById(
  id: number
): Promise<{ product: Product | null; error: string | null }> {
  try {
    const product = await request<Product>(`/products/${id}`);
    return { product: { ...product, price: Number(product.price) }, error: null };
  } catch (e) {
    return { product: null, error: (e as Error).message };
  }
}
 
// ─── createProduct ────────────────────────────────────────────────────────────
// Devuelve { product, error }
export async function createProduct(
  name: string,
  price: number,
  categoryId: number,
  image?: string
): Promise<{ product: Product | null; error: string | null }> {
  try {
    const formData = new FormData();
    formData.append('name', name);
    formData.append('price', String(price));
    formData.append('categoryId', String(categoryId));
    // Si la imagen es una URL de objeto local (File), no la podemos enviar como string
    // El formulario de AdminNewProduct pasa imagePreview (objectURL), no el File real.
    // Para subir archivo real se necesitaría pasar el File; aquí guardamos el emoji/string.
    if (image) formData.append('imageEmoji', image);
 
    const product = await request<Product>('/products', { method: 'POST', body: formData });
    return { product, error: null };
  } catch (e) {
    return { product: null, error: (e as Error).message };
  }
}
 
// ─── updateProduct ────────────────────────────────────────────────────────────
// Devuelve { product, error }
export async function updateProduct(
  id: number,
  data: { name?: string; price?: number; categoryId?: number; image?: string }
): Promise<{ product: Product | null; error: string | null }> {
  try {
    const formData = new FormData();
    if (data.name)       formData.append('name', data.name);
    if (data.price)      formData.append('price', String(data.price));
    if (data.categoryId) formData.append('categoryId', String(data.categoryId));
    if (data.image)      formData.append('imageEmoji', data.image);
 
    const product = await request<Product>(`/products/${id}`, { method: 'PUT', body: formData });
    return { product, error: null };
  } catch (e) {
    return { product: null, error: (e as Error).message };
  }
}
 
// ─── deleteProduct ────────────────────────────────────────────────────────────
// Devuelve { error }
export async function deleteProduct(
  id: number
): Promise<{ error: string | null }> {
  try {
    await request(`/products/${id}`, { method: 'DELETE' });
    return { error: null };
  } catch (e) {
    return { error: (e as Error).message };
  }
}