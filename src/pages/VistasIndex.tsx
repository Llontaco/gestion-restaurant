import { Link, useNavigate } from 'react-router-dom';
import BrandLogo from '../components/BrandLogo';
import { StoreIcon, ClipboardIcon, TagIcon, LogoutIcon } from '../components/icons';
import { useAuth } from '../context/AuthContext';

type AccessPoint = {
  to: string;
  label: string;
  desc: string;
  icon: typeof StoreIcon;
  accent?: boolean;
  adminOnly?: boolean;
};

const ACCESS_POINTS: AccessPoint[] = [
  {
    to: '/vistas/kiosk',
    label: 'Quiosco',
    desc: 'Elige y pide tus productos',
    icon: StoreIcon,
    accent: true,
  },
  {
    to: '/vistas/orders-ready',
    label: 'Órdenes Listas',
    desc: 'Display de órdenes completadas',
    icon: TagIcon,
    adminOnly: true,
  },
  {
    to: '/vistas/admin/orders',
    label: 'Administración',
    desc: 'Gestión de órdenes y productos',
    icon: ClipboardIcon,
    adminOnly: true,
  },
  {
    to: '/vistas/admin/categories',
    label: 'Categorías',
    desc: 'Crea y edita las categorías del menú',
    icon: TagIcon,
    adminOnly: true,
  },
];

export default function VistasIndex() {
  const { user, isAdmin, logout } = useAuth();
  const navigate = useNavigate();

  const points = ACCESS_POINTS.filter((p) => !p.adminOnly || isAdmin);

  function handleLogout() {
    logout();
    navigate('/login', { replace: true });
  }

  return (
    <div className="min-h-screen bg-surface flex flex-col items-center justify-center p-4 sm:p-8">
      <div className="w-full max-w-md">
        <div className="flex justify-center mb-6">
          <BrandLogo />
        </div>

        <h1 className="font-serif text-3xl sm:text-4xl font-bold text-center text-gray-900 mb-1">
          Fresh Coffee
        </h1>
        <p className="text-center text-gray-500 mb-2 text-sm">Sistema de gestión de restaurante</p>
        <p className="text-center text-gray-400 mb-8 text-xs">
          Sesión iniciada como <span className="font-semibold text-gray-600">{user?.name}</span>
          {isAdmin && <span className="ml-1 text-brand font-semibold">(Admin)</span>}
        </p>

        <div className="flex flex-col gap-4">
          {points.map(({ to, label, desc, icon: Icon, accent }) => (
            <Link
              key={to}
              to={to}
              className={`rounded-2xl p-5 flex items-center gap-4 shadow-sm border transition-all hover:shadow-md ${
                accent
                  ? 'bg-brand border-brand text-white'
                  : 'bg-white border-gray-100 text-gray-900 hover:bg-stone-50'
              }`}
            >
              <span
                className={`w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0 ${
                  accent ? 'bg-white/20 text-white' : 'bg-brand-light text-brand'
                }`}
              >
                <Icon className="w-6 h-6" />
              </span>
              <div>
                <p className="font-serif font-bold text-xl">{label}</p>
                <p className={`text-sm ${accent ? 'text-white/80' : 'text-gray-500'}`}>{desc}</p>
              </div>
            </Link>
          ))}
        </div>

        <button
          onClick={handleLogout}
          className="mt-8 w-full flex items-center justify-center gap-2 text-gray-500 hover:text-gray-800 text-sm font-semibold py-2 transition-colors"
        >
          <LogoutIcon className="w-4 h-4" />
          Cerrar sesión
        </button>
      </div>
    </div>
  );
}
