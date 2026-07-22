import { useRef, useState } from 'react';
import { fileToDataUrl } from '../../theme/imageFile';
import type { ImageKind } from '../../theme/imageFile';
import { UploadIcon, XIcon } from '../icons';

// Carga de imágenes de marca (logo, favicon, portada). Convierte el archivo a un
// data URL (base64) en el navegador —redimensionado y comprimido— y lo entrega por
// onChange para guardarlo en la configuración. No depende de un endpoint de subida
// ni del sistema de archivos, así que funciona igual en local y en Vercel.
export default function ImageUploadField({
  label, value, onChange, hint, previewClass = 'h-16', kind = 'logo',
}: {
  label: string;
  value: string | null;
  onChange: (url: string | null) => void;
  hint?: string;
  previewClass?: string;
  kind?: ImageKind;
}) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleFile(file: File) {
    setError(null);
    setUploading(true);
    try {
      const dataUrl = await fileToDataUrl(file, kind);
      onChange(dataUrl);
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setUploading(false);
    }
  }

  return (
    <div>
      <span className="ui-label">{label}</span>
      <div className="ui-panel p-3 flex items-center gap-3">
        {/* Vista previa */}
        <div className="w-20 h-16 rounded-lg bg-card border border-border flex items-center justify-center overflow-hidden shrink-0">
          {value
            ? <img src={value} alt={label} className={`${previewClass} w-auto object-contain`} />
            : <span className="text-xs text-text-muted">Sin imagen</span>}
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={() => inputRef.current?.click()}
              disabled={uploading}
              className="ui-btn ui-btn-ghost text-sm py-1.5 px-3"
            >
              <UploadIcon className="w-4 h-4" />
              {uploading ? 'Subiendo…' : value ? 'Cambiar' : 'Subir imagen'}
            </button>
            {value && (
              <button
                type="button"
                onClick={() => onChange(null)}
                className="ui-btn ui-btn-ghost text-sm py-1.5 px-3"
              >
                <XIcon className="w-4 h-4" /> Quitar
              </button>
            )}
          </div>
          {hint && <p className="text-xs text-text-muted mt-1.5">{hint}</p>}
          {error && <p className="text-xs text-danger mt-1.5">{error}</p>}
        </div>

        <input
          ref={inputRef}
          type="file"
          accept="image/png,image/jpeg,image/webp,image/svg+xml,image/x-icon,.ico"
          className="hidden"
          onChange={(e) => {
            const f = e.target.files?.[0];
            if (f) handleFile(f);
            e.target.value = '';
          }}
        />
      </div>
    </div>
  );
}
