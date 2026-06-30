import type { ReactNode } from 'react';
import Navbar from './Navbar';
import AdminTabs from './AdminTabs';

type Props = {
  title: string;
  action?: ReactNode;
  children: ReactNode;
};

// Estructura compartida de los módulos de administración:
// barra superior + pestañas + contenedor con título.
export default function AdminLayout({ title, action, children }: Props) {
  return (
    <div className="min-h-screen flex flex-col bg-surface">
      <Navbar />
      <AdminTabs />
      <main className="flex-1 w-full max-w-screen-2xl mx-auto px-4 sm:px-6 py-8">
        <div className="flex flex-wrap items-end justify-between gap-4 mb-6">
          <div>
            <h1 className="font-serif text-3xl font-bold text-gray-900">{title}</h1>
            <div className="w-14 h-1 bg-brand rounded-full mt-2" />
          </div>
          {action}
        </div>
        {children}
      </main>
    </div>
  );
}
