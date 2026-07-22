import { useTheme } from '../theme/ThemeProvider';
import BrandLogo from './BrandLogo';

// Logo grande centrado (sidebar). Usa la imagen subida en "Personalización"
// o el lockup de marca dinámico como respaldo.
export default function Logo() {
  const { logoUrl, settings } = useTheme();
  return (
    <div className="flex flex-col items-center justify-center mt-5 px-4 text-center">
      {logoUrl ? (
        <img
          src={logoUrl}
          alt={settings.restaurantName}
          className="w-32 h-32 object-contain"
        />
      ) : (
        <BrandLogo showText={false} className="scale-125" />
      )}
      <span className="mt-3 font-serif font-extrabold text-lg text-text">
        {settings.restaurantName}
      </span>
      {settings.slogan && (
        <span className="text-xs text-text-muted mt-0.5">{settings.slogan}</span>
      )}
    </div>
  );
}
