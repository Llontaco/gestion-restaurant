import { createContext, useContext, useCallback, useEffect, useRef, useState } from 'react';
import type { ReactNode } from 'react';
import type { RestaurantSettings, SettingsPatch } from './types';
import { DEFAULT_SETTINGS } from './defaultSettings';
import { applyTheme, resolveMode, activeLogo } from './applyTheme';
import { fetchSettings, saveSettings, resetSettingsRemote } from '../services/settingsApi';

export type SaveStatus = 'idle' | 'saving' | 'saved' | 'error';

type ThemeContextType = {
  settings: RestaurantSettings;
  /** Modo efectivo ya resuelto (auto → light/dark según el sistema). */
  mode: 'light' | 'dark';
  loading: boolean;
  saveStatus: SaveStatus;
  /** URL del logo correcto para el modo actual. */
  logoUrl: string | null;
  /** Aplica un parche: vista previa instantánea + guardado automático (debounce). */
  update: (patch: SettingsPatch, opts?: { autosave?: boolean }) => void;
  /** Fuerza el guardado inmediato de lo pendiente. */
  flush: () => Promise<void>;
  /** Restaura los valores de fábrica (servidor + UI). */
  reset: () => Promise<void>;
  /** Recarga la configuración desde el backend. */
  reload: () => Promise<void>;
};

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

const AUTOSAVE_MS = 700;

export function ThemeProvider({ children }: { children: ReactNode }) {
  const [settings, setSettings] = useState<RestaurantSettings>(DEFAULT_SETTINGS);
  const [mode, setMode] = useState<'light' | 'dark'>(() => resolveMode(DEFAULT_SETTINGS.themeMode));
  const [loading, setLoading] = useState(true);
  const [saveStatus, setSaveStatus] = useState<SaveStatus>('idle');

  // Espejo síncrono de `settings`: permite mezclar parches sin efectos dentro de
  // un updater de setState (que React ejecuta dos veces en StrictMode).
  const settingsRef = useRef<RestaurantSettings>(DEFAULT_SETTINGS);
  const pendingPatch = useRef<SettingsPatch>({});
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Fija los settings como fuente de verdad, los aplica al documento y publica el modo.
  const commit = useCallback((s: RestaurantSettings) => {
    settingsRef.current = s;
    setSettings(s);
    setMode(applyTheme(s));
  }, []);

  // ─── Carga inicial ───
  const reload = useCallback(async () => {
    setLoading(true);
    const { settings: s } = await fetchSettings();
    commit(s);
    setLoading(false);
  }, [commit]);

  useEffect(() => {
    reload();
  }, [reload]);

  // ─── Reacción al modo del sistema cuando themeMode === 'auto' ───
  useEffect(() => {
    if (settings.themeMode !== 'auto' || typeof window === 'undefined') return;
    const mq = window.matchMedia('(prefers-color-scheme: dark)');
    const onChange = () => setMode(applyTheme(settingsRef.current));
    mq.addEventListener('change', onChange);
    return () => mq.removeEventListener('change', onChange);
  }, [settings.themeMode]);

  // ─── Guardado (debounce) ───
  const doSave = useCallback(async () => {
    const patch = pendingPatch.current;
    if (Object.keys(patch).length === 0) return;
    pendingPatch.current = {};
    setSaveStatus('saving');
    const { error } = await saveSettings(patch);
    setSaveStatus(error ? 'error' : 'saved');
    if (!error) {
      // Vuelve a 'idle' tras un momento (feedback "Guardado ✓").
      window.setTimeout(() => setSaveStatus((s) => (s === 'saved' ? 'idle' : s)), 1800);
    }
  }, []);

  const flush = useCallback(async () => {
    if (timer.current) { clearTimeout(timer.current); timer.current = null; }
    await doSave();
  }, [doSave]);

  const update = useCallback<ThemeContextType['update']>((patch, opts) => {
    commit({ ...settingsRef.current, ...patch });
    if (opts?.autosave === false) return;
    pendingPatch.current = { ...pendingPatch.current, ...patch };
    if (timer.current) clearTimeout(timer.current);
    timer.current = setTimeout(doSave, AUTOSAVE_MS);
  }, [commit, doSave]);

  const reset = useCallback(async () => {
    if (timer.current) { clearTimeout(timer.current); timer.current = null; }
    pendingPatch.current = {};
    setSaveStatus('saving');
    const { settings: s, error } = await resetSettingsRemote();
    if (s) {
      commit(s);
      setSaveStatus('saved');
      window.setTimeout(() => setSaveStatus((st) => (st === 'saved' ? 'idle' : st)), 1800);
    } else {
      setSaveStatus('error');
      console.error(error);
    }
  }, [commit]);

  // Guarda lo pendiente si el usuario cierra/recarga la pestaña.
  useEffect(() => {
    const onUnload = () => {
      if (Object.keys(pendingPatch.current).length > 0) {
        navigator.sendBeacon?.(
          `${(import.meta as any).env?.VITE_API_URL ?? 'http://localhost:3001/api'}/settings`,
          new Blob([JSON.stringify(pendingPatch.current)], { type: 'application/json' })
        );
      }
    };
    window.addEventListener('beforeunload', onUnload);
    return () => window.removeEventListener('beforeunload', onUnload);
  }, []);

  const value: ThemeContextType = {
    settings,
    mode,
    loading,
    saveStatus,
    logoUrl: activeLogo(settings, mode),
    update,
    flush,
    reset,
    reload,
  };

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}

// eslint-disable-next-line react-refresh/only-export-components
export function useTheme() {
  const ctx = useContext(ThemeContext);
  if (!ctx) throw new Error('useTheme debe usarse dentro de <ThemeProvider>');
  return ctx;
}
