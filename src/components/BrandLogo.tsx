import { CoffeeIcon } from './icons';
import { useTheme } from '../theme/ThemeProvider';

// Lockup de marca dinámico: usa el logo subido en "Personalización" si existe;
// si no, cae a una insignia con la inicial del restaurante + su nombre.
export default function BrandLogo({
  className = '',
  showText = true,
}: {
  className?: string;
  showText?: boolean;
}) {
  const { settings, logoUrl } = useTheme();

  if (logoUrl) {
    return (
      <img
        src={logoUrl}
        alt={settings.restaurantName}
        className={`h-11 w-auto max-w-[180px] object-contain ${className}`}
      />
    );
  }

  const initial = settings.restaurantName.trim().charAt(0).toUpperCase() || '·';

  return (
    <div className={`flex items-center gap-2.5 ${className}`}>
      <div
        className="w-11 h-11 rounded-xl flex items-center justify-center shadow-sm"
        style={{ backgroundColor: 'var(--color-secondary)', color: 'var(--color-primary)' }}
      >
        {settings.restaurantName === 'Fresh Coffee'
          ? <CoffeeIcon className="w-6 h-6" />
          : <span className="font-serif font-extrabold text-xl">{initial}</span>}
      </div>
      {showText && (
        <div className="leading-none">
          {settings.slogan && (
            <span className="block font-script text-sm -mb-1" style={{ color: 'var(--color-primary)' }}>
              {settings.appName}
            </span>
          )}
          <span className="block font-serif font-extrabold text-xl tracking-tight text-text">
            {settings.restaurantName}
          </span>
        </div>
      )}
    </div>
  );
}
