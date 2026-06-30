export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('es-MX', { style: 'currency', currency: 'MXN' }).format(amount);
}

// Maps a category name to its SVG icon slug
const slugMap: Record<string, string> = {
  'hamburguesa': 'hamburguesa',
  'café': 'cafe',
  'cafe': 'cafe',
  'pizza': 'pizza',
  'dona': 'dona',
  'pastel': 'pastel',
  'galletas': 'galletas',
};

export function getCategoryIcon(name: string): string {
  const slug = slugMap[name.toLowerCase()] ?? name.toLowerCase();
  return `/icon_${slug}.svg`;
}

// Backend origin derived from VITE_API_URL (strips the trailing /api)
const API_ORIGIN = ((import.meta as any).env?.VITE_API_URL ?? 'http://localhost:3001/api')
  .replace(/\/api\/?$/, '');

export function getImagePath(image: string | null): string {
  if (!image) return '';
  if (image.startsWith('http')) return image;
  // paths like /products/... are served by Vite's public folder
  if (image.startsWith('/')) return image;
  // uploads/ files are served by the backend
  return `${API_ORIGIN}/${image}`;
}
