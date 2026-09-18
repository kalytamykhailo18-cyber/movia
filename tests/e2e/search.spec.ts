import { test, expect } from '@playwright/test'

test.describe('Busqueda', () => {
  test('lista resultados y muestra el conteo total', async ({ page }) => {
    await page.goto('/buscar')
    await expect(page.getByTestId('results-grid')).toBeVisible()
    await expect(page.getByTestId('result-count')).toContainText(/publicaciones encontradas/i)
    const cards = page.getByTestId('publication-card')
    expect(await cards.count()).toBeGreaterThan(0)
  })

  test('busca por termino tecnico y devuelve coincidencias', async ({ page }) => {
    await page.goto('/buscar?q=torno')
    await expect(page.getByRole('heading', { name: /resultados para "torno"/i })).toBeVisible()
    const first = page.getByTestId('publication-card').first()
    await expect(first).toContainText(/torno/i)
  })

  test('busca por marca dentro de la ficha tecnica', async ({ page }) => {
    await page.goto('/buscar?q=Caterpillar')
    const cards = page.getByTestId('publication-card')
    expect(await cards.count()).toBeGreaterThan(0)
  })

  test('filtra por categoria y reduce los resultados', async ({ page }) => {
    await page.goto('/buscar')
    const totalText = await page.getByTestId('result-count').innerText()
    const total = Number(totalText.match(/\d+/)![0])

    await page.goto('/buscar?category=vehiculos')
    await expect(page).toHaveURL(/category=vehiculos/)
    const filteredText = await page.getByTestId('result-count').innerText()
    const filtered = Number(filteredText.match(/\d+/)![0])

    expect(filtered).toBeGreaterThan(0)
    expect(filtered).toBeLessThan(total)
  })

  test('filtra por ciudad', async ({ page }) => {
    await page.goto(`/buscar?city=${encodeURIComponent('Medellín')}`)
    const cards = page.getByTestId('publication-card')
    expect(await cards.count()).toBeGreaterThan(0)
    await expect(cards.first()).toContainText('Medellín')
  })

  test('filtra por rango de precio', async ({ page }) => {
    await page.goto('/buscar?maxPrice=30000000')
    const prices = await page.getByTestId('card-price').allInnerTexts()
    expect(prices.length).toBeGreaterThan(0)
    for (const label of prices) {
      const value = Number(label.replace(/\D/g, ''))
      expect(value).toBeLessThanOrEqual(30000000)
    }
  })

  test('ordena por menor precio', async ({ page }) => {
    await page.goto('/buscar?sort=price_asc')
    const prices = (await page.getByTestId('card-price').allInnerTexts()).map((t) =>
      Number(t.replace(/\D/g, '')),
    )
    const sorted = [...prices].sort((a, b) => a - b)
    expect(prices).toEqual(sorted)
  })

  test('ordena por mayor precio', async ({ page }) => {
    await page.goto('/buscar?sort=price_desc')
    const prices = (await page.getByTestId('card-price').allInnerTexts()).map((t) =>
      Number(t.replace(/\D/g, '')),
    )
    const sorted = [...prices].sort((a, b) => b - a)
    expect(prices).toEqual(sorted)
  })

  test('muestra estado vacio cuando no hay coincidencias', async ({ page }) => {
    await page.goto('/buscar?q=zzzzinexistentezzzz')
    await expect(page.getByTestId('empty-state')).toBeVisible()
    await expect(page.getByTestId('empty-state')).toContainText(/no encontramos activos/i)
  })

  test('el estado vacio permite limpiar la busqueda', async ({ page }) => {
    await page.goto('/buscar?q=zzzzinexistentezzzz')
    await page.getByRole('button', { name: /limpiar busqueda/i }).click()
    await expect(page).toHaveURL(/\/buscar$/)
    await expect(page.getByTestId('results-grid')).toBeVisible()
  })

  test('pagina los resultados', async ({ page }) => {
    await page.goto('/buscar')

    await expect(page.getByTestId('pagination-top-page-1')).toHaveAttribute('aria-current', 'page')

    await page.getByTestId('pagination-top-next').click()
    await expect(page).toHaveURL(/page=2/)
    await expect(page.getByTestId('pagination-top-page-2')).toHaveAttribute('aria-current', 'page')
  })

  test('combina termino y filtro de categoria', async ({ page }) => {
    await page.goto('/buscar?q=Dell&category=tecnologia')
    const cards = page.getByTestId('publication-card')
    expect(await cards.count()).toBeGreaterThan(0)
    await expect(cards.first()).toContainText(/Dell/i)
  })
})

test.describe('Filtros en escritorio @desktop', () => {
  test('el panel de filtros esta visible', async ({ page }) => {
    await page.goto('/buscar')
    await expect(page.getByTestId('search-filters')).toBeVisible()
  })

  test('seleccionar una categoria actualiza la url y los resultados', async ({ page }) => {
    await page.goto('/buscar')
    await page.getByTestId('search-filters').getByTestId('filter-category-construccion').click()
    await expect(page).toHaveURL(/category=construccion/)
    await expect(page.getByTestId('publication-card').first()).toBeVisible()
  })

  test('limpiar filtros restablece la busqueda', async ({ page }) => {
    await page.goto(`/buscar?category=vehiculos&city=${encodeURIComponent('Medellín')}`)
    await page.getByTestId('clear-filters').click()
    await expect(page).toHaveURL(/\/buscar$/)
  })
})

test.describe('Filtros en movil @mobile', () => {
  test('abre el panel lateral de filtros', async ({ page }) => {
    await page.goto('/buscar')
    await page.getByTestId('open-filters').click()

    const drawer = page.getByTestId('filters-drawer')
    await expect(drawer).toBeVisible()
    await expect(drawer.getByTestId('filter-category-vehiculos')).toBeVisible()
  })

  test('aplica un filtro desde el panel lateral', async ({ page }) => {
    await page.goto('/buscar')
    await page.getByTestId('open-filters').click()

    const drawer = page.getByTestId('filters-drawer')
    await drawer.getByTestId('filter-category-vehiculos').click()
    await expect(page).toHaveURL(/category=vehiculos/)
    await expect(page.getByTestId('publication-card').first()).toBeVisible()
  })
})
