-- Definición equivalente de la tabla de personalización (referencia manual).
-- En este proyecto se recomienda usar `npx prisma db push` en su lugar.

CREATE TABLE IF NOT EXISTS "restaurant_settings" (
  "id"                 SERIAL PRIMARY KEY,
  "tenantKey"          VARCHAR(60)  NOT NULL DEFAULT 'default',

  -- Marca
  "restaurantName"     VARCHAR(120) NOT NULL DEFAULT 'Mi Restaurante',
  "appName"            VARCHAR(60)  NOT NULL DEFAULT 'Quiosco',
  "slogan"             VARCHAR(200),
  "logoUrl"            VARCHAR(500),
  "darkLogoUrl"        VARCHAR(500),
  "faviconUrl"         VARCHAR(500),
  "loginBackgroundUrl" VARCHAR(500),

  -- Colores (hex)
  "primaryColor"       VARCHAR(9)   NOT NULL DEFAULT '#d4a017',
  "secondaryColor"     VARCHAR(9)   NOT NULL DEFAULT '#1f2937',
  "accentColor"        VARCHAR(9)   NOT NULL DEFAULT '#0ea5e9',
  "successColor"       VARCHAR(9)   NOT NULL DEFAULT '#16a34a',
  "warningColor"       VARCHAR(9)   NOT NULL DEFAULT '#f59e0b',
  "dangerColor"        VARCHAR(9)   NOT NULL DEFAULT '#dc2626',
  "backgroundColor"    VARCHAR(9)   NOT NULL DEFAULT '#f7f5f1',
  "textColor"          VARCHAR(9)   NOT NULL DEFAULT '#1f2937',

  -- Apariencia
  "fontFamily"         VARCHAR(80)  NOT NULL DEFAULT 'Inter',
  "fontSize"           VARCHAR(10)  NOT NULL DEFAULT 'md',
  "themeMode"          VARCHAR(10)  NOT NULL DEFAULT 'light',

  -- Empresa
  "ruc"                VARCHAR(20),
  "address"            VARCHAR(300),
  "phone"              VARCHAR(40),
  "email"              VARCHAR(150),
  "website"            VARCHAR(200),
  "currency"           VARCHAR(10)  NOT NULL DEFAULT 'PEN',
  "timezone"           VARCHAR(60)  NOT NULL DEFAULT 'America/Lima',
  "socialLinks"        JSONB,

  "createdAt"          TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt"          TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE UNIQUE INDEX IF NOT EXISTS "restaurant_settings_tenantKey_key"
  ON "restaurant_settings" ("tenantKey");

-- Fila por defecto (opcional: la API la crea sola en el primer GET).
INSERT INTO "restaurant_settings" ("tenantKey")
VALUES ('default')
ON CONFLICT ("tenantKey") DO NOTHING;
