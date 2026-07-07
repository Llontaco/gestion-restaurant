import { Router, Request, Response } from 'express';
import prisma from '../prismaClient';

const router = Router();

// Modelo y endpoint de Gemini (API REST). La API key NUNCA se expone al frontend:
// vive solo aquí, en una variable de entorno del backend.
const GEMINI_MODEL = process.env.GEMINI_MODEL || 'gemini-2.0-flash';
const GEMINI_URL = `https://generativelanguage.googleapis.com/v1beta/models/${GEMINI_MODEL}:generateContent`;

// Instrucciones que LIMITAN al bot: solo puede hablar del restaurante / la app / el menú.
function buildSystemPrompt(menu: string): string {
  return `Eres "Asistente del Quiosco", un chatbot amable que ayuda a los clientes de un
restaurante/quiosco de comida rápida a usar la aplicación y a elegir qué pedir.

REGLAS ESTRICTAS:
- Responde ÚNICAMENTE preguntas relacionadas con: el menú, los productos, los precios,
  recomendaciones de qué pedir, y cómo usar la app (armar un pedido, ver pedidos listos, etc.).
- Si te preguntan algo que NO tiene que ver con el restaurante o la app (política, código,
  matemáticas, temas personales, etc.), responde amablemente:
  "Lo siento, solo puedo ayudarte con el menú y con cómo usar la aplicación del quiosco. 😊"
- No inventes productos ni precios: usa SOLO la información del menú de abajo.
- Si un producto no está en el menú, dilo con claridad.
- Responde en español, de forma breve, cálida y clara. Usa los precios tal cual aparecen.

CÓMO FUNCIONA LA APP (por si preguntan):
- El cliente elige productos por categoría y los agrega a "Mi Pedido".
- Escribe su nombre y presiona "Confirmar Pedido".
- Luego puede ver en la pantalla "Pedidos Listos" cuándo su orden está lista para recoger.

MENÚ ACTUAL (fuente de la verdad para precios y recomendaciones):
${menu}`;
}

// Convierte el menú de la BD en texto legible para el modelo.
function formatMenu(
  categories: { name: string; products: { name: string; price: unknown }[] }[]
): string {
  if (categories.length === 0) return '(No hay productos cargados en este momento.)';
  return categories
    .map((cat) => {
      const items = cat.products
        .map((p) => `  - ${p.name}: $${Number(p.price).toFixed(2)}`)
        .join('\n');
      return `Categoría "${cat.name}":\n${items || '  (sin productos)'}`;
    })
    .join('\n\n');
}

type ChatMessage = { role: 'user' | 'model'; text: string };

// POST /api/chat — pregunta del cliente al asistente
router.post('/', async (req: Request, res: Response) => {
  try {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      return res.status(500).json({ error: 'El asistente no está configurado (falta GEMINI_API_KEY).' });
    }

    const { message, history } = req.body as { message?: string; history?: ChatMessage[] };

    if (!message || typeof message !== 'string' || !message.trim()) {
      return res.status(400).json({ error: 'El mensaje es requerido.' });
    }
    if (message.length > 500) {
      return res.status(400).json({ error: 'El mensaje es demasiado largo.' });
    }

    // Cargamos el menú real desde la base de datos como contexto.
    const categories = await prisma.category.findMany({
      orderBy: { id: 'asc' },
      include: { products: { orderBy: { name: 'asc' }, select: { name: true, price: true } } },
    });

    const systemPrompt = buildSystemPrompt(formatMenu(categories));

    // Historial de conversación (limitado a los últimos 10 turnos para no gastar tokens de más).
    const priorTurns = Array.isArray(history) ? history.slice(-10) : [];
    const contents = [
      ...priorTurns
        .filter((m) => m && (m.role === 'user' || m.role === 'model') && typeof m.text === 'string')
        .map((m) => ({ role: m.role, parts: [{ text: m.text }] })),
      { role: 'user', parts: [{ text: message.trim() }] },
    ];

    const geminiRes = await fetch(GEMINI_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-goog-api-key': apiKey,
      },
      body: JSON.stringify({
        systemInstruction: { parts: [{ text: systemPrompt }] },
        contents,
        generationConfig: { temperature: 0.4, maxOutputTokens: 500 },
      }),
    });

    if (!geminiRes.ok) {
      const detail = await geminiRes.text().catch(() => '');
      console.error('Error de Gemini:', geminiRes.status, detail);
      return res.status(502).json({ error: 'El asistente no está disponible en este momento.' });
    }

    const data = (await geminiRes.json()) as {
      candidates?: { content?: { parts?: { text?: string }[] } }[];
    };

    const reply =
      data.candidates?.[0]?.content?.parts?.map((p) => p.text).join('').trim() ||
      'Lo siento, no pude generar una respuesta. Intenta de nuevo.';

    res.json({ reply });
  } catch (err) {
    console.error('Error en /api/chat:', err);
    res.status(500).json({ error: 'Error al procesar tu pregunta.' });
  }
});

export default router;
