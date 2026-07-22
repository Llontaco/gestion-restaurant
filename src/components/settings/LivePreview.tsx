import { useTheme } from '../../theme/ThemeProvider';
import { StoreIcon, ClipboardIcon, BasketIcon } from '../icons';

// Vista previa en tiempo real: una miniatura de la app (navbar, sidebar, botones,
// tabla, formulario, modal, dashboard). Usa clases semánticas, así que se
// re-tematiza sola cuando el ThemeProvider actualiza las variables CSS.
export default function LivePreview() {
  const { settings, mode, logoUrl } = useTheme();

  return (
    <div className="ui-card overflow-hidden theme-transition">
      {/* Barra de ventana */}
      <div className="flex items-center gap-1.5 px-4 py-2.5 border-b border-border bg-card-muted">
        <span className="w-2.5 h-2.5 rounded-full" style={{ background: '#ff5f57' }} />
        <span className="w-2.5 h-2.5 rounded-full" style={{ background: '#febc2e' }} />
        <span className="w-2.5 h-2.5 rounded-full" style={{ background: '#28c840' }} />
        <span className="ml-3 text-xs text-text-muted">Vista previa · modo {mode === 'dark' ? 'oscuro' : 'claro'}</span>
      </div>

      <div className="bg-bg p-3">
        {/* Navbar */}
        <div className="bg-card border border-border rounded-lg px-3 h-12 flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            {logoUrl
              ? <img src={logoUrl} alt="" className="h-6 w-auto object-contain" />
              : <span className="w-6 h-6 rounded-md flex items-center justify-center text-[10px] font-bold"
                       style={{ background: 'var(--color-secondary)', color: 'var(--color-primary)' }}>
                  {settings.restaurantName.charAt(0).toUpperCase()}
                </span>}
            <span className="font-serif font-bold text-sm text-text">{settings.appName}</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="text-[10px] font-semibold px-2 py-1 rounded-md bg-primary text-primary-contrast">Administrar</span>
            <span className="text-[10px] font-semibold px-2 py-1 rounded-md text-text-muted">Quiosco</span>
          </div>
        </div>

        <div className="flex gap-3">
          {/* Sidebar */}
          <div className="w-28 shrink-0 bg-card border border-border rounded-lg p-2 hidden sm:block">
            <div className="flex items-center gap-1.5 px-2 py-1.5 rounded-md bg-primary-soft text-primary text-[11px] font-semibold">
              <ClipboardIcon className="w-3.5 h-3.5" /> Órdenes
            </div>
            <div className="flex items-center gap-1.5 px-2 py-1.5 rounded-md text-text text-[11px] font-semibold">
              <StoreIcon className="w-3.5 h-3.5" /> Productos
            </div>
            <div className="flex items-center gap-1.5 px-2 py-1.5 rounded-md text-text text-[11px] font-semibold">
              <BasketIcon className="w-3.5 h-3.5" /> Pedidos
            </div>
          </div>

          {/* Contenido */}
          <div className="flex-1 min-w-0 space-y-3">
            {/* Dashboard: tarjetas de estadística */}
            <div className="grid grid-cols-3 gap-2">
              {[
                { k: 'Ventas', v: 'S/ 1,240', c: 'var(--color-primary)' },
                { k: 'Órdenes', v: '38', c: 'var(--color-accent)' },
                { k: 'Éxito', v: '96%', c: 'var(--color-success)' },
              ].map((t) => (
                <div key={t.k} className="bg-card border border-border rounded-lg p-2">
                  <p className="text-[10px] text-text-muted">{t.k}</p>
                  <p className="font-bold text-sm" style={{ color: t.c }}>{t.v}</p>
                </div>
              ))}
            </div>

            {/* Tabla */}
            <div className="bg-card border border-border rounded-lg overflow-hidden">
              <div className="grid grid-cols-3 text-[10px] font-semibold text-primary-contrast bg-primary px-2 py-1.5">
                <span>Producto</span><span>Cat.</span><span className="text-right">Precio</span>
              </div>
              {[['Café Latte', 'Bebidas', 'S/ 9'], ['Croissant', 'Panes', 'S/ 6']].map((r, i) => (
                <div key={i} className="grid grid-cols-3 text-[10px] text-text px-2 py-1.5 border-t border-border">
                  <span>{r[0]}</span><span className="text-text-muted">{r[1]}</span>
                  <span className="text-right font-semibold">{r[2]}</span>
                </div>
              ))}
            </div>

            {/* Formulario + botones */}
            <div className="bg-card border border-border rounded-lg p-2.5 space-y-2">
              <div>
                <span className="text-[10px] font-semibold text-text">Nombre</span>
                <div className="ui-input mt-1 !py-1.5 text-[10px]">Ej. Combo del día</div>
              </div>
              <div className="flex flex-wrap gap-1.5">
                <span className="ui-btn ui-btn-primary text-[10px] !py-1 !px-2.5">Guardar</span>
                <span className="ui-btn ui-btn-secondary text-[10px] !py-1 !px-2.5">Secundario</span>
                <span className="ui-btn ui-btn-danger text-[10px] !py-1 !px-2.5">Eliminar</span>
              </div>
              <div className="flex flex-wrap gap-1.5">
                <span className="ui-badge-success text-[10px] font-semibold px-2 py-0.5 rounded-full">Éxito</span>
                <span className="ui-badge-warning text-[10px] font-semibold px-2 py-0.5 rounded-full">Advertencia</span>
                <span className="ui-badge-danger text-[10px] font-semibold px-2 py-0.5 rounded-full">Error</span>
              </div>
            </div>

            {/* Modal simulado */}
            <div className="relative bg-card-muted border border-border rounded-lg p-2 h-14 overflow-hidden">
              <div className="absolute inset-0" style={{ background: 'rgba(0,0,0,0.25)' }} />
              <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 bg-card border border-border rounded-lg px-3 py-1.5 shadow-lg">
                <span className="text-[10px] font-semibold text-text">¿Confirmar pedido?</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
