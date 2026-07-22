import type { RestaurantSettings } from './types';

// ─── Valores por defecto ───────────────────────────────────────────────────────
// Fuente única de verdad para el frontend: se usa como fallback mientras carga la
// API, para "Restaurar valores por defecto" en el cliente y para la vista previa.
// Debe coincidir con los @default del schema Prisma (Fresh Coffee).
export const DEFAULT_SETTINGS: RestaurantSettings = {
  id: 0,
  tenantKey: 'default',

  restaurantName: 'Fresh Coffee',
  appName: 'Quiosco',
  slogan: 'Café de especialidad, recién hecho',
  logoUrl: null,
  darkLogoUrl: null,
  faviconUrl: null,
  loginBackgroundUrl: null,

  primaryColor: '#d4a017',
  secondaryColor: '#1f2937',
  accentColor: '#0ea5e9',
  successColor: '#16a34a',
  warningColor: '#f59e0b',
  dangerColor: '#dc2626',
  backgroundColor: '#f7f5f1',
  textColor: '#1f2937',

  fontFamily: 'Inter',
  fontSize: 'md',
  themeMode: 'light',

  ruc: null,
  address: null,
  phone: null,
  email: null,
  website: null,
  currency: 'PEN',
  timezone: 'America/Lima',
  socialLinks: null,

  createdAt: new Date(0).toISOString(),
  updatedAt: new Date(0).toISOString(),
};

// ─── Catálogo de tipografías seleccionables ────────────────────────────────────
// `google` = familia a cargar desde Google Fonts (undefined = fuente del sistema).
export type FontOption = { label: string; value: string; stack: string; google?: string };

export const FONT_OPTIONS: FontOption[] = [
  { label: 'Inter',            value: 'Inter',            stack: '"Inter", ui-sans-serif, system-ui, sans-serif',        google: 'Inter:wght@400;500;600;700;800;900' },
  { label: 'Roboto',           value: 'Roboto',           stack: '"Roboto", ui-sans-serif, system-ui, sans-serif',       google: 'Roboto:wght@400;500;700;900' },
  { label: 'Poppins',          value: 'Poppins',          stack: '"Poppins", ui-sans-serif, system-ui, sans-serif',      google: 'Poppins:wght@400;500;600;700;800' },
  { label: 'Montserrat',       value: 'Montserrat',       stack: '"Montserrat", ui-sans-serif, system-ui, sans-serif',   google: 'Montserrat:wght@400;500;600;700;800' },
  { label: 'Nunito',           value: 'Nunito',           stack: '"Nunito", ui-sans-serif, system-ui, sans-serif',       google: 'Nunito:wght@400;500;600;700;800' },
  { label: 'Lato',             value: 'Lato',             stack: '"Lato", ui-sans-serif, system-ui, sans-serif',         google: 'Lato:wght@400;700;900' },
  { label: 'Open Sans',        value: 'Open Sans',        stack: '"Open Sans", ui-sans-serif, system-ui, sans-serif',    google: 'Open+Sans:wght@400;500;600;700;800' },
  { label: 'Work Sans',        value: 'Work Sans',        stack: '"Work Sans", ui-sans-serif, system-ui, sans-serif',    google: 'Work+Sans:wght@400;500;600;700;800' },
  { label: 'Playfair Display', value: 'Playfair Display', stack: '"Playfair Display", ui-serif, Georgia, serif',         google: 'Playfair+Display:wght@500;600;700;800;900' },
  { label: 'Sistema',          value: 'system',           stack: 'ui-sans-serif, system-ui, -apple-system, sans-serif' },
];

export function fontStackFor(family: string): string {
  return FONT_OPTIONS.find((f) => f.value === family)?.stack ?? FONT_OPTIONS[0].stack;
}

// ─── Presets de paletas (atajos para usuarios no técnicos) ─────────────────────
export type ColorPreset = {
  name: string;
  primaryColor: string;
  secondaryColor: string;
  accentColor: string;
};

export const COLOR_PRESETS: ColorPreset[] = [
  { name: 'Café dorado',   primaryColor: '#d4a017', secondaryColor: '#1f2937', accentColor: '#0ea5e9' },
  { name: 'Esmeralda',     primaryColor: '#059669', secondaryColor: '#064e3b', accentColor: '#f59e0b' },
  { name: 'Índigo',        primaryColor: '#4f46e5', secondaryColor: '#1e1b4b', accentColor: '#ec4899' },
  { name: 'Coral',         primaryColor: '#f43f5e', secondaryColor: '#881337', accentColor: '#fb923c' },
  { name: 'Océano',        primaryColor: '#0284c7', secondaryColor: '#0c4a6e', accentColor: '#14b8a6' },
  { name: 'Grafito',       primaryColor: '#334155', secondaryColor: '#0f172a', accentColor: '#f59e0b' },
];

export const CURRENCY_OPTIONS = [
  { code: 'PEN', label: 'Sol peruano (S/)' },
  { code: 'USD', label: 'Dólar (US$)' },
  { code: 'EUR', label: 'Euro (€)' },
  { code: 'MXN', label: 'Peso mexicano ($)' },
  { code: 'COP', label: 'Peso colombiano ($)' },
  { code: 'CLP', label: 'Peso chileno ($)' },
  { code: 'ARS', label: 'Peso argentino ($)' },
];
