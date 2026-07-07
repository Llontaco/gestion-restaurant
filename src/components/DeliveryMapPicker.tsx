import { useEffect, useRef, useState } from 'react';

// ─── Configuración de delivery ──────────────────────────────────────────────
// Local: Puerta 1 de la UNMSM (Av. Venezuela cdra. 34, Lima)
export const STORE_LOCATION = { lat: -12.0531, lng: -77.0817 };
export const STORE_NAME = 'Fresh Coffee — Puerta 1 UNMSM';
export const RATE_PER_KM = 1.5;   // S/ por km
export const MAX_DELIVERY_KM = 10; // radio máximo de delivery

// Clave pública de Maps (restringir por dominio en Google Cloud Console).
const MAPS_KEY =
  (import.meta as any).env?.VITE_GOOGLE_MAPS_API_KEY ??
  'AIzaSyD-NwCLkuUeWT0ruC4-r8nVOqjHdHFnias';

// ─── Loader del script de Google Maps (una sola vez) ────────────────────────
let mapsPromise: Promise<void> | null = null;
function loadGoogleMaps(): Promise<void> {
  if ((window as any).google?.maps) return Promise.resolve();
  if (mapsPromise) return mapsPromise;
  mapsPromise = new Promise((resolve, reject) => {
    const script = document.createElement('script');
    // Carga clásica (sin loading=async): al disparar el callback ya están
    // disponibles google.maps.Map y google.maps.Marker.
    script.src = `https://maps.googleapis.com/maps/api/js?key=${MAPS_KEY}&v=weekly&callback=__onGMapsReady`;
    script.async = true;
    (window as any).__onGMapsReady = () => resolve();
    script.onerror = () => reject(new Error('No se pudo cargar Google Maps'));
    document.head.appendChild(script);
  });
  return mapsPromise;
}

// Distancia en línea recta (Haversine) en km
function haversineKm(a: { lat: number; lng: number }, b: { lat: number; lng: number }): number {
  const R = 6371;
  const dLat = ((b.lat - a.lat) * Math.PI) / 180;
  const dLng = ((b.lng - a.lng) * Math.PI) / 180;
  const s =
    Math.sin(dLat / 2) ** 2 +
    Math.cos((a.lat * Math.PI) / 180) * Math.cos((b.lat * Math.PI) / 180) * Math.sin(dLng / 2) ** 2;
  return 2 * R * Math.asin(Math.sqrt(s));
}

// Factor para aproximar la distancia real por calles a partir de la línea recta
const ROAD_FACTOR = 1.3;

export type DeliverySelection = {
  lat: number;
  lng: number;
  distanceKm: number;
  fee: number;
};

type Props = {
  onSelect: (sel: DeliverySelection | null) => void;
};

export default function DeliveryMapPicker({ onSelect }: Props) {
  const mapDivRef = useRef<HTMLDivElement>(null);
  const markerRef = useRef<any>(null);
  const [status, setStatus] = useState<'loading' | 'ready' | 'error'>('loading');
  const [selection, setSelection] = useState<DeliverySelection | null>(null);
  const [tooFar, setTooFar] = useState(false);
  // Referencia estable al callback para no re-crear el mapa en cada render
  const onSelectRef = useRef(onSelect);
  onSelectRef.current = onSelect;

  useEffect(() => {
    let cancelled = false;

    loadGoogleMaps()
      .then(() => {
        if (cancelled || !mapDivRef.current) return;
        const g = (window as any).google;

        const map = new g.maps.Map(mapDivRef.current, {
          center: STORE_LOCATION,
          zoom: 13,
          clickableIcons: false,
          streetViewControl: false,
          mapTypeControl: false,
          fullscreenControl: false,
        });

        // Marcador fijo del local
        new g.maps.Marker({
          position: STORE_LOCATION,
          map,
          title: STORE_NAME,
          label: { text: '🏪', fontSize: '18px' },
        });

        // Al tocar el mapa: colocar/mover el marcador del cliente y calcular
        map.addListener('click', (e: any) => {
          const pos = { lat: e.latLng.lat(), lng: e.latLng.lng() };

          if (!markerRef.current) {
            markerRef.current = new g.maps.Marker({
              position: pos,
              map,
              title: 'Tu ubicación',
              draggable: true,
            });
            markerRef.current.addListener('dragend', (ev: any) => {
              compute({ lat: ev.latLng.lat(), lng: ev.latLng.lng() });
            });
          } else {
            markerRef.current.setPosition(pos);
          }
          compute(pos);
        });

        function compute(pos: { lat: number; lng: number }) {
          const straight = haversineKm(STORE_LOCATION, pos);
          const km = Math.round(straight * ROAD_FACTOR * 10) / 10; // 1 decimal
          if (km > MAX_DELIVERY_KM) {
            setTooFar(true);
            setSelection(null);
            onSelectRef.current(null);
            return;
          }
          const fee = Math.round(km * RATE_PER_KM * 100) / 100;
          const sel = { lat: pos.lat, lng: pos.lng, distanceKm: km, fee };
          setTooFar(false);
          setSelection(sel);
          onSelectRef.current(sel);
        }

        setStatus('ready');
      })
      .catch(() => { if (!cancelled) setStatus('error'); });

    return () => { cancelled = true; };
  }, []);

  return (
    <div className="space-y-2">
      <p className="text-xs text-gray-500">
        Toca el mapa para marcar dónde entregaremos tu pedido. Puedes arrastrar el marcador.
      </p>

      <div
        ref={mapDivRef}
        className="w-full h-52 rounded-xl border border-gray-200 bg-stone-100"
      >
        {status === 'loading' && (
          <p className="text-center text-sm text-gray-400 pt-20">Cargando mapa...</p>
        )}
        {status === 'error' && (
          <p className="text-center text-sm text-red-500 pt-20">No se pudo cargar el mapa.</p>
        )}
      </div>

      {tooFar && (
        <p className="text-xs font-semibold text-red-600 bg-red-50 border border-red-200 rounded-lg p-2.5">
          Esa ubicación está fuera de nuestra zona de reparto (máx. {MAX_DELIVERY_KM} km).
          Elige un punto más cercano o cambia a recojo en local.
        </p>
      )}

      {selection && (
        <p className="text-xs text-gray-600">
          Distancia estimada:{' '}
          <span className="font-bold text-gray-900">{selection.distanceKm} km</span> desde el local.
        </p>
      )}
    </div>
  );
}
