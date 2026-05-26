import { Link } from 'react-router-dom';
import Logo from '../components/Logo';

const sections = [
  {
    title: '🛒 Quiosco (Cliente)',
    links: [
      {
        to: '/vistas/kiosk',
        label: 'Menú de Pedidos',
        desc: 'Selección de productos por categoría + carrito interactivo completo',
      },
      {
        to: '/vistas/orders-ready',
        label: 'Órdenes Listas',
        desc: 'Pantalla pública de display — muestra las órdenes listas para recoger',
      },
    ],
  },
  {
    title: '⚙️ Panel de Administración',
    links: [
      {
        to: '/vistas/admin/orders',
        label: 'Admin – Gestión de Órdenes',
        desc: 'Lista de pedidos pendientes con botón "Marcar Completado"',
      },
      {
        to: '/vistas/admin/products',
        label: 'Admin – Lista de Productos',
        desc: 'Tabla de productos con búsqueda en tiempo real y paginación',
      },
      {
        to: '/vistas/admin/products/new',
        label: 'Admin – Crear Producto',
        desc: 'Formulario de creación con preview de imagen',
      },
      {
        to: '/vistas/admin/products/1/edit',
        label: 'Admin – Editar Producto',
        desc: 'Formulario de edición con confirmación de eliminación',
      },
    ],
  },
];

export default function VistasIndex() {
  return (
    <div
      style={{
        fontFamily: "'Inter', sans-serif",
        background: '#f3f4f6',
        minHeight: '100vh',
        padding: '48px 24px',
      }}
    >
      <div style={{ maxWidth: 640, margin: '0 auto' }}>
        {/* Header */}
        <div style={{ textAlign: 'center', marginBottom: 48 }}>
          <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 16 }}>
            <Logo size={100} />
          </div>
          <h1 style={{ fontSize: 40, fontWeight: 900, color: '#111827', marginBottom: 8 }}>
            QUIOSKO
          </h1>
          <span
            style={{
              display: 'inline-block',
              background: '#fbbf24',
              color: '#111827',
              fontSize: 12,
              fontWeight: 700,
              padding: '4px 12px',
              borderRadius: 99,
              letterSpacing: 1,
              textTransform: 'uppercase',
              marginBottom: 8,
            }}
          >
            Versión Beta
          </span>
          <p style={{ color: '#6b7280', fontSize: 16 }}>
            Todas las vistas funcionan con datos de prueba — sin backend
          </p>
        </div>

        {/* Sections */}
        {sections.map((section) => (
          <div key={section.title} style={{ marginBottom: 40 }}>
            <h2
              style={{
                fontSize: 18,
                fontWeight: 700,
                color: '#374151',
                marginBottom: 16,
                paddingBottom: 10,
                borderBottom: '2px solid #e5e7eb',
              }}
            >
              {section.title}
            </h2>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              {section.links.map((link) => (
                <Link
                  key={link.to}
                  to={link.to}
                  style={{
                    display: 'block',
                    background: '#fff',
                    border: '1px solid #e5e7eb',
                    borderRadius: 10,
                    padding: '18px 22px',
                    textDecoration: 'none',
                    color: 'inherit',
                    boxShadow: '0 1px 3px rgba(0,0,0,0.05)',
                    transition: 'box-shadow .15s, border-color .15s',
                  }}
                  onMouseEnter={(e) => {
                    (e.currentTarget as HTMLAnchorElement).style.boxShadow =
                      '0 4px 12px rgba(0,0,0,0.10)';
                    (e.currentTarget as HTMLAnchorElement).style.borderColor = '#a5b4fc';
                  }}
                  onMouseLeave={(e) => {
                    (e.currentTarget as HTMLAnchorElement).style.boxShadow =
                      '0 1px 3px rgba(0,0,0,0.05)';
                    (e.currentTarget as HTMLAnchorElement).style.borderColor = '#e5e7eb';
                  }}
                >
                  <p
                    style={{
                      fontWeight: 700,
                      color: '#4f46e5',
                      fontSize: 16,
                      marginBottom: 4,
                    }}
                  >
                    {link.label} →
                  </p>
                  <p style={{ color: '#6b7280', fontSize: 14 }}>{link.desc}</p>
                </Link>
              ))}
            </div>
          </div>
        ))}

        <p
          style={{
            textAlign: 'center',
            color: '#9ca3af',
            fontSize: 13,
            marginTop: 40,
            lineHeight: 1.6,
          }}
        >
          Todos los botones y formularios son funcionales.<br />
          El backend no está conectado en esta versión.
        </p>
      </div>
    </div>
  );
}
