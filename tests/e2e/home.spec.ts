import { test, expect } from '@playwright/test'

test.describe('Inicio', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/')
  })

  test('muestra el logo oficial de MOVIA', async ({ page }) => {
    const logo = page.locator('header img[alt="MOVIA"]').first()
    await expect(logo).toBeVisible()
    await expect(logo).toHaveAttribute('src', '/brand/logo-web.png')

    // El logo conserva la proporcion del archivo maestro (3000x2088).
    const box = await logo.boundingBox()
    expect(box!.width / box!.height).toBeCloseTo(3000 / 2088, 1)
  })

  test('muestra el buscador principal con el copy del manual', async ({ page }) => {
    await expect(page.getByRole('heading', { name: /que activo estas buscando/i })).toBeVisible()
    await expect(page.getByTestId('hero-search-input')).toBeVisible()
  })

  test('lista las ocho categorias del manual', async ({ page }) => {
    const items = page.getByTestId('category-item')
    await expect(items).toHaveCount(8)
    await expect(page.getByRole('link', { name: /maquinaria industrial/i })).toBeVisible()
  })

  test('muestra activos destacados y ultimas publicaciones', async ({ page }) => {
    await expect(page.getByTestId('featured-grid').getByTestId('publication-card')).toHaveCount(4)
    const latest = page.getByTestId('latest-grid').getByTestId('publication-card')
    await expect(latest).toHaveCount(8)
    await expect(latest.first().getByTestId('card-price')).toContainText('$')
  })

  test('marca visualmente las publicaciones destacadas', async ({ page }) => {
    const badges = page.getByTestId('featured-grid').getByTestId('featured-badge')
    await expect(badges.first()).toBeVisible()
    await expect(badges.first()).toHaveText(/destacado/i)
  })

  test('muestra empresas verificadas', async ({ page }) => {
    const cards = page.getByTestId('companies-grid').locator('a')
    await expect(cards.first()).toBeVisible()
    await expect(cards.first()).toContainText(/publicaciones activas/i)
  })

  test('el boton publicar es accesible y cumple area tactil minima', async ({ page }) => {
    const publish = page.getByTestId('nav-publish')
    await expect(publish).toBeVisible()
    const box = await publish.boundingBox()
    expect(box!.height).toBeGreaterThanOrEqual(44)
  })

  test('buscar desde el hero navega a resultados con el termino', async ({ page }) => {
    await page.getByTestId('hero-search-input').fill('torno')
    await page.getByTestId('hero-search-submit').click()
    await expect(page).toHaveURL(/\/buscar\?q=torno/)
  })

  test('un chip de sugerencia dispara la busqueda', async ({ page }) => {
    await page.getByRole('button', { name: 'Montacargas' }).click()
    await expect(page).toHaveURL(/\/buscar\?q=Montacargas/)
  })

  test('la tarjeta navega al detalle de la publicacion', async ({ page }) => {
    const card = page.getByTestId('latest-grid').getByTestId('publication-card').first()
    const title = await card.locator('h3').innerText()
    await card.click()
    await expect(page).toHaveURL(/\/publicacion\//)
    await expect(page.getByRole('heading', { level: 1 })).toContainText(title)
  })

  test('no usa naranja como color de identidad', async ({ page }) => {
    const offenders = await page.evaluate(() => {
      const ORANGE = /rgb\((2[0-5][0-9]|19[0-9]),\s*(1[0-4][0-9]|[6-9][0-9]),\s*([0-5]?[0-9])\)/
      const found: string[] = []
      for (const el of Array.from(document.querySelectorAll('body *'))) {
        const s = getComputedStyle(el)
        for (const prop of ['color', 'backgroundColor', 'borderTopColor'] as const) {
          const value = s[prop]
          if (ORANGE.test(value)) found.push(`${el.tagName}:${prop}:${value}`)
        }
      }
      return found
    })
    expect(offenders).toEqual([])
  })
})

test.describe('Inicio en movil @mobile', () => {
  test('abre el menu lateral', async ({ page }) => {
    await page.goto('/')
    await page.getByRole('button', { name: /abrir menu/i }).click()
    await expect(page.getByTestId('mobile-menu')).toBeVisible()
    await expect(page.getByTestId('mobile-menu').getByRole('link', { name: 'Mi Empresa' })).toBeVisible()
  })

  test('no genera scroll horizontal', async ({ page }) => {
    await page.goto('/')
    const overflow = await page.evaluate(
      () => document.documentElement.scrollWidth > document.documentElement.clientWidth + 1,
    )
    expect(overflow).toBe(false)
  })
})
