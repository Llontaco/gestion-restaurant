import { Router, Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import { Prisma } from '@prisma/client';
import prisma from '../prismaClient';

const router = Router();

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

// Devuelve el usuario sin el campo password
function publicUser(user: { id: number; name: string; email: string }) {
  return { id: user.id, name: user.name, email: user.email };
}

// POST /api/auth/register — registrar un nuevo usuario
router.post('/register', async (req: Request, res: Response) => {
  try {
    const name = String(req.body.name ?? '').trim();
    const email = String(req.body.email ?? '').trim().toLowerCase();
    const password = String(req.body.password ?? '');

    if (!name || !email || !password) {
      return res.status(400).json({ error: 'Nombre, correo y contraseña son requeridos' });
    }
    if (!EMAIL_RE.test(email)) {
      return res.status(400).json({ error: 'El correo no es válido' });
    }
    if (password.length < 6) {
      return res.status(400).json({ error: 'La contraseña debe tener al menos 6 caracteres' });
    }

    const hashed = await bcrypt.hash(password, 10);
    const user = await prisma.user.create({
      data: { name, email, password: hashed },
    });

    res.status(201).json(publicUser(user));
  } catch (e) {
    if (e instanceof Prisma.PrismaClientKnownRequestError && e.code === 'P2002') {
      return res.status(409).json({ error: 'Ya existe una cuenta con ese correo' });
    }
    res.status(500).json({ error: 'Error al registrar el usuario' });
  }
});

// POST /api/auth/login — iniciar sesión
router.post('/login', async (req: Request, res: Response) => {
  try {
    const email = String(req.body.email ?? '').trim().toLowerCase();
    const password = String(req.body.password ?? '');

    if (!email || !password) {
      return res.status(400).json({ error: 'Correo y contraseña son requeridos' });
    }

    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) {
      return res.status(401).json({ error: 'Correo o contraseña incorrectos' });
    }

    const valid = await bcrypt.compare(password, user.password);
    if (!valid) {
      return res.status(401).json({ error: 'Correo o contraseña incorrectos' });
    }

    res.json(publicUser(user));
  } catch {
    res.status(500).json({ error: 'Error al iniciar sesión' });
  }
});

export default router;
