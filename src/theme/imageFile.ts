// ─── Conversión de imágenes a data URL (base64) ────────────────────────────────
// El logo/favicon/portada se guardan como data URL dentro de RestaurantSettings.
// Así funcionan igual en local y en Vercel serverless (sin sistema de archivos ni
// endpoint de subida). Para que la fila no crezca demasiado, las imágenes raster
// se redimensionan y comprimen en el navegador antes de convertirlas.

export type ImageKind = 'logo' | 'favicon' | 'cover';

const PRESETS: Record<ImageKind, { maxDim: number; maxBytes: number }> = {
  logo: { maxDim: 512, maxBytes: 180_000 },
  favicon: { maxDim: 128, maxBytes: 40_000 },
  cover: { maxDim: 1600, maxBytes: 500_000 },
};

function readAsDataUrl(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const r = new FileReader();
    r.onload = () => resolve(String(r.result));
    r.onerror = () => reject(new Error('No se pudo leer el archivo'));
    r.readAsDataURL(file);
  });
}

function loadImage(src: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = () => reject(new Error('Imagen inválida o dañada'));
    img.src = src;
  });
}

/**
 * Convierte un archivo de imagen en un data URL listo para guardar.
 * - SVG e ICO: se guardan tal cual (ya son pequeños / vectoriales).
 * - PNG: se redimensiona conservando transparencia.
 * - Otros (JPG/WEBP): se redimensiona y comprime a JPEG.
 * Lanza un error legible si el resultado sigue siendo demasiado grande.
 */
export async function fileToDataUrl(file: File, kind: ImageKind): Promise<string> {
  const { maxDim, maxBytes } = PRESETS[kind];

  // Vectorial / ícono: sin recompresión.
  if (file.type === 'image/svg+xml' || file.type === 'image/x-icon' || /\.(svg|ico)$/i.test(file.name)) {
    const dataUrl = await readAsDataUrl(file);
    if (dataUrl.length > maxBytes * 1.4) {
      throw new Error('El archivo es muy pesado. Usa una imagen más liviana.');
    }
    return dataUrl;
  }

  const original = await readAsDataUrl(file);
  const img = await loadImage(original);

  const scale = Math.min(1, maxDim / Math.max(img.width, img.height));
  const w = Math.max(1, Math.round(img.width * scale));
  const h = Math.max(1, Math.round(img.height * scale));

  const canvas = document.createElement('canvas');
  canvas.width = w;
  canvas.height = h;
  const ctx = canvas.getContext('2d');
  if (!ctx) return original; // fallback improbable
  ctx.drawImage(img, 0, 0, w, h);

  const isPng = file.type === 'image/png';
  // PNG conserva transparencia (logos); el resto va a JPEG comprimido.
  let out = isPng ? canvas.toDataURL('image/png') : canvas.toDataURL('image/jpeg', 0.85);

  // Si el PNG pesa demasiado, baja a JPEG (pierde transparencia pero cabe).
  if (out.length > maxBytes && isPng) {
    out = canvas.toDataURL('image/jpeg', 0.82);
  }
  // Último recurso: reduce calidad progresivamente.
  let q = 0.75;
  while (out.length > maxBytes && q >= 0.4) {
    out = canvas.toDataURL('image/jpeg', q);
    q -= 0.15;
  }
  if (out.length > maxBytes) {
    throw new Error('La imagen es demasiado grande incluso comprimida. Prueba con una más pequeña.');
  }
  return out;
}
