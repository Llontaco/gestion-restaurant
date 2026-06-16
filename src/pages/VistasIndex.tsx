import { Link } from 'react-router-dom';
import BrandLogo from '../components/BrandLogo';
import { StoreIcon, ClipboardIcon, TagIcon } from '../components/icons';
import { SESSION_USER } from '../config';

const ACCESS_POINTS = [
  {
    to: '/vistas/kiosk',
    label: 'Quiosco',
    desc: 'Pantalla de pedidos para clientes',
    icon: StoreIcon,
    accent: true,
  },
  {
    to: '/vistas/orders-ready',
    label: 'Órdenes Listas',
    desc: 'Display de órdenes completadas',
    icon: TagIcon,
    accent: false,
  },
  {
    to: '/vistas/admin/orders',
    label: 'Administración',
    desc: 'Gestión de órdenes y productos',
    icon: ClipboardIcon,
    accent: false,
  },
];

export default function VistasIndex() {
  return (
    <div className="min-h-screen bg-surface flex flex-col items-center justify-center p-8">
      <div className="w-full max-w-md">
        <div className="flex justify-center mb-6">
          <BrandLogo />
        </div>

        <h1 className="font-serif text-4xl font-bold text-center text-gray-900 mb-1">Fresh Coffee</h1>
        <p className="text-center text-gray-500 mb-2 text-sm">Sistema de gestión de restaurante</p>
        <p className="text-center text-gray-400 mb-10 text-xs">
          Sesión iniciada como <span className="font-semibold text-gray-600">{SESSION_USER}</span>
        </p>

        <div className="flex flex-col gap-4">
          {ACCESS_POINTS.map(({ to, label, desc, icon: Icon, accent }) => (
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
      </div>
    </div>
  );
}
