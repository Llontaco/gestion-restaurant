import type { RestaurantSettings, ThemeMode } from './types';
import { fontStackFor, FONT_OPTIONS } from './defaultSettings';
import { hoverShade, readableTextOn, mix, withAlpha } from './colors';

// ─── Motor de tema ──────────────────────────────────────────────────────────────
// Traduce `RestaurantSettings` a variables CSS globales sobre <html>. Como las
// utilidades de Tailwind v4 (bg-primary, text-brand, bg-surface, …) se compilan a
// `var(--color-*)`, sobreescribir estas variables re-tematiza TODA la app en vivo,
// sin recargar y sin colores hardcodeados.

const FONT_SIZE_SCALE: Record<string, string> = { sm: '0.92', md: '1', lg: '1.08' };

/** Resuelve el modo efectivo: 'auto' consulta la preferencia del sistema. */
export function resolveMode(mode: ThemeMode): 'light' | 'dark' {
  if (mode === 'auto') {
    return typeof window !== 'undefined' &&
      window.matchMedia?.('(prefers-color-scheme: dark)').matches
      ? 'dark'
      : 'light';
  }
  return mode;
}

/** Paleta de superficies neutra para modo oscuro (independiente de la marca). */
const DARK_SURFACES = {
  bg: '#0f1216',
  card: '#191d24',
  cardMuted: '#20252e',
  text: '#e6e8eb',
  textMuted: '#96a0ad',
  border: '#2b313b',
};

type Vars = Record<string, string>;

/** Construye el mapa completo de variables CSS a partir de la configuración. */
export function buildCssVars(s: RestaurantSettings, effective: 'light' | 'dark'): Vars {
  const dark = effective === 'dark';

  // Colores de marca (se conservan igual en claro/oscuro: son acentos).
  const primary = s.primaryColor;
  const secondary = s.secondaryColor;
  const accent = s.accentColor;

  // Superficies según el modo.
  const surfaces = dark
    ? DARK_SURFACES
    : {
        bg: s.backgroundColor,
        card: '#ffffff',
        cardMuted: mix(s.backgroundColor, s.textColor, 0.04),
        text: s.textColor,
        textMuted: mix(s.textColor, s.backgroundColor, 0.42),
        border: mix(s.textColor, s.backgroundColor, 0.86),
      };

  return {
    // Semánticos
    '--color-primary': primary,
    '--color-primary-hover': hoverShade(primary, dark),
    '--color-primary-contrast': readableTextOn(primary),
    '--color-primary-soft': dark ? withAlpha(primary, 0.16) : mix(primary, '#ffffff', 0.84),

    '--color-secondary': secondary,
    '--color-secondary-contrast': readableTextOn(secondary),

    '--color-accent': accent,
    '--color-accent-contrast': readableTextOn(accent),

    '--color-success': s.successColor,
    '--color-warning': s.warningColor,
    '--color-danger': s.dangerColor,
    '--color-danger-hover': hoverShade(s.dangerColor, dark),
    '--color-danger-soft': dark ? withAlpha(s.dangerColor, 0.16) : mix(s.dangerColor, '#ffffff', 0.86),

    // Superficies
    '--color-bg': surfaces.bg,
    '--color-surface': surfaces.bg, // alias del token existente
    '--color-card': surfaces.card,
    '--color-card-muted': surfaces.cardMuted,
    '--color-text': surfaces.text,
    '--color-text-muted': surfaces.textMuted,
    '--color-border': surfaces.border,

    // Compatibilidad con las utilidades `brand` ya usadas en la app.
    '--color-brand': primary,
    '--color-brand-dark': hoverShade(primary, dark),
    '--color-brand-light': dark ? withAlpha(primary, 0.16) : mix(primary, '#ffffff', 0.84),

    // Tipografía
    '--font-sans': fontStackFor(s.fontFamily),
    '--app-font-scale': FONT_SIZE_SCALE[s.fontSize] ?? '1',
  };
}

let injectedFont = '';

/** Carga bajo demanda la tipografía elegida desde Google Fonts (una sola vez). */
function ensureFontLoaded(family: string) {
  if (typeof document === 'undefined') return;
  const opt = FONT_OPTIONS.find((f) => f.value === family);
  if (!opt?.google || injectedFont === family) return;

  let link = document.getElementById('app-font-link') as HTMLLinkElement | null;
  if (!link) {
    link = document.createElement('link');
    link.id = 'app-font-link';
    link.rel = 'stylesheet';
    document.head.appendChild(link);
  }
  link.href = `https://fonts.googleapis.com/css2?family=${opt.google}&display=swap`;
  injectedFont = family;
}

function updateFavicon(url: string | null) {
  if (typeof document === 'undefined' || !url) return;
  let link = document.querySelector<HTMLLinkElement>('link[rel~="icon"]');
  if (!link) {
    link = document.createElement('link');
    link.rel = 'icon';
    document.head.appendChild(link);
  }
  link.href = url;
}

/**
 * Aplica la configuración completa al documento: variables CSS, clase dark,
 * favicon, título y tipografía. Idempotente: llamar en cada cambio.
 */
export function applyTheme(s: RestaurantSettings): 'light' | 'dark' {
  const effective = resolveMode(s.themeMode);
  if (typeof document === 'undefined') return effective;

  const root = document.documentElement;
  const vars = buildCssVars(s, effective);
  for (const [k, v] of Object.entries(vars)) root.style.setProperty(k, v);

  root.setAttribute('data-theme', effective);
  root.classList.toggle('dark', effective === 'dark');
  root.style.colorScheme = effective;

  ensureFontLoaded(s.fontFamily);
  updateFavicon(s.faviconUrl);
  document.title = s.slogan
    ? `${s.restaurantName} · ${s.appName}`
    : `${s.restaurantName} · ${s.appName}`;

  return effective;
}

/** Logo correcto según el modo efectivo (usa el oscuro si existe en dark). */
export function activeLogo(s: RestaurantSettings, effective: 'light' | 'dark'): string | null {
  if (effective === 'dark') return s.darkLogoUrl || s.logoUrl;
  return s.logoUrl;
}
