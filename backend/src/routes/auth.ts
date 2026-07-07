import { Router, Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import { Prisma } from '@prisma/client';
import prisma from '../prismaClient';

const router = Router();

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

// Devuelve el usuario sin el campo password
function publicUser(user: { id: number; name: string; email: string; role: string }) {
  return { id: user.id, name: user.name, email: user.email, role: user.role };
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
    // Todo registro público crea un CLIENTE. El admin se siembra aparte.
    const user = await prisma.user.create({
      data: { name, email, password: hashed, role: 'CLIENT' },
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
    if (!user || !user.password) {
      // Sin password local (cuenta creada por Google) → debe entrar con Google.
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

// POST /api/auth/google — iniciar sesión con Google (One Tap / botón)
// Recibe el `credential` (ID token JWT) que emite Google Identity Services.
router.post('/google', async (req: Request, res: Response) => {
  try {
    const credential = String(req.body.credential ?? '');
    if (!credential) {
      return res.status(400).json({ error: 'Falta el token de Google' });
    }

    // Verificamos el token con Google (sin dependencias extra) y validamos la audiencia.
    const resp = await fetch(
      `https://oauth2.googleapis.com/tokeninfo?id_token=${encodeURIComponent(credential)}`
    );
    if (!resp.ok) {
      return res.status(401).json({ error: 'Token de Google inválido' });
    }

    const payload = (await resp.json()) as {
      aud?: string;
      email?: string;
      email_verified?: string | boolean;
      name?: string;
    };

    const expectedAud = process.env.GOOGLE_CLIENT_ID;
    if (expectedAud && payload.aud !== expectedAud) {
      return res.status(401).json({ error: 'El token no pertenece a esta aplicación' });
    }

    const email = String(payload.email ?? '').trim().toLowerCase();
    const verified = payload.email_verified === true || payload.email_verified === 'true';
    if (!email || !verified) {
      return res.status(401).json({ error: 'No se pudo verificar tu correo de Google' });
    }

    // Buscamos al usuario; si no existe, lo creamos como CLIENTE (sin password local).
    const name = String(payload.name ?? email.split('@')[0]);
    const user = await prisma.user.upsert({
      where: { email },
      update: {},
      create: { name, email, role: 'CLIENT' },
    });

    res.json(publicUser(user));
  } catch {
    res.status(500).json({ error: 'Error al iniciar sesión con Google' });
  }
});

export default router;
