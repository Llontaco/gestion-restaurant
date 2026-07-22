import { NavLink } from 'react-router-dom';
import Logo from './Logo';

const NAV_LINKS = [
  { to: '/vistas/admin/orders',   label: 'Ordenes'   },
  { to: '/vistas/admin/products', label: 'Productos' },
  { to: '/vistas/kiosk',          label: 'Ver Quiosco', external: true },
];

export default function AdminSidebar() {
  return (
    <aside className="md:w-72 md:h-screen bg-card border-r border-border flex-shrink-0">
      <Logo />
      <div className="mt-10">
        <p className="text-center text-xs font-bold text-text-muted uppercase tracking-widest mb-3">
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
                className="text-text font-semibold text-base px-5 py-3 border-l-4 border-transparent hover:bg-primary-soft hover:border-primary transition-all"
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
                      ? 'bg-primary-soft border-primary text-primary'
                      : 'border-transparent text-text hover:bg-primary-soft hover:border-primary'
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
