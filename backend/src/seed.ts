import prisma from './prismaClient';

// ─── Datos reales exportados de la BD MySQL local ──────────────────────────────
const categories = [
  { id: 1, name: 'Hamburguesa', icon: '🍔' },
  { id: 2, name: 'Café',        icon: '☕' },
  { id: 3, name: 'Pizza',       icon: '🍕' },
  { id: 4, name: 'Dona',        icon: '🍩' },
  { id: 5, name: 'Pastel',      icon: '🍰' },
  { id: 6, name: 'Galletas',    icon: '🍪' },
];

const products = [
  { id: 1,  name: 'Hamburguesa Clásica',  price: 85,  image: '/products/hamburguesas_01.jpg', categoryId: 1 },
  { id: 2,  name: 'Hamburguesa BBQ',      price: 110, image: '/products/hamburguesas_02.jpg', categoryId: 1 },
  { id: 3,  name: 'Doble Queso',          price: 125, image: '/products/hamburguesas_03.jpg', categoryId: 1 },
  { id: 4,  name: 'Hamburguesa Jalapeño', price: 100, image: '/products/hamburguesas_04.jpg', categoryId: 1 },
  { id: 5,  name: 'Café Americano',       price: 35,  image: '/products/cafe_01.jpg',         categoryId: 2 },
  { id: 6,  name: 'Café Latte',           price: 50,  image: '/products/cafe_02.jpg',         categoryId: 2 },
  { id: 7,  name: 'Capuccino',            price: 55,  image: '/products/cafe_03.jpg',         categoryId: 2 },
  { id: 8,  name: 'Pizza Margarita',      price: 120, image: '/products/pizzas_01.jpg',       categoryId: 3 },
  { id: 9,  name: 'Dona Glaseada',        price: 30,  image: '/products/donas_01.jpg',        categoryId: 4 },
  { id: 10, name: 'Pastel de Chocolate',  price: 75,  image: '/products/pastel_01.jpg',       categoryId: 5 },
  { id: 11, name: 'Galletas de Avena',    price: 25,  image: '/products/galletas_01.jpg',     categoryId: 6 },
  { id: 15, name: 'te rojo',              price: 5,   image: 'uploads/1780880721672-945877817.webp', categoryId: 2 },
];

const orders = [
  { id: 1, name: 'henry',                total: 195,  status: true,  createdAt: '2026-06-08T00:49:38.696Z', orderReadyAt: '2026-06-08T00:49:51.758Z' },
  { id: 2, name: 'llontaco',             total: 220,  status: false, createdAt: '2026-06-08T01:11:32.161Z', orderReadyAt: null },
  { id: 3, name: 'chefcito 06 de junio', total: 195,  status: true,  createdAt: '2026-06-09T22:11:09.184Z', orderReadyAt: '2026-06-09T22:12:54.455Z' },
  { id: 4, name: 'Hacker01',             total: 7700, status: true,  createdAt: '2026-06-10T01:21:10.454Z', orderReadyAt: '2026-06-10T01:21:28.420Z' },
  { id: 5, name: 'henry',                total: 90,   status: true,  createdAt: '2026-06-16T03:37:02.154Z', orderReadyAt: '2026-06-16T03:37:18.539Z' },
  { id: 6, name: 'chef',                 total: 320,  status: false, createdAt: '2026-06-16T03:55:40.430Z', orderReadyAt: null },
];

const orderProducts = [
  { id: 1,  orderId: 1, productId: 1,  quantity: 1 },
  { id: 2,  orderId: 1, productId: 2,  quantity: 1 },
  { id: 3,  orderId: 2, productId: 2,  quantity: 2 },
  { id: 4,  orderId: 3, productId: 5,  quantity: 2 },
  { id: 5,  orderId: 3, productId: 3,  quantity: 1 },
  { id: 6,  orderId: 4, productId: 2,  quantity: 70 },
  { id: 7,  orderId: 5, productId: 5,  quantity: 1 },
  { id: 8,  orderId: 5, productId: 6,  quantity: 1 },
  { id: 9,  orderId: 5, productId: 15, quantity: 1 },
  { id: 10, orderId: 6, productId: 1,  quantity: 1 },
  { id: 11, orderId: 6, productId: 2,  quantity: 1 },
  { id: 12, orderId: 6, productId: 3,  quantity: 1 },
];

async function main() {
  console.log('🌱 Sembrando base de datos con datos reales...');

  for (const c of categories) {
    await prisma.category.upsert({ where: { id: c.id }, update: c, create: c });
  }
  console.log(`  ✓ ${categories.length} categorías`);

  for (const p of products) {
    await prisma.product.upsert({ where: { id: p.id }, update: p, create: p });
  }
  console.log(`  ✓ ${products.length} productos`);

  for (const o of orders) {
    const data = {
      ...o,
      createdAt: new Date(o.createdAt),
      orderReadyAt: o.orderReadyAt ? new Date(o.orderReadyAt) : null,
    };
    await prisma.order.upsert({ where: { id: o.id }, update: data, create: data });
  }
  console.log(`  ✓ ${orders.length} órdenes`);

  for (const op of orderProducts) {
    await prisma.orderProduct.upsert({ where: { id: op.id }, update: op, create: op });
  }
  console.log(`  ✓ ${orderProducts.length} items de órdenes`);

  // Reajustar las secuencias de PostgreSQL tras insertar IDs explícitos
  await prisma.$executeRawUnsafe(`SELECT setval(pg_get_serial_sequence('categories', 'id'), (SELECT MAX(id) FROM categories))`);
  await prisma.$executeRawUnsafe(`SELECT setval(pg_get_serial_sequence('products', 'id'), (SELECT MAX(id) FROM products))`);
  await prisma.$executeRawUnsafe(`SELECT setval(pg_get_serial_sequence('orders', 'id'), (SELECT MAX(id) FROM orders))`);
  await prisma.$executeRawUnsafe(`SELECT setval(pg_get_serial_sequence('order_products', 'id'), (SELECT MAX(id) FROM order_products))`);
  console.log('  ✓ secuencias de IDs reajustadas');

  console.log('✅ Seed completado.');
}

main()
  .catch((e) => { console.error('❌ Error en seed:', e); process.exit(1); })
  .finally(async () => { await prisma.$disconnect(); });
