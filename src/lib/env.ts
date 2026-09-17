function str(key: string, fallback?: string): string {
  const value = process.env[key] ?? fallback
  if (value === undefined) throw new Error(`Missing required env var: ${key}`)
  return value
}

function num(key: string, fallback?: number): number {
  const raw = process.env[key]
  if (raw === undefined || raw === '') {
    if (fallback === undefined) throw new Error(`Missing required env var: ${key}`)
    return fallback
  }
  const parsed = Number(raw)
  if (Number.isNaN(parsed)) throw new Error(`Env var ${key} must be numeric, got: ${raw}`)
  return parsed
}

function requireSecret(key: string): string {
  const value = process.env[key]
  if (!value || value.length < 32) {
    throw new Error(
      `${key} debe estar definido y tener al menos 32 caracteres. ` +
        `Generar con: node -e "console.log(require('crypto').randomBytes(48).toString('base64url'))"`,
    )
  }
  return value
}

function bool(key: string, fallback: boolean): boolean {
  const raw = process.env[key]
  if (raw === undefined || raw === '') return fallback
  return raw === 'true' || raw === '1'
}

export const env = {
  app: {
    name: str('APP_NAME', 'MOVIA'),
    url: str('APP_URL', 'http://localhost:3000'),
    port: num('APP_PORT', 3000),
    nodeEnv: str('NODE_ENV', 'development'),
    isProd: str('NODE_ENV', 'development') === 'production',
  },
  auth: {
    // Getter a proposito: este modulo tambien se importa desde componentes de
    // cliente, donde la variable no existe. Evaluarla al cargar rompia la
    // pagina entera. Asi solo se valida cuando el servidor la usa de verdad.
    get jwtSecret() {
      return requireSecret('JWT_SECRET')
    },
    jwtExpiresIn: str('JWT_EXPIRES_IN', '7d'),
    bcryptRounds: num('BCRYPT_ROUNDS', 10),
    cookieName: str('SESSION_COOKIE_NAME', 'movia_session'),
    cookieMaxAge: num('SESSION_COOKIE_MAX_AGE', 604800),
  },
  locale: {
    countryCode: str('DEFAULT_COUNTRY_CODE', 'CO'),
    countryName: str('DEFAULT_COUNTRY_NAME', 'Colombia'),
    currency: str('DEFAULT_CURRENCY', 'COP'),
    currencySymbol: str('DEFAULT_CURRENCY_SYMBOL', '$'),
    locale: str('DEFAULT_LOCALE', 'es-CO'),
    timezone: str('DEFAULT_TIMEZONE', 'America/Bogota'),
    phonePrefix: str('DEFAULT_PHONE_PREFIX', '+57'),
  },
  tax: {
    rate: num('TAX_RATE', 0.19),
    label: str('TAX_LABEL', 'IVA'),
    includedInPrice: bool('TAX_INCLUDED_IN_PRICE', true),
  },
  publication: {
    durationShortDays: num('PUBLICATION_DURATION_SHORT_DAYS', 15),
    durationLongDays: num('PUBLICATION_DURATION_LONG_DAYS', 30),
    expiryWarningDays: num('PUBLICATION_EXPIRY_WARNING_DAYS', 3),
    maxPhotos: num('PUBLICATION_MAX_PHOTOS', 12),
    minCompleteness: num('PUBLICATION_MIN_COMPLETENESS', 60),
  },
  bulk: {
    maxRows: num('BULK_UPLOAD_MAX_ROWS', 500),
    maxFileMb: num('BULK_UPLOAD_MAX_FILE_MB', 10),
  },
  search: {
    pageSize: num('SEARCH_PAGE_SIZE', 12),
    maxPageSize: num('SEARCH_MAX_PAGE_SIZE', 48),
    listPageSize: num('LIST_PAGE_SIZE', 10),
    companyPageSize: num('COMPANY_PAGE_SIZE', 9),
  },
  payment: {
    gateway: str('PAYMENT_GATEWAY', 'wompi'),
    publicKey: str('PAYMENT_PUBLIC_KEY', ''),
    privateKey: str('PAYMENT_PRIVATE_KEY', ''),
    webhookSecret: str('PAYMENT_WEBHOOK_SECRET', ''),
    currency: str('PAYMENT_CURRENCY', 'COP'),
    sandbox: bool('PAYMENT_SANDBOX', true),
  },
  whatsapp: {
    enabled: bool('WHATSAPP_ENABLED', true),
    apiUrl: str('WHATSAPP_API_URL', 'https://wa.me'),
    defaultMessage: str('WHATSAPP_DEFAULT_MESSAGE', 'Hola, estoy interesado en tu publicacion'),
  },
  verification: {
    ruesApiUrl: str('RUES_API_URL', ''),
    ruesApiKey: str('RUES_API_KEY', ''),
    autoApprove: bool('VERIFICATION_AUTO_APPROVE', false),
  },
  invoice: {
    provider: str('INVOICE_PROVIDER', 'alegra'),
    apiUrl: str('INVOICE_API_URL', ''),
    apiKey: str('INVOICE_API_KEY', ''),
  },
  storage: {
    driver: str('STORAGE_DRIVER', 'local'),
    localPath: str('STORAGE_LOCAL_PATH', './public/uploads'),
    publicUrl: str('STORAGE_PUBLIC_URL', '/uploads'),
    maxImageMb: num('STORAGE_MAX_IMAGE_MB', 12),
    maxImageWidth: num('STORAGE_MAX_IMAGE_WIDTH', 1920),
    thumbWidth: num('STORAGE_THUMB_WIDTH', 400),
    minImageWidth: num('STORAGE_MIN_IMAGE_WIDTH', 400),
  },
  pwa: {
    enabled: bool('PWA_ENABLED', true),
  },
  ui: {
    brandName: str('UI_BRAND_NAME', 'MOVIA'),
    brandClaim: str('UI_BRAND_CLAIM', ''),
    animationEnabled: bool('UI_ANIMATION_ENABLED', true),
    durationFast: num('UI_ANIMATION_DURATION_FAST', 0.15),
    durationBase: num('UI_ANIMATION_DURATION_BASE', 0.25),
    durationSlow: num('UI_ANIMATION_DURATION_SLOW', 0.4),
    stagger: num('UI_ANIMATION_STAGGER', 0.05),
  },
  seed: {
    adminEmail: str('SEED_ADMIN_EMAIL', 'admin@movia.co'),
    adminPassword: str('SEED_ADMIN_PASSWORD', 'Movia2026'),
    demoPassword: str('SEED_DEMO_PASSWORD', 'Demo2026'),
    publicationCount: num('SEED_PUBLICATION_COUNT', 24),
  },
}

export type Env = typeof env
