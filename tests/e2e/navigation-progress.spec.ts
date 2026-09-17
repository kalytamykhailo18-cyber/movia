import { test, expect } from '@playwright/test'

test.describe('Indicador de carga de pagina', () => {
  test('no se ve mientras no hay navegacion', async ({ page }) => {
    await page.goto('/')
    await expect(page.getByTestId('navigation-progress')).toHaveCount(0)
  })

  test('aparece en el borde del encabezado al navegar', async ({ page }) => {
    await page.goto('/')
    await page.getByTestId('site-footer').scrollIntoViewIfNeeded()

    // Se demora la respuesta para alcanzar a ver la barra.
    await page.route('**/buscar**', async (route) => {
      await new Promise((resolve) => setTimeout(resolve, 1500))
      await route.continue()
    })

    await page.getByTestId('site-footer').getByRole('link', { name: 'Buscar activos' }).click()

    const bar = page.getByTestId('navigation-progress')
    await expect(bar).toBeVisible()

    const posicion = await page.evaluate(() => {
      const header = document.querySelector('header')!.getBoundingClientRect()
      const barra = document.querySelector('[data-testid="navigation-progress"]')!.getBoundingClientRect()
      return {
        distanciaAlBorde: Math.round(header.bottom - barra.bottom),
        anchoIgualAlEncabezado: Math.abs(barra.width - header.width) <= 1,
      }
    })

    expect(posicion.distanciaAlBorde).toBeLessThanOrEqual(2)
    expect(posicion.anchoIgualAlEncabezado).toBe(true)
  })

  test('el avance sube mientras carga', async ({ page }) => {
    await page.goto('/')
    await page.getByTestId('site-footer').scrollIntoViewIfNeeded()

    await page.route('**/categorias**', async (route) => {
      await new Promise((resolve) => setTimeout(resolve, 2000))
      await route.continue()
    })

    await page.getByTestId('site-footer').getByRole('link', { name: 'Categorias' }).click()

    const bar = page.getByTestId('navigation-progress')
    await expect(bar).toBeVisible()

    const primero = Number(await bar.getAttribute('data-value'))
    await expect.poll(async () => Number(await bar.getAttribute('data-value')), { timeout: 3000 })
      .toBeGreaterThan(primero)
  })

  test('desaparece al terminar la navegacion', async ({ page }) => {
    await page.goto('/')
    await page.getByTestId('site-footer').scrollIntoViewIfNeeded()
    await page.getByTestId('site-footer').getByRole('link', { name: 'Buscar activos' }).click()
    await expect(page).toHaveURL(/\/buscar/)
    await expect(page.getByTestId('navigation-progress')).toHaveCount(0, { timeout: 5000 })
  })

  test('expone su avance a lectores de pantalla', async ({ page }) => {
    await page.goto('/')
    await page.getByTestId('site-footer').scrollIntoViewIfNeeded()

    await page.route('**/planes**', async (route) => {
      await new Promise((resolve) => setTimeout(resolve, 1500))
      await route.continue()
    })

    await page.getByTestId('site-footer').getByRole('link', { name: 'Buscar activos' }).click()

    const bar = page.getByRole('progressbar', { name: /cargando pagina/i })
    await expect(bar).toBeVisible()
    await expect(bar).toHaveAttribute('aria-valuemax', '100')
  })
})
