import { useState } from 'react';
import AdminLayout from '../components/AdminLayout';
import LivePreview from '../components/settings/LivePreview';
import ImageUploadField from '../components/settings/ImageUploadField';
import { TextField, TextArea, SelectField, ColorField } from '../components/settings/fields';
import { useTheme } from '../theme/ThemeProvider';
import type { SettingsPatch, SocialLinks } from '../theme/types';
import {
  COLOR_PRESETS, FONT_OPTIONS, CURRENCY_OPTIONS,
} from '../theme/defaultSettings';
import {
  SunIcon, MoonIcon, MonitorIcon, CheckIcon, PaletteIcon,
} from '../components/icons';

type SubTab = 'marca' | 'colores' | 'apariencia' | 'empresa';

const SUB_TABS: { id: SubTab; label: string }[] = [
  { id: 'marca', label: 'Marca' },
  { id: 'colores', label: 'Colores' },
  { id: 'apariencia', label: 'Apariencia' },
  { id: 'empresa', label: 'Empresa' },
];

function SaveIndicator() {
  const { saveStatus } = useTheme();
  const map = {
    idle: { text: 'Guardado automático activo', cls: 'text-text-muted' },
    saving: { text: 'Guardando…', cls: 'text-text-muted' },
    saved: { text: 'Guardado ✓', cls: 'text-success' },
    error: { text: 'Error al guardar', cls: 'text-danger' },
  } as const;
  const s = map[saveStatus];
  return <span className={`text-sm font-medium ${s.cls}`}>{s.text}</span>;
}

// Control segmentado (modo de tema, tamaño de fuente).
function Segmented<T extends string>({
  value, onChange, options,
}: {
  value: T;
  onChange: (v: T) => void;
  options: { value: T; label: string; icon?: React.ReactNode }[];
}) {
  return (
    <div className="inline-flex ui-panel p-1 gap-1">
      {options.map((o) => (
        <button
          key={o.value}
          type="button"
          onClick={() => onChange(o.value)}
          className={`ui-btn text-sm !py-1.5 !px-3 ${
            value === o.value ? 'ui-btn-primary' : 'ui-btn-ghost !border-transparent'
          }`}
        >
          {o.icon}
          {o.label}
        </button>
      ))}
    </div>
  );
}

export default function AdminSettings() {
  const { settings, update, reset, mode } = useTheme();
  const [tab, setTab] = useState<SubTab>('marca');

  // Atajo: setter por clave.
  const set =
    <K extends keyof SettingsPatch>(key: K) =>
    (value: SettingsPatch[K]) =>
      update({ [key]: value } as SettingsPatch);

  const setSocial = (key: keyof SocialLinks) => (v: string) =>
    update({ socialLinks: { ...(settings.socialLinks ?? {}), [key]: v } });

  async function handleReset() {
    if (window.confirm('¿Restaurar todos los valores por defecto? Se perderá tu personalización actual.')) {
      await reset();
      setTab('marca');
    }
  }

  return (
    <AdminLayout
      title="Personalización"
      action={
        <div className="flex items-center gap-4">
          <SaveIndicator />
          <button onClick={handleReset} className="ui-btn ui-btn-ghost text-sm">
            Restaurar valores por defecto
          </button>
        </div>
      }
    >
      <div className="grid lg:grid-cols-[1fr_minmax(320px,440px)] gap-6 items-start">
        {/* ─── Columna de edición ─── */}
        <div className="ui-card p-1.5">
          {/* Sub-pestañas */}
          <div className="flex gap-1 p-1.5 border-b border-border overflow-x-auto">
            {SUB_TABS.map((t) => (
              <button
                key={t.id}
                onClick={() => setTab(t.id)}
                className={`ui-btn text-sm !py-2 !px-4 whitespace-nowrap ${
                  tab === t.id ? 'ui-btn-primary' : 'ui-btn-ghost !border-transparent'
                }`}
              >
                {t.label}
              </button>
            ))}
          </div>

          <div className="p-5 space-y-5">
            {/* ─── MARCA ─── */}
            {tab === 'marca' && (
              <>
                <TextField label="Nombre del restaurante" value={settings.restaurantName}
                  onChange={set('restaurantName')} placeholder="Fresh Coffee" />
                <TextField label="Nombre corto de la app" value={settings.appName}
                  onChange={set('appName')} placeholder="Quiosco"
                  hint="Aparece en la barra superior y en la pestaña del navegador." />
                <TextArea label="Eslogan (opcional)" value={settings.slogan ?? ''}
                  onChange={(v) => set('slogan')(v || null)} placeholder="Café de especialidad, recién hecho" />

                <div className="grid sm:grid-cols-2 gap-4">
                  <ImageUploadField label="Logo principal" value={settings.logoUrl} kind="logo"
                    onChange={set('logoUrl')} hint="PNG/SVG con fondo transparente. Recomendado 200×60." />
                  <ImageUploadField label="Logo para modo oscuro" value={settings.darkLogoUrl} kind="logo"
                    onChange={set('darkLogoUrl')} hint="Versión clara del logo para fondos oscuros." />
                  <ImageUploadField label="Favicon" value={settings.faviconUrl} kind="favicon"
                    onChange={set('faviconUrl')} previewClass="h-8" hint="Ícono de la pestaña. 32×32 o .ico." />
                  <ImageUploadField label="Portada del login" value={settings.loginBackgroundUrl} kind="cover"
                    onChange={set('loginBackgroundUrl')} hint="Imagen del panel lateral en el inicio de sesión." />
                </div>
              </>
            )}

            {/* ─── COLORES ─── */}
            {tab === 'colores' && (
              <>
                {/* Presets rápidos */}
                <div>
                  <span className="ui-label flex items-center gap-2"><PaletteIcon className="w-4 h-4" /> Paletas rápidas</span>
                  <div className="flex flex-wrap gap-2">
                    {COLOR_PRESETS.map((p) => (
                      <button
                        key={p.name}
                        type="button"
                        onClick={() => update({
                          primaryColor: p.primaryColor,
                          secondaryColor: p.secondaryColor,
                          accentColor: p.accentColor,
                        })}
                        className="ui-btn ui-btn-ghost !py-1.5 !px-3 text-sm"
                        title={p.name}
                      >
                        <span className="flex gap-1">
                          <span className="w-3.5 h-3.5 rounded-full" style={{ background: p.primaryColor }} />
                          <span className="w-3.5 h-3.5 rounded-full" style={{ background: p.secondaryColor }} />
                          <span className="w-3.5 h-3.5 rounded-full" style={{ background: p.accentColor }} />
                        </span>
                        {p.name}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="grid sm:grid-cols-2 gap-4">
                  <ColorField label="Color primario" value={settings.primaryColor} onChange={set('primaryColor')} />
                  <ColorField label="Color secundario" value={settings.secondaryColor} onChange={set('secondaryColor')} />
                  <ColorField label="Color de acento" value={settings.accentColor} onChange={set('accentColor')} />
                  <ColorField label="Color de éxito" value={settings.successColor} onChange={set('successColor')} />
                  <ColorField label="Color de advertencia" value={settings.warningColor} onChange={set('warningColor')} />
                  <ColorField label="Color de error" value={settings.dangerColor} onChange={set('dangerColor')} />
                  <ColorField label="Color de fondo" value={settings.backgroundColor} onChange={set('backgroundColor')} />
                  <ColorField label="Color de texto" value={settings.textColor} onChange={set('textColor')} />
                </div>
                <p className="text-xs text-text-muted">
                  En modo oscuro el sistema calcula automáticamente las superficies; los colores de marca se conservan.
                </p>
              </>
            )}

            {/* ─── APARIENCIA ─── */}
            {tab === 'apariencia' && (
              <>
                <div>
                  <span className="ui-label">Modo de tema</span>
                  <Segmented
                    value={settings.themeMode}
                    onChange={set('themeMode')}
                    options={[
                      { value: 'light', label: 'Claro', icon: <SunIcon className="w-4 h-4" /> },
                      { value: 'dark', label: 'Oscuro', icon: <MoonIcon className="w-4 h-4" /> },
                      { value: 'auto', label: 'Automático', icon: <MonitorIcon className="w-4 h-4" /> },
                    ]}
                  />
                  {settings.themeMode === 'auto' && (
                    <p className="text-xs text-text-muted mt-2">
                      Sigue la preferencia del sistema (actualmente: {mode === 'dark' ? 'oscuro' : 'claro'}).
                    </p>
                  )}
                </div>

                <SelectField
                  label="Tipografía"
                  value={settings.fontFamily}
                  onChange={set('fontFamily')}
                  options={FONT_OPTIONS.map((f) => ({ value: f.value, label: f.label }))}
                />

                <div>
                  <span className="ui-label">Tamaño de fuente</span>
                  <Segmented
                    value={settings.fontSize}
                    onChange={set('fontSize')}
                    options={[
                      { value: 'sm', label: 'Pequeño' },
                      { value: 'md', label: 'Mediano' },
                      { value: 'lg', label: 'Grande' },
                    ]}
                  />
                </div>
              </>
            )}

            {/* ─── EMPRESA ─── */}
            {tab === 'empresa' && (
              <>
                <div className="grid sm:grid-cols-2 gap-4">
                  <TextField label="Razón social / Nombre" value={settings.restaurantName} onChange={set('restaurantName')} />
                  <TextField label="RUC" value={settings.ruc ?? ''} onChange={(v) => set('ruc')(v || null)} placeholder="20123456789" />
                  <TextField label="Teléfono" value={settings.phone ?? ''} onChange={(v) => set('phone')(v || null)} placeholder="+51 999 888 777" />
                  <TextField label="Correo" value={settings.email ?? ''} onChange={(v) => set('email')(v || null)} type="email" placeholder="contacto@restaurante.com" />
                  <TextField label="Sitio web" value={settings.website ?? ''} onChange={(v) => set('website')(v || null)} placeholder="https://mirestaurante.com" />
                  <SelectField label="Moneda" value={settings.currency} onChange={set('currency')}
                    options={CURRENCY_OPTIONS.map((c) => ({ value: c.code, label: c.label }))} />
                  <TextField label="Zona horaria" value={settings.timezone} onChange={set('timezone')} placeholder="America/Lima" />
                </div>
                <TextArea label="Dirección" value={settings.address ?? ''} onChange={(v) => set('address')(v || null)}
                  placeholder="Av. Principal 123, Lima" />

                <div>
                  <span className="ui-label">Redes sociales</span>
                  <div className="grid sm:grid-cols-2 gap-3">
                    <TextField label="Facebook" value={settings.socialLinks?.facebook ?? ''} onChange={setSocial('facebook')} placeholder="https://facebook.com/…" />
                    <TextField label="Instagram" value={settings.socialLinks?.instagram ?? ''} onChange={setSocial('instagram')} placeholder="https://instagram.com/…" />
                    <TextField label="TikTok" value={settings.socialLinks?.tiktok ?? ''} onChange={setSocial('tiktok')} placeholder="https://tiktok.com/@…" />
                    <TextField label="WhatsApp" value={settings.socialLinks?.whatsapp ?? ''} onChange={setSocial('whatsapp')} placeholder="+51 999 888 777" />
                  </div>
                </div>
              </>
            )}
          </div>
        </div>

        {/* ─── Columna de vista previa (sticky) ─── */}
        <div className="lg:sticky lg:top-24 space-y-3">
          <div className="flex items-center gap-2 text-sm font-semibold text-text">
            <CheckIcon className="w-4 h-4 text-success" />
            Vista previa en tiempo real
          </div>
          <LivePreview />
          <p className="text-xs text-text-muted">
            Los cambios se aplican al instante en toda la aplicación y se guardan solos.
          </p>
        </div>
      </div>
    </AdminLayout>
  );
}
