// Iconos de línea (Heroicons-style) en SVG inline. Heredan color con currentColor.
type IconProps = { className?: string };

const base = (className = 'w-6 h-6') => ({
  className,
  viewBox: '0 0 24 24',
  fill: 'none',
  stroke: 'currentColor',
  strokeWidth: 1.7,
  strokeLinecap: 'round' as const,
  strokeLinejoin: 'round' as const,
});

/* ─── Interfaz / navegación ─── */
export const ClipboardIcon = ({ className }: IconProps) => (
  <svg {...base(className)}>
    <path d="M9 5H7a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V7a2 2 0 0 0-2-2h-2" />
    <rect x="9" y="3" width="6" height="4" rx="1" />
    <path d="M9 12h6M9 16h4" />
  </svg>
);

export const StoreIcon = ({ className }: IconProps) => (
  <svg {...base(className)}>
    <path d="M4 9h16l-1-5H5L4 9Z" />
    <path d="M4 9v1a3 3 0 0 0 6 0 3 3 0 0 0 6 0 3 3 0 0 0 4 0" />
    <path d="M5 12v8h14v-8" />
    <path d="M10 20v-4h4v4" />
  </svg>
);

export const TagIcon = ({ className }: IconProps) => (
  <svg {...base(className)}>
    <path d="M3 12V5a2 2 0 0 1 2-2h7l9 9-9 9-9-9Z" />
    <circle cx="8" cy="8" r="1.4" />
  </svg>
);

export const LogoutIcon = ({ className }: IconProps) => (
  <svg {...base(className)}>
    <path d="M15 17v2a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h7a2 2 0 0 1 2 2v2" />
    <path d="M19 12H9m10 0-3-3m3 3-3 3" />
  </svg>
);

/* ─── Carrito / pedido ─── */
export const CartIcon = ({ className }: IconProps) => (
  <svg {...base(className)}>
    <circle cx="9" cy="20" r="1.4" />
    <circle cx="17" cy="20" r="1.4" />
    <path d="M3 4h2l2.4 12.3a1 1 0 0 0 1 .8h8.8a1 1 0 0 0 1-.8L21 7H6" />
  </svg>
);

export const BasketIcon = ({ className }: IconProps) => (
  <svg {...base(className)}>
    <path d="M5 9h14l-1.2 9.2a2 2 0 0 1-2 1.8H8.2a2 2 0 0 1-2-1.8L5 9Z" />
    <path d="M9 9 12 3l3 6" />
    <path d="M9.5 13v3M14.5 13v3" />
  </svg>
);

export const LockIcon = ({ className }: IconProps) => (
  <svg {...base(className)}>
    <rect x="5" y="11" width="14" height="9" rx="2" />
    <path d="M8 11V8a4 4 0 0 1 8 0v3" />
  </svg>
);

export const InfoIcon = ({ className }: IconProps) => (
  <svg {...base(className)}>
    <circle cx="12" cy="12" r="9" />
    <path d="M12 11v5M12 8h.01" />
  </svg>
);

export const TruckIcon = ({ className }: IconProps) => (
  <svg {...base(className)}>
    <path d="M3 6h11v9H3z" />
    <path d="M14 9h4l3 3v3h-7" />
    <circle cx="7.5" cy="18" r="1.6" />
    <circle cx="17.5" cy="18" r="1.6" />
  </svg>
);

export const PlusIcon = ({ className }: IconProps) => (
  <svg {...base(className)}>
    <path d="M12 5v14M5 12h14" />
  </svg>
);

export const MinusIcon = ({ className }: IconProps) => (
  <svg {...base(className)}>
    <path d="M5 12h14" />
  </svg>
);

export const XIcon = ({ className }: IconProps) => (
  <svg {...base(className)}>
    <path d="M6 6l12 12M18 6 6 18" />
  </svg>
);

export const SearchIcon = ({ className }: IconProps) => (
  <svg {...base(className)}>
    <circle cx="11" cy="11" r="7" />
    <path d="m20 20-3.2-3.2" />
  </svg>
);

export const ArrowLeftIcon = ({ className }: IconProps) => (
  <svg {...base(className)}>
    <path d="M19 12H5m0 0 6-6m-6 6 6 6" />
  </svg>
);

export const CameraIcon = ({ className }: IconProps) => (
  <svg {...base(className)}>
    <path d="M4 8h3l1.5-2h7L17 8h3a1 1 0 0 1 1 1v9a1 1 0 0 1-1 1H4a1 1 0 0 1-1-1V9a1 1 0 0 1 1-1Z" />
    <circle cx="12" cy="13" r="3.2" />
  </svg>
);

export const CoffeeIcon = ({ className }: IconProps) => (
  <svg {...base(className)}>
    <path d="M5 9h11v4a5 5 0 0 1-5 5H10a5 5 0 0 1-5-5V9Z" />
    <path d="M16 10h2.5a2.5 2.5 0 0 1 0 5H16" />
    <path d="M8 3c-.6.8-.6 1.7 0 2.5M11.5 3c-.6.8-.6 1.7 0 2.5" />
  </svg>
);

/* ─── Iconos de categoría (glifos de línea) ─── */
const Cat = {
  burger: (
    <>
      <path d="M5 11a7 7 0 0 1 14 0H5Z" />
      <path d="M4 14h16M5 14a2 2 0 0 0 0 0c.8 1 1.6 1 2.4 0 .8 1 1.6 1 2.4 0 .8 1 1.6 1 2.4 0 .8 1 1.6 1 2.4 0 .8 1 1.6 1 2.4 0" />
      <path d="M6 18h12a1 1 0 0 0 1-1H5a1 1 0 0 0 1 1Z" />
    </>
  ),
  coffee: (
    <>
      <path d="M5 8h11v5a5 5 0 0 1-5 5H10a5 5 0 0 1-5-5V8Z" />
      <path d="M16 9h2.5a2.5 2.5 0 0 1 0 5H16" />
      <path d="M19 21H4" />
    </>
  ),
  pizza: (
    <>
      <path d="M12 3c5 0 9 4 9 9L12 21 3 12c0-5 4-9 9-9Z" />
      <circle cx="10" cy="9" r="0.8" />
      <circle cx="13.5" cy="11.5" r="0.8" />
    </>
  ),
  donut: (
    <>
      <circle cx="12" cy="12" r="8" />
      <circle cx="12" cy="12" r="2.6" />
    </>
  ),
  cake: (
    <>
      <path d="M4 21h16M5 21v-7a3 3 0 0 1 3-3h8a3 3 0 0 1 3 3v7" />
      <path d="M4 15c1.2 1.2 2.4 1.2 3.6 0 1.2 1.2 2.4 1.2 3.6 0 1.2 1.2 2.4 1.2 3.6 0 1.2 1.2 2.4 1.2 3.6 0" />
      <path d="M12 8V5M12 5l1-1-1-1-1 1 1 1Z" />
    </>
  ),
  cookie: (
    <>
      <path d="M12 3a9 9 0 1 0 9 9 4 4 0 0 1-4-4 4 4 0 0 1-5-5Z" />
      <path d="M9 11h.01M13 14h.01M15 10h.01" />
    </>
  ),
  utensils: (
    <>
      <path d="M7 3v8M5 3v4a2 2 0 0 0 2 2M9 3v4a2 2 0 0 1-2 2M7 11v10" />
      <path d="M16 3c-1.5 1-2 3-2 6 0 1.5.7 2.5 2 3v9" />
    </>
  ),
};

const CATEGORY_GLYPH: Record<string, keyof typeof Cat> = {
  hamburguesa: 'burger',
  cafe: 'coffee',
  café: 'coffee',
  pizza: 'pizza',
  dona: 'donut',
  pastel: 'cake',
  galletas: 'cookie',
};

export const CategoryIcon = ({ name, className }: { name: string; className?: string }) => {
  const key = CATEGORY_GLYPH[name.toLowerCase()] ?? 'utensils';
  return <svg {...base(className)}>{Cat[key]}</svg>;
};
