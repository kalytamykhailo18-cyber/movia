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
    { name: 'desktop', use: { ...devices['Desktop Chrome'], viewport: { width: 1440, height: 900 } } },
    { name: 'mobile', use: { ...devices['Pixel 7'] } },
  ],

  webServer: {
    command: 'node scripts/next.mjs dev',
    url: BASE_URL,
    reuseExistingServer: true,
    timeout: 120000,
  },
})
