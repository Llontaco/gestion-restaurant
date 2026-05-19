import { Link, useNavigate } from 'react-router-dom';
import Logo from './Logo';

type ActiveSection = 'orders' | 'products';

const NAV_LINKS = [
  { to: '/vistas/admin/orders',   label: 'Ordenes',     key: 'orders'   },
  { to: '/vistas/admin/products', label: 'Productos',   key: 'products' },
  { to: '/vistas/kiosk',          label: 'Ver Quiosco', key: 'kiosk'    },
] as const;

export default function AdminSidebar({ active }: { active: ActiveSection }) {
  return (
    <aside
      style={{
        width: 288,
        minHeight: '100vh',
        background: '#fff',
        flexShrink: 0,
        display: 'flex',
        flexDirection: 'column',
        borderRight: '1px solid #e5e7eb',
      }}
    >
      {/* Logo */}
      <div
        style={{
          display: 'flex',
          justifyContent: 'center',
          padding: '24px 16px',
          borderBottom: '1px solid #e5e7eb',
        }}
      >
        <Logo />
      </div>

      {/* Label */}
      <p
        style={{
          textAlign: 'center',
          fontSize: 12,
          fontWeight: 700,
          color: '#9ca3af',
          textTransform: 'uppercase',
          letterSpacing: 1,
          margin: '32px 0 12px',
        }}
      >
        Navegación
      </p>

      {/* Nav */}
      <nav>
        {NAV_LINKS.map((link) => {
          const isActive = active === link.key;
          return (
            <Link
              key={link.to}
              to={link.to}
              target={link.key === 'kiosk' ? '_blank' : undefined}
              style={{
                display: 'block',
                padding: '14px 20px',
                textDecoration: 'none',
                color: isActive ? '#92400e' : '#374151',
                fontWeight: 600,
                fontSize: 16,
                borderLeft: isActive ? '4px solid #f59e0b' : '4px solid transparent',
                background: isActive ? '#fef3c7' : 'transparent',
                transition: 'all .15s',
              }}
            >
              {link.label}
            </Link>
          );
        })}
      </nav>
    </aside>
  );
}
