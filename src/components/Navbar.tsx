import { Link, useLocation, useNavigate } from 'react-router-dom';
import BrandLogo from './BrandLogo';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../theme/ThemeProvider';
import { ClipboardIcon, StoreIcon, LogoutIcon, BasketIcon } from './icons';

function tabClass(active: boolean) {
  return `flex items-center gap-2 px-5 py-2.5 rounded-lg font-semibold text-sm transition-colors ${
    active
      ? 'bg-primary text-primary-contrast shadow-sm'
      : 'text-text-muted hover:bg-card-muted'
  }`;
}

export default function Navbar() {
  const { pathname } = useLocation();
  const navigate = useNavigate();
  const { user, isAdmin, logout } = useAuth();
  const { settings } = useTheme();
  const onAdminRoute = pathname.startsWith('/vistas/admin');
  const isKiosk = pathname.startsWith('/vistas/kiosk');
  const isMyOrders = pathname.startsWith('/vistas/my-orders');

  function handleLogout() {
    logout();
    navigate('/login', { replace: true });
  }

  return (
    <header className="bg-card border-b border-border sticky top-0 z-30">
      <div className="max-w-screen-2xl mx-auto px-4 sm:px-6 h-20 flex items-center justify-between gap-4">
        {/* Marca (click → volver al quiosco) */}
        <Link
          to="/vistas/kiosk"
          className="flex items-center gap-4 hover:opacity-80 transition-opacity"
          title="Ir al quiosco"
        >
          <BrandLogo showText={false} />
          <span className="hidden lg:block font-serif text-2xl font-bold text-text">
            {settings.appName}
          </span>
        </Link>

        {/* Navegación de módulos */}
        <nav className="flex items-center gap-1.5">
          {isAdmin && (
            <Link to="/vistas/admin/orders" className={tabClass(onAdminRoute)}>
              <ClipboardIcon className="w-5 h-5" />
              <span className="hidden sm:inline">Administrar</span>
            </Link>
          )}
          <Link to="/vistas/kiosk" className={tabClass(isKiosk)}>
            <StoreIcon className="w-5 h-5" />
            <span className="hidden sm:inline">Quiosco</span>
          </Link>
          <Link to="/vistas/my-orders" className={tabClass(isMyOrders)}>
            <BasketIcon className="w-5 h-5" />
            <span className="hidden sm:inline">Mis Pedidos</span>
          </Link>
        </nav>

        {/* Sesión */}
        <div className="flex items-center gap-3 sm:gap-4">
          <div className="hidden sm:block text-right leading-tight">
            <p className="text-xs text-text-muted">Sesión iniciada como</p>
            <p className="font-bold text-text">{user?.name}</p>
          </div>
          <button
            onClick={handleLogout}
            className="flex items-center gap-2 bg-danger hover:bg-danger-hover text-white font-bold text-sm px-4 py-2.5 rounded-lg transition-colors"
          >
            <LogoutIcon className="w-4 h-4" />
            <span className="hidden sm:inline">Cerrar Sesión</span>
          </button>
        </div>
      </div>
    </header>
  );
}
