import { NavLink } from 'react-router-dom';
import { ClipboardIcon, TagIcon, StoreIcon } from './icons';

const TABS = [
  { to: '/vistas/admin/orders', label: 'Órdenes', icon: ClipboardIcon },
  { to: '/vistas/admin/products', label: 'Productos', icon: TagIcon },
  { to: '/vistas/orders-ready', label: 'Órdenes Listas', icon: StoreIcon },
];

export default function AdminTabs() {
  return (
    <div className="bg-white border-b border-gray-200">
      <nav className="max-w-screen-2xl mx-auto px-4 sm:px-6 flex gap-1 overflow-x-auto">
        {TABS.map(({ to, label, icon: Icon }) => (
          <NavLink
            key={to}
            to={to}
            end
            className={({ isActive }) =>
              `flex items-center gap-2 px-4 py-3.5 text-sm font-semibold whitespace-nowrap border-b-2 -mb-px transition-colors ${
                isActive
                  ? 'border-brand text-brand'
                  : 'border-transparent text-gray-500 hover:text-gray-800 hover:border-gray-300'
              }`
            }
          >
            <Icon className="w-5 h-5" />
            {label}
          </NavLink>
        ))}
      </nav>
    </div>
  );
}
