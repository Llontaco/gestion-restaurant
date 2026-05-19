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
  image: string;
};

export type OrderProduct = {
  id: number;
  name: string;
  price: number;
  quantity: number;
};

export type Order = {
  id: number;
  clientName: string;
  products: { quantity: number; name: string }[];
  total: number;
  status: 'pending' | 'ready';
};

export const CATEGORIES: Category[] = [
  { id: 1, name: 'Hamburguesa', icon: '🍔' },
  { id: 2, name: 'Café', icon: '☕' },
  { id: 3, name: 'Pizza', icon: '🍕' },
  { id: 4, name: 'Dona', icon: '🍩' },
  { id: 5, name: 'Pastel', icon: '🍰' },
  { id: 6, name: 'Galletas', icon: '🍪' },
];

export const PRODUCTS: Product[] = [
  { id: 1,  name: 'Hamburguesa Clásica',   price: 85,  categoryId: 1, image: '🍔' },
  { id: 2,  name: 'Hamburguesa BBQ',        price: 110, categoryId: 1, image: '🥩' },
  { id: 3,  name: 'Doble Queso',            price: 125, categoryId: 1, image: '🧀' },
  { id: 4,  name: 'Hamburguesa Jalapeño',   price: 100, categoryId: 1, image: '🌶️' },
  { id: 5,  name: 'Café Americano',         price: 35,  categoryId: 2, image: '☕' },
  { id: 6,  name: 'Café Latte',             price: 50,  categoryId: 2, image: '🥛' },
  { id: 7,  name: 'Capuccino',              price: 55,  categoryId: 2, image: '☕' },
  { id: 8,  name: 'Pizza Margarita',        price: 120, categoryId: 3, image: '🍕' },
  { id: 9,  name: 'Dona Glaseada',          price: 30,  categoryId: 4, image: '🍩' },
  { id: 10, name: 'Pastel de Chocolate',    price: 75,  categoryId: 5, image: '🍰' },
  { id: 11, name: 'Galletas de Avena',      price: 25,  categoryId: 6, image: '🍪' },
];

export const ORDERS_MOCK: Order[] = [
  {
    id: 1,
    clientName: 'Juan Pérez',
    products: [
      { quantity: 2, name: 'Hamburguesa Clásica' },
      { quantity: 1, name: 'Café Americano' },
      { quantity: 1, name: 'Galletas de Avena' },
    ],
    total: 245,
    status: 'pending',
  },
  {
    id: 2,
    clientName: 'María García',
    products: [
      { quantity: 1, name: 'Pizza Margarita' },
      { quantity: 2, name: 'Café Latte' },
    ],
    total: 220,
    status: 'pending',
  },
  {
    id: 3,
    clientName: 'Carlos López',
    products: [{ quantity: 3, name: 'Dona Glaseada' }],
    total: 90,
    status: 'pending',
  },
  {
    id: 4,
    clientName: 'Ana Torres',
    products: [
      { quantity: 2, name: 'Hamburguesa BBQ' },
      { quantity: 2, name: 'Capuccino' },
    ],
    total: 330,
    status: 'ready',
  },
  {
    id: 5,
    clientName: 'Luis Mendoza',
    products: [
      { quantity: 1, name: 'Pastel de Chocolate' },
      { quantity: 1, name: 'Café Latte' },
    ],
    total: 125,
    status: 'ready',
  },
];
