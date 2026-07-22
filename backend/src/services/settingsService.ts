import prisma from '../prismaClient';
import { Prisma } from '@prisma/client';
import type { RestaurantSettings } from '@prisma/client';

// ─── Capa de servicio (Clean Architecture) ────────────────────────────────────
// Las rutas HTTP no tocan Prisma directamente: delegan aquí toda la lógica de
// negocio (defaults, saneamiento de campos, upsert). Así el dominio "settings"
// queda centralizado y es fácil de testear o de mover a multiempresa.

const DEFAULT_TENANT = 'default';

// Campos que el cliente PUEDE modificar. Cualquier otra clave del body se ignora
// (evita que un cliente escriba id/createdAt/tenantKey por accidente o a propósito).
const EDITABLE_FIELDS = [
  'restaurantName', 'appName', 'slogan',
  'logoUrl', 'darkLogoUrl', 'faviconUrl', 'loginBackgroundUrl',
  'primaryColor', 'secondaryColor', 'accentColor',
  'successColor', 'warningColor', 'dangerColor',
  'backgroundColor', 'textColor',
  'fontFamily', 'fontSize', 'themeMode',
  'ruc', 'address', 'phone', 'email', 'website', 'currency', 'timezone',
  'socialLinks',
] as const;

type EditableField = (typeof EDITABLE_FIELDS)[number];

const HEX_FIELDS: EditableField[] = [
  'primaryColor', 'secondaryColor', 'accentColor',
  'successColor', 'warningColor', 'dangerColor',
  'backgroundColor', 'textColor',
];

const HEX_RE = /^#([0-9a-fA-F]{3}|[0-9a-fA-F]{6}|[0-9a-fA-F]{8})$/;

/** Obtiene la configuración del restaurante; la crea con valores por defecto si no existe. */
export async function getSettings(tenantKey = DEFAULT_TENANT): Promise<RestaurantSettings> {
  const existing = await prisma.restaurantSettings.findUnique({ where: { tenantKey } });
  if (existing) return existing;
  // Primera vez: los @default del schema rellenan todo.
  return prisma.restaurantSettings.create({ data: { tenantKey } });
}

/** Aplica y persiste un parche parcial de configuración (upsert). Valida y sanea. */
export async function updateSettings(
  patch: Record<string, unknown>,
  tenantKey = DEFAULT_TENANT
): Promise<RestaurantSettings> {
  const data: Prisma.RestaurantSettingsUpdateInput = {};

  for (const key of EDITABLE_FIELDS) {
    if (!(key in patch)) continue;
    let value = patch[key];

    if (key === 'socialLinks') {
      // JSON libre; null limpia el campo.
      (data as Record<string, unknown>)[key] =
        value == null ? Prisma.JsonNull : (value as Prisma.InputJsonValue);
      continue;
    }

    if (typeof value === 'string') value = value.trim();

    // Los colores deben ser hex válidos; si no, se ignoran silenciosamente.
    if (HEX_FIELDS.includes(key)) {
      if (typeof value !== 'string' || !HEX_RE.test(value)) continue;
    }

    (data as Record<string, unknown>)[key] = value === '' ? null : value;
  }

  // upsert garantiza que exista aunque sea la primera escritura.
  return prisma.restaurantSettings.upsert({
    where: { tenantKey },
    update: data,
    create: { tenantKey, ...(data as Prisma.RestaurantSettingsCreateInput) },
  });
}

/** Restaura los valores de fábrica: borra la fila y la recrea con @default. */
export async function resetSettings(tenantKey = DEFAULT_TENANT): Promise<RestaurantSettings> {
  await prisma.restaurantSettings.deleteMany({ where: { tenantKey } });
  return prisma.restaurantSettings.create({ data: { tenantKey } });
}
