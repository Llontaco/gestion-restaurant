import { Link, useLocation, useNavigate } from 'react-router-dom';
import BrandLogo from './BrandLogo';
import { useAuth } from '../context/AuthContext';
import { ClipboardIcon, StoreIcon, LogoutIcon } from './icons';

function tabClass(active: boolean) {
  return `flex items-center gap-2 px-5 py-2.5 rounded-lg font-semibold text-sm transition-colors ${
    active ? 'bg-brand text-white shadow-sm' : 'text-gray-600 hover:bg-gray-100'
  }`;
}

export default function Navbar() {
  const { pathname } = useLocation();
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const isAdmin = pathname.startsWith('/vistas/admin');
  const isKiosk = pathname.startsWith('/vistas/kiosk');

  function handleLogout() {
    logout();
    navigate('/login', { replace: true });
  }

  return (
    <header className="bg-white border-b border-gray-200 sticky top-0 z-30">
      <div className="max-w-screen-2xl mx-auto px-4 sm:px-6 h-20 flex items-center justify-between gap-4">
        {/* Marca */}
        <div className="flex items-center gap-4">
          <BrandLogo />
          <span className="hidden lg:block font-serif text-2xl font-bold text-gray-900">Quiosco</span>
        </div>

        {/* Navegación de módulos */}
        <nav className="flex items-center gap-1.5">
          <Link to="/vistas/admin/orders" className={tabClass(isAdmin)}>
            <ClipboardIcon className="w-5 h-5" />
            <span className="hidden sm:inline">Administrar</span>
          </Link>
          <Link to="/vistas/kiosk" className={tabClass(isKiosk)}>
            <StoreIcon className="w-5 h-5" />
            <span className="hidden sm:inline">Quiosco</span>
          </Link>
        </nav>

        {/* Sesión */}
        <div className="flex items-center gap-3 sm:gap-4">
          <div className="hidden sm:block text-right leading-tight">
            <p className="text-xs text-gray-500">Sesión iniciada como</p>
            <p className="font-bold text-gray-900">{user?.name}</p>
          </div>
          <button
            onClick={handleLogout}
            className="flex items-center gap-2 bg-red-500 hover:bg-red-600 text-white font-bold text-sm px-4 py-2.5 rounded-lg transition-colors"
          >
            <LogoutIcon className="w-4 h-4" />
            <span className="hidden sm:inline">Cerrar Sesión</span>
          </button>
        </div>
      </div>
    </header>
  );
}
