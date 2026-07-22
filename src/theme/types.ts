// ─── Tipos del dominio "Personalización" ──────────────────────────────────────
// Espejo del modelo `RestaurantSettings` del backend (Prisma).

export type ThemeMode = 'light' | 'dark' | 'auto';
export type FontSize = 'sm' | 'md' | 'lg';

export type SocialLinks = {
  facebook?: string;
  instagram?: string;
  tiktok?: string;
  whatsapp?: string;
  x?: string;
  youtube?: string;
};

export type RestaurantSettings = {
  id: number;
  tenantKey: string;

  // Marca
  restaurantName: string;
  appName: string;
  slogan: string | null;
  logoUrl: string | null;
  darkLogoUrl: string | null;
  faviconUrl: string | null;
  loginBackgroundUrl: string | null;

  // Colores
  primaryColor: string;
  secondaryColor: string;
  accentColor: string;
  successColor: string;
  warningColor: string;
  dangerColor: string;
  backgroundColor: string;
  textColor: string;

  // Apariencia
  fontFamily: string;
  fontSize: FontSize;
  themeMode: ThemeMode;

  // Empresa
  ruc: string | null;
  address: string | null;
  phone: string | null;
  email: string | null;
  website: string | null;
  currency: string;
  timezone: string;
  socialLinks: SocialLinks | null;

  createdAt: string;
  updatedAt: string;
};

// Parche parcial que se envía al backend (todos los campos editables opcionales).
export type SettingsPatch = Partial<
  Omit<RestaurantSettings, 'id' | 'tenantKey' | 'createdAt' | 'updatedAt'>
>;
