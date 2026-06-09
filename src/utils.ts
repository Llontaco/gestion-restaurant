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

export function getImagePath(image: string | null): string {
  if (!image) return '';
  if (image.startsWith('http')) return image;
  // paths like /products/... are served by Vite's public folder
  if (image.startsWith('/')) return image;
  // uploads/ files are served by the backend
  return `http://localhost:3001/${image}`;
}
