import { useEffect, useRef } from 'react';

// Client ID de Google (público, no es secreto). Se puede sobreescribir con VITE_GOOGLE_CLIENT_ID.
const GOOGLE_CLIENT_ID =
  (import.meta as any).env?.VITE_GOOGLE_CLIENT_ID ??
  '336742067695-hkfvb8o7ktle2e9oe10sshs26trdr34i.apps.googleusercontent.com';

const GIS_SRC = 'https://accounts.google.com/gsi/client';

// Carga el script de Google Identity Services una sola vez.
function loadGis(): Promise<void> {
  return new Promise((resolve, reject) => {
    if ((window as any).google?.accounts?.id) return resolve();
    const existing = document.querySelector<HTMLScriptElement>(`script[src="${GIS_SRC}"]`);
    if (existing) {
      existing.addEventListener('load', () => resolve());
      existing.addEventListener('error', () => reject(new Error('No se pudo cargar Google')));
      return;
    }
    const script = document.createElement('script');
    script.src = GIS_SRC;
    script.async = true;
    script.defer = true;
    script.onload = () => resolve();
    script.onerror = () => reject(new Error('No se pudo cargar Google'));
    document.head.appendChild(script);
  });
}

type Props = {
  onCredential: (credential: string) => void;
  onError?: (message: string) => void;
};

export default function GoogleSignInButton({ onCredential, onError }: Props) {
  const divRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    let cancelled = false;

    loadGis()
      .then(() => {
        if (cancelled || !divRef.current) return;
        const google = (window as any).google;
        google.accounts.id.initialize({
          client_id: GOOGLE_CLIENT_ID,
          callback: (resp: { credential?: string }) => {
            if (resp?.credential) onCredential(resp.credential);
          },
        });
        google.accounts.id.renderButton(divRef.current, {
          theme: 'outline',
          size: 'large',
          width: 320,
          text: 'continue_with',
          shape: 'pill',
          logo_alignment: 'center',
        });
      })
      .catch((e) => onError?.((e as Error).message));

    return () => { cancelled = true; };
  }, [onCredential, onError]);

  // Contenedor centrado; Google inyecta su botón aquí.
  return <div ref={divRef} className="flex justify-center min-h-[44px]" />;
}
