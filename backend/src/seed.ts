import prisma from './prismaClient';

async function main() {
  console.log('🌱 Seeding database...');

  const categories = [
    { id: 1, name: 'Hamburguesa', icon: '🍔' },
    { id: 2, name: 'Café',        icon: '☕' },
    { id: 3, name: 'Pizza',       icon: '🍕' },
    { id: 4, name: 'Dona',        icon: '🍩' },
    { id: 5, name: 'Pastel',      icon: '🍰' },
    { id: 6, name: 'Galletas',    icon: '🍪' },
  ];

  for (const cat of categories) {
    await prisma.category.upsert({
      where: { id: cat.id },
      update: { name: cat.name, icon: cat.icon },
      create: cat,
    });
  }
  console.log(`✅ ${categories.length} categorías creadas`);

  const products = [
    { id: 1,  name: 'Hamburguesa Clásica',  price: 85,  categoryId: 1, image: '/products/hamburguesas_01.jpg' },
    { id: 2,  name: 'Hamburguesa BBQ',       price: 110, categoryId: 1, image: '/products/hamburguesas_02.jpg' },
    { id: 3,  name: 'Doble Queso',           price: 125, categoryId: 1, image: '/products/hamburguesas_03.jpg' },
    { id: 4,  name: 'Hamburguesa Jalapeño',  price: 100, categoryId: 1, image: '/products/hamburguesas_04.jpg' },
    { id: 5,  name: 'Café Americano',        price: 35,  categoryId: 2, image: '/products/cafe_01.jpg'         },
    { id: 6,  name: 'Café Latte',            price: 50,  categoryId: 2, image: '/products/cafe_02.jpg'         },
    { id: 7,  name: 'Capuccino',             price: 55,  categoryId: 2, image: '/products/cafe_03.jpg'         },
    { id: 8,  name: 'Pizza Margarita',       price: 120, categoryId: 3, image: '/products/pizzas_01.jpg'       },
    { id: 9,  name: 'Dona Glaseada',         price: 30,  categoryId: 4, image: '/products/donas_01.jpg'        },
    { id: 10, name: 'Pastel de Chocolate',   price: 75,  categoryId: 5, image: '/products/pastel_01.jpg'       },
    { id: 11, name: 'Galletas de Avena',     price: 25,  categoryId: 6, image: '/products/galletas_01.jpg'     },
  ];

  for (const prod of products) {
    await prisma.product.upsert({
      where: { id: prod.id },
      update: { name: prod.name, price: prod.price, categoryId: prod.categoryId, image: prod.image },
      create: prod,
    });
  }
  console.log(`✅ ${products.length} productos actualizados con imágenes reales`);

  console.log('\n🎉 Seed completado!');
}

main()
  .catch((e) => { console.error('❌ Error en seed:', e); process.exit(1); })
  .finally(async () => { await prisma.$disconnect(); });
