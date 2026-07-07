// Punto de entrada serverless para Vercel.
// El `app` de Express es un handler (req, res), así que Vercel lo usa directamente.
import app from '../src/server';

export default app;
