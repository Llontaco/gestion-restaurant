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

export type CartItem = {
  id: number;
  name: string;
  price: number;
  quantity: number;
};

export type OrderProductItem = {
  id: number;
  orderId: number;
  productId: number;
  quantity: number;
  product: Product;
};

export type Order = {
  id: number;
  name: string;
  total: number;
  status: boolean;
  orderReadyAt: string | null;
  createdAt: string;
  orderItems: OrderProductItem[];
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

// ─── getCategories ────────────────────────────────────────────────────────────
export async function getCategories(): Promise<{ categories: Category[]; error: string | null }> {
  try {
    const categories = await request<Category[]>('/categories');
    return { categories, error: null };
  } catch (e) {
    return { categories: [], error: (e as Error).message };
  }
}

// ─── getProducts ─────────────────────────────────────────────────────────────
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
export async function createProduct(
  name: string,
  price: number,
  categoryId: number,
  imageFile?: File
): Promise<{ product: Product | null; error: string | null }> {
  try {
    const formData = new FormData();
    formData.append('name', name);
    formData.append('price', String(price));
    formData.append('categoryId', String(categoryId));
    if (imageFile) formData.append('image', imageFile);

    const product = await request<Product>('/products', { method: 'POST', body: formData });
    return { product, error: null };
  } catch (e) {
    return { product: null, error: (e as Error).message };
  }
}

// ─── updateProduct ────────────────────────────────────────────────────────────
export async function updateProduct(
  id: number,
  data: { name?: string; price?: number; categoryId?: number; imageFile?: File }
): Promise<{ product: Product | null; error: string | null }> {
  try {
    const formData = new FormData();
    if (data.name)       formData.append('name', data.name);
    if (data.price)      formData.append('price', String(data.price));
    if (data.categoryId) formData.append('categoryId', String(data.categoryId));
    if (data.imageFile)  formData.append('image', data.imageFile);

    const product = await request<Product>(`/products/${id}`, { method: 'PUT', body: formData });
    return { product, error: null };
  } catch (e) {
    return { product: null, error: (e as Error).message };
  }
}

// ─── deleteProduct ────────────────────────────────────────────────────────────
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

// ─── createOrder ──────────────────────────────────────────────────────────────
export async function createOrder(
  name: string,
  total: number,
  order: CartItem[]
): Promise<{ order: Order | null; error: string | null }> {
  try {
    const newOrder = await request<Order>('/orders', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name, total, order }),
    });
    return { order: newOrder, error: null };
  } catch (e) {
    return { order: null, error: (e as Error).message };
  }
}

// ─── getPendingOrders ─────────────────────────────────────────────────────────
export async function getPendingOrders(): Promise<{ orders: Order[]; error: string | null }> {
  try {
    const orders = await request<Order[]>('/orders/pending');
    return { orders, error: null };
  } catch (e) {
    return { orders: [], error: (e as Error).message };
  }
}

// ─── getReadyOrders ───────────────────────────────────────────────────────────
export async function getReadyOrders(): Promise<{ orders: Order[]; error: string | null }> {
  try {
    const orders = await request<Order[]>('/orders/ready');
    return { orders, error: null };
  } catch (e) {
    return { orders: [], error: (e as Error).message };
  }
}

// ─── completeOrder ────────────────────────────────────────────────────────────
export async function completeOrder(
  id: number
): Promise<{ error: string | null }> {
  try {
    await request(`/orders/${id}/complete`, { method: 'PUT' });
    return { error: null };
  } catch (e) {
    return { error: (e as Error).message };
  }
}

// ─── Autenticación ──────────────────────────────────────────────────────────────
export type AuthUser = {
  id: number;
  name: string;
  email: string;
};

export async function registerUser(
  name: string,
  email: string,
  password: string
): Promise<{ user: AuthUser | null; error: string | null }> {
  try {
    const user = await request<AuthUser>('/auth/register', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name, email, password }),
    });
    return { user, error: null };
  } catch (e) {
    return { user: null, error: (e as Error).message };
  }
}

export async function loginUser(
  email: string,
  password: string
): Promise<{ user: AuthUser | null; error: string | null }> {
  try {
    const user = await request<AuthUser>('/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
    });
    return { user, error: null };
  } catch (e) {
    return { user: null, error: (e as Error).message };
  }
}
