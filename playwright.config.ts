import 'dotenv/config'
import { defineConfig, devices } from '@playwright/test'

const PORT = process.env.APP_PORT ?? '3100'
const BASE_URL = process.env.APP_URL ?? `http://localhost:${PORT}`

export default defineConfig({
  testDir: './tests/e2e',
  fullyParallel: false,
  forbidOnly: process.env.CI === 'true',
  retries: process.env.CI === 'true' ? 1 : 0,
  workers: 1,
  reporter: [['list'], ['html', { open: 'never' }]],
  timeout: 60000,
  expect: { timeout: 10000 },

  use: {
    baseURL: BASE_URL,
    trace: 'retain-on-failure',
    screenshot: 'only-on-failure',
    locale: process.env.DEFAULT_LOCALE ?? 'es-CO',
    timezoneId: process.env.DEFAULT_TIMEZONE ?? 'America/Bogota',
  },

  projects: [
    {
      name: 'desktop',
      grepInvert: /@mobile/,
      use: { ...devices['Desktop Chrome'], viewport: { width: 1440, height: 900 } },
    },
    {
      // Ancho y tactil de un telefono real. La emulacion isMobile de Chromium
      // escala las coordenadas del hit-test y hace imposible pulsar controles
      // superpuestos, asi que se deja fuera: los breakpoints dependen del ancho.
      name: 'mobile',
      grepInvert: /@desktop/,
      use: {
        ...devices['Desktop Chrome'],
        viewport: { width: 412, height: 915 },
        hasTouch: true,
        isMobile: false,
        deviceScaleFactor: 2,
      },
    },
  ],

  // E2E_TARGET=prod compila y sirve como en produccion, sin la latencia de
  // compilacion bajo demanda del servidor de desarrollo.
  webServer: {
    command:
      process.env.E2E_TARGET === 'prod'
        ? 'npm run build && node scripts/next.mjs start'
        : 'node scripts/next.mjs dev',
    url: BASE_URL,
    reuseExistingServer: process.env.E2E_TARGET !== 'prod',
    timeout: 300000,
  },
})
