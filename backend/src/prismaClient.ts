import { PrismaClient } from '@prisma/client';

// En serverless cada invocación puede reusar el módulo en caliente; guardamos una
// única instancia en global para no abrir conexiones nuevas en cada request.
const globalForPrisma = globalThis as unknown as { prisma?: PrismaClient };

const prisma = globalForPrisma.prisma ?? new PrismaClient();

if (process.env.NODE_ENV !== 'production') {
  globalForPrisma.prisma = prisma;
}

export default prisma;
