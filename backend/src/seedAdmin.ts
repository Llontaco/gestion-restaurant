import bcrypt from 'bcryptjs';
import prisma from './prismaClient';

// Siembra ÚNICAMENTE la cuenta admin (no toca productos/categorías/órdenes).
const ADMIN_EMAIL = 'admin@freshcoffee.com';
const ADMIN_PASSWORD = 'FreshCoffee2026!';

async function main() {
  const hash = await bcrypt.hash(ADMIN_PASSWORD, 10);
  const admin = await prisma.user.upsert({
    where: { email: ADMIN_EMAIL },
    update: { role: 'ADMIN', password: hash },
    create: { name: 'Administrador', email: ADMIN_EMAIL, password: hash, role: 'ADMIN' },
  });
  console.log(`✅ Admin listo: ${admin.email} (rol: ${admin.role})`);
}

main()
  .catch((e) => { console.error('❌ Error:', e); process.exit(1); })
  .finally(async () => { await prisma.$disconnect(); });
