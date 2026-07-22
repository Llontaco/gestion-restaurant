// Sincroniza el esquema de Prisma con la BD durante el build de Vercel.
// Localmente no corre: el .env local no tiene POSTGRES_URL_NON_POOLING
// (las variables sensibles solo existen en Vercel).
if (!process.env.VERCEL || !process.env.POSTGRES_URL_NON_POOLING) {
  console.log('vercel-db-push: fuera de Vercel o sin URL directa de BD, se omite.');
  process.exit(0);
}
const { execSync } = require('child_process');
// Sin --accept-data-loss: si un cambio de esquema borra datos, el build debe
// fallar para revisarlo a mano (agrégalo temporalmente solo para ese deploy).
execSync('npx prisma db push --skip-generate', { stdio: 'inherit' });
