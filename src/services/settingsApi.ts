import type { RestaurantSettings, SettingsPatch } from '../theme/types';
import { DEFAULT_SETTINGS } from '../theme/defaultSettings';

// Mismo BASE_URL que services/api.ts (evita acoplar módulos).
const BASE_URL = (import.meta as any).env?.VITE_API_URL ?? 'http://localhost:3001/api';

async function request<T>(path: string, options?: RequestInit): Promise<T> {
  const res = await fetch(`${BASE_URL}${path}`, options);
  if (!res.ok) {
    const err = await res.json().catch(() => ({ error: res.statusText }));
    throw new Error(err.error ?? 'Error en la petición');
  }
  return res.json() as Promise<T>;
}

// Normaliza la respuesta del backend contra los defaults: garantiza que ningún
// campo llegue `undefined` al ThemeProvider aunque la API sea antigua/parcial.
function normalize(raw: Partial<RestaurantSettings>): RestaurantSettings {
  return { ...DEFAULT_SETTINGS, ...raw } as RestaurantSettings;
}

/** GET público: obtiene la configuración actual (el login la usa sin auth). */
export async function fetchSettings(): Promise<{ settings: RestaurantSettings; error: string | null }> {
  try {
    const raw = await request<Partial<RestaurantSettings>>('/settings');
    return { settings: normalize(raw), error: null };
  } catch (e) {
    return { settings: DEFAULT_SETTINGS, error: (e as Error).message };
  }
}

/** PUT: aplica un parche parcial y devuelve la configuración persistida. */
export async function saveSettings(
  patch: SettingsPatch
): Promise<{ settings: RestaurantSettings | null; error: string | null }> {
  try {
    const raw = await request<Partial<RestaurantSettings>>('/settings', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(patch),
    });
    return { settings: normalize(raw), error: null };
  } catch (e) {
    return { settings: null, error: (e as Error).message };
  }
}

/** POST /reset: restaura los valores de fábrica en el servidor. */
export async function resetSettingsRemote(): Promise<{ settings: RestaurantSettings | null; error: string | null }> {
  try {
    const raw = await request<Partial<RestaurantSettings>>('/settings/reset', { method: 'POST' });
    return { settings: normalize(raw), error: null };
  } catch (e) {
    return { settings: null, error: (e as Error).message };
  }
}

/** Sube una imagen de marca (logo, favicon, portada) y devuelve su URL pública. */
export async function uploadBrandingAsset(
  file: File
): Promise<{ url: string | null; error: string | null }> {
  try {
    const form = new FormData();
    form.append('file', file);
    const data = await request<{ url: string }>('/settings/upload', { method: 'POST', body: form });
    return { url: data.url, error: null };
  } catch (e) {
    return { url: null, error: (e as Error).message };
  }
}
