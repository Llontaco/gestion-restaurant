import { NavLink } from 'react-router-dom';
import Logo from './Logo';

const NAV_LINKS = [
  { to: '/vistas/admin/orders',   label: 'Ordenes'   },
  { to: '/vistas/admin/products', label: 'Productos' },
  { to: '/vistas/kiosk',          label: 'Ver Quiosco', external: true },
];

export default function AdminSidebar() {
  return (
    <aside className="md:w-72 md:h-screen bg-white border-r border-gray-200 flex-shrink-0">
      <Logo />
      <div className="mt-10">
        <p className="text-center text-xs font-bold text-gray-400 uppercase tracking-widest mb-3">
          Navegación
        </p>
        <nav className="flex flex-col">
          {NAV_LINKS.map((link) =>
            link.external ? (
              <a
                key={link.to}
                href={link.to}
                target="_blank"
                rel="noopener noreferrer"
                className="text-gray-700 font-semibold text-base px-5 py-3 border-l-4 border-transparent hover:bg-amber-50 hover:border-amber-400 transition-all"
              >
                {link.label}
              </a>
            ) : (
              <NavLink
                key={link.to}
                to={link.to}
                className={({ isActive }) =>
                  `font-semibold text-base px-5 py-3 border-l-4 transition-all ${
                    isActive
                      ? 'bg-amber-100 border-amber-400 text-amber-900'
                      : 'border-transparent text-gray-700 hover:bg-amber-50 hover:border-amber-400'
                  }`
                }
              >
                {link.label}
              </NavLink>
            )
          )}
        </nav>
      </div>
    </aside>
  );
}
