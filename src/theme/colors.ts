// ─── Utilidades de color ───────────────────────────────────────────────────────
// Todo el sistema visual se deriva de un puñado de colores base. Estas funciones
// generan los tonos secundarios (hover, contraste, superficies suaves) sin que el
// usuario tenga que elegirlos a mano.

type RGB = { r: number; g: number; b: number };

const clamp = (n: number) => Math.max(0, Math.min(255, Math.round(n)));

/** Convierte "#abc", "#aabbcc" o "#aabbccdd" a {r,g,b}. Fallback a negro si es inválido. */
export function hexToRgb(hex: string): RGB {
  let h = (hex || '').trim().replace('#', '');
  if (h.length === 3) h = h.split('').map((c) => c + c).join('');
  if (h.length === 8) h = h.slice(0, 6);
  const int = parseInt(h, 16);
  if (h.length !== 6 || Number.isNaN(int)) return { r: 0, g: 0, b: 0 };
  return { r: (int >> 16) & 255, g: (int >> 8) & 255, b: int & 255 };
}

export function rgbToHex({ r, g, b }: RGB): string {
  return '#' + [r, g, b].map((c) => clamp(c).toString(16).padStart(2, '0')).join('');
}

/** Mezcla dos colores. amount=0 → a, amount=1 → b. */
export function mix(a: string, b: string, amount: number): string {
  const c1 = hexToRgb(a);
  const c2 = hexToRgb(b);
  return rgbToHex({
    r: c1.r + (c2.r - c1.r) * amount,
    g: c1.g + (c2.g - c1.g) * amount,
    b: c1.b + (c2.b - c1.b) * amount,
  });
}

export const lighten = (hex: string, amount: number) => mix(hex, '#ffffff', amount);
export const darken = (hex: string, amount: number) => mix(hex, '#000000', amount);

/** Luminancia relativa (WCAG). 0 = negro, 1 = blanco. */
export function luminance(hex: string): number {
  const { r, g, b } = hexToRgb(hex);
  const chan = (v: number) => {
    const s = v / 255;
    return s <= 0.03928 ? s / 12.92 : ((s + 0.055) / 1.055) ** 2.4;
  };
  return 0.2126 * chan(r) + 0.7152 * chan(g) + 0.0722 * chan(b);
}

/** Devuelve el color de texto legible (blanco o casi-negro) sobre un fondo dado. */
export function readableTextOn(bg: string): string {
  return luminance(bg) > 0.5 ? '#111827' : '#ffffff';
}

export const isDarkColor = (hex: string) => luminance(hex) < 0.4;

/** Versión rgba() con alfa, útil para superficies "soft" translúcidas. */
export function withAlpha(hex: string, alpha: number): string {
  const { r, g, b } = hexToRgb(hex);
  return `rgba(${r}, ${g}, ${b}, ${alpha})`;
}

/**
 * Oscurece para el estado hover en modo claro, o aclara en modo oscuro
 * (en oscuro, "más oscuro" desaparecería contra el fondo).
 */
export function hoverShade(hex: string, dark: boolean): string {
  return dark ? lighten(hex, 0.12) : darken(hex, 0.12);
}
