import { Link } from 'react-router-dom';

const ACCESS_POINTS = [
  {
    to: '/vistas/kiosk',
    label: 'Quiosco',
    desc: 'Pantalla de pedidos para clientes',
    emoji: '🛒',
    color: 'bg-amber-400 hover:bg-amber-500',
    textColor: 'text-black',
  },
  {
    to: '/vistas/orders-ready',
    label: 'Órdenes Listas',
    desc: 'Display de órdenes completadas para clientes',
    emoji: '✅',
    color: 'bg-white hover:bg-gray-50 border border-gray-200',
    textColor: 'text-gray-900',
  },
  {
    to: '/vistas/admin/orders',
    label: 'Administración',
    desc: 'Panel de gestión de órdenes y productos',
    emoji: '⚙️',
    color: 'bg-white hover:bg-gray-50 border border-gray-200',
    textColor: 'text-gray-900',
  },
];

export default function VistasIndex() {
  return (
    <div className="min-h-screen bg-gray-100 flex flex-col items-center justify-center p-8">
      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="flex justify-center mb-6">
          <div className="w-32 h-32 relative">
            <img src="/logo.svg" alt="Logo" className="w-full h-full object-contain" />
          </div>
        </div>

        <h1 className="text-4xl font-black text-center text-gray-900 mb-2">QUIOSKO</h1>
        <p className="text-center text-gray-500 mb-10 text-sm">Sistema de gestión de restaurante</p>

        <div className="flex flex-col gap-4">
          {ACCESS_POINTS.map((ap) => (
            <Link
              key={ap.to}
              to={ap.to}
              className={`${ap.color} ${ap.textColor} rounded-lg p-5 flex items-center gap-4 shadow-sm transition-all`}
            >
              <span className="text-4xl">{ap.emoji}</span>
              <div>
                <p className="font-bold text-xl">{ap.label}</p>
                <p className="text-sm opacity-70">{ap.desc}</p>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
