import { test, expect, type Page } from '@playwright/test'

const ADMIN = { email: 'admin@movia.co', password: 'Movia2026' }

async function loginAsAdmin(page: Page) {
  await page.goto('/ingresar')
  await page.getByTestId('login-email').fill(ADMIN.email)
  await page.getByTestId('login-password').fill(ADMIN.password)
  await page.getByTestId('login-submit').click()
  await expect(page).toHaveURL(/\/admin/)
}

// Framer deja opacity y transform en linea cuando controla un elemento.
// Un bloque sin animar no tiene ese rastro.
async function isAnimated(page: Page, selector: string) {
  return page.evaluate((sel) => {
    const anchor = document.querySelector(sel)
    if (!anchor) return { found: false, animated: false, style: null }
    const el = anchor.closest('[style]')
    const style = el?.getAttribute('style') ?? null
    return {
      found: true,
      animated: Boolean(style && style.includes('opacity')),
      style,
    }
  }, selector)
}

const PUBLIC_PAGES = [
  { path: '/', anchor: 'h1' },
  { path: '/buscar', anchor: '[data-testid="results-grid"]' },
  { path: '/categorias', anchor: '[data-testid="category-grid"]' },
  { path: '/planes', anchor: '[data-testid="plan-card"]' },
  { path: '/empresas', anchor: '[data-testid="company-card"]' },
  { path: '/registro', anchor: 'h1' },
  { path: '/ingresar', anchor: 'h1' },
]

test.describe('Movimiento en paginas publicas', () => {
  for (const page_ of PUBLIC_PAGES) {
    test(`${page_.path} entra con animacion`, async ({ page }) => {
      await page.goto(page_.path)
      await page.waitForTimeout(900)

      const result = await isAnimated(page, page_.anchor)
      expect(result.found, `${page_.path} deberia tener ${page_.anchor}`).toBe(true)
      expect(result.animated, `${page_.path} sin animacion: ${result.style}`).toBe(true)
    })
  }
})

const ADMIN_PAGES = [
  { path: '/admin', anchor: 'h1' },
  { path: '/admin/planes', anchor: '[data-testid="plan-row"]' },
  { path: '/admin/verificaciones', anchor: 'h1' },
  { path: '/admin/usuarios', anchor: '[data-testid="user-row"]' },
]

test.describe('Movimiento en administracion', () => {
  test.beforeEach(async ({ page }) => {
    await loginAsAdmin(page)
  })

  for (const page_ of ADMIN_PAGES) {
    test(`${page_.path} entra con animacion`, async ({ page }) => {
      await page.goto(page_.path)
      await page.waitForTimeout(900)

      const result = await isAnimated(page, page_.anchor)
      expect(result.found, `${page_.path} deberia tener ${page_.anchor}`).toBe(true)
      expect(result.animated, `${page_.path} sin animacion: ${result.style}`).toBe(true)
    })
  }

  test('la seccion activa se desplaza entre pestanas @desktop', async ({ page }) => {
    await page.goto('/admin')
    await page.getByTestId('admin-nav-planes').click()

    const indicator = page.locator('nav[aria-label="Administracion"] span.pointer-events-none')
    await expect(indicator).toHaveCount(1)
  })

  test('las filas de planes llegan opacas al final', async ({ page }) => {
    await page.goto('/admin/planes')
    await page.waitForTimeout(1200)

    const opacities = await page
      .getByTestId('plan-row')
      .evaluateAll((els) => els.map((el) => getComputedStyle(el).opacity))

    expect(opacities.length).toBeGreaterThan(0)
    for (const value of opacities) expect(Number(value)).toBe(1)
  })
})

test.describe('Movimiento en el panel del vendedor', () => {
  test('el panel entra con animacion', async ({ page }) => {
    await page.goto('/ingresar')
    await page.getByTestId('login-email').fill('empresa1@movia.co')
    await page.getByTestId('login-password').fill('Demo2026')
    await page.getByTestId('login-submit').click()
    await expect(page).toHaveURL(/\/mi-empresa/)

    await page.waitForTimeout(900)
    const result = await isAnimated(page, '[data-testid="kpi-grid"]')
    expect(result.animated, `sin animacion: ${result.style}`).toBe(true)
  })
})

test.describe('Respeto por prefers-reduced-motion', () => {
  test('sin movimiento el contenido igual queda visible', async ({ browser, baseURL }) => {
    const ctx = await browser.newContext({ baseURL, reducedMotion: 'reduce' })
    const page = await ctx.newPage()

    await page.goto('/')
    await expect(page.getByRole('heading', { level: 1 })).toBeVisible()
    await expect(page.getByTestId('latest-grid').getByTestId('publication-card').first()).toBeVisible()

    const opacity = await page
      .getByTestId('latest-grid')
      .evaluate((el) => getComputedStyle(el).opacity)
    expect(Number(opacity)).toBe(1)

    await ctx.close()
  })
})
