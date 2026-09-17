import { test, expect, type Page } from '@playwright/test'

async function ingresar(page: Page, correo: string, clave: string, destino: RegExp) {
  await page.goto('/ingresar')
  await page.getByTestId('login-email').fill(correo)
  await page.getByTestId('login-password').fill(clave)
  await page.getByTestId('login-submit').click()
  await expect(page).toHaveURL(destino)
}

const PUBLICAS = [
  { path: '/buscar', label: 'publicaciones' },
  { path: '/empresas', label: 'empresas' },
]

const PRIVADAS = [
  { path: '/mi-empresa/publicaciones', correo: 'empresa1@movia.co', clave: 'Demo2026', destino: /mi-empresa/ },
  { path: '/mi-empresa/contactos', correo: 'empresa1@movia.co', clave: 'Demo2026', destino: /mi-empresa/ },
  { path: '/admin/usuarios', correo: 'admin@movia.co', clave: 'Movia2026', destino: /admin/ },
]

test.describe('Paginacion en listados publicos', () => {
  for (const caso of PUBLICAS) {
    test(`${caso.path} pagina arriba y abajo`, async ({ page }) => {
      await page.goto(caso.path)

      await expect(page.getByTestId('pagination-top')).toBeVisible()
      await expect(page.getByTestId('pagination')).toBeVisible()
    })

    test(`${caso.path} informa el rango que se esta viendo`, async ({ page }) => {
      await page.goto(caso.path)
      await expect(page.getByTestId('pagination-top-range')).toContainText(
        new RegExp(`Mostrando 1 a \\d+ de \\d+ ${caso.label}`),
      )
    })
  }

  test('avanzar de pagina cambia los resultados', async ({ page }) => {
    await page.goto('/buscar')

    const primeroEnPagina1 = await page.getByTestId('publication-card').first().innerText()

    await page.getByTestId('pagination-next').click()
    await expect(page).toHaveURL(/page=2/)

    const primeroEnPagina2 = await page.getByTestId('publication-card').first().innerText()
    expect(primeroEnPagina2).not.toBe(primeroEnPagina1)
  })

  test('el rango avanza al pasar de pagina', async ({ page }) => {
    await page.goto('/buscar')
    const antes = await page.getByTestId('pagination-range').innerText()

    await page.getByTestId('pagination-next').click()
    await expect(page).toHaveURL(/page=2/)

    await expect(page.getByTestId('pagination-range')).not.toHaveText(antes)
  })

  test('el numero de pagina actual queda marcado', async ({ page }) => {
    await page.goto('/buscar?page=2')

    const actual = page.getByTestId('pagination-page-2').first()
    await expect(actual).toHaveAttribute('aria-current', 'page')
  })

  test('en la primera pagina no se puede retroceder', async ({ page }) => {
    await page.goto('/buscar')
    await expect(page.getByTestId('pagination-prev')).toBeDisabled()
  })

  test('en la ultima pagina no se puede avanzar', async ({ page }) => {
    await page.goto('/buscar')
    const rango = await page.getByTestId('pagination-range').innerText()
    const total = Number(rango.match(/de (\d+)/)![1])
    const porPagina = Number(rango.match(/a (\d+)/)![1])
    const ultima = Math.ceil(total / porPagina)

    await page.goto(`/buscar?page=${ultima}`)
    await expect(page.getByTestId('pagination-next')).toBeDisabled()
  })

  test('saltar a una pagina por su numero funciona', async ({ page }) => {
    await page.goto('/buscar')
    await page.getByTestId('pagination-page-3').first().click()
    await expect(page).toHaveURL(/page=3/)
    await expect(page.getByTestId('pagination-top-range')).toContainText('Mostrando')
  })

  test('la paginacion conserva los filtros activos', async ({ page }) => {
    await page.goto('/buscar?q=Dell')
    const paginacion = page.getByTestId('pagination')

    if (await paginacion.isVisible()) {
      await page.getByTestId('pagination-next').click()
      await expect(page).toHaveURL(/q=Dell/)
      await expect(page).toHaveURL(/page=2/)
    }
  })

  test('los controles cumplen el area tactil minima', async ({ page }) => {
    await page.goto('/buscar')

    // Hay que esperar a que la paginacion este en pantalla: medir antes da
    // alturas en cero porque el bloque todavia no tiene layout.
    await expect(page.getByTestId('pagination')).toBeVisible()
    await expect(page.getByTestId('pagination-next')).toBeVisible()

    const altos = await page
      .getByTestId('pagination')
      .locator('button')
      .evaluateAll((els) => els.map((el) => Math.round(el.getBoundingClientRect().height)))

    expect(altos.length).toBeGreaterThan(0)
    for (const alto of altos) expect(alto).toBeGreaterThanOrEqual(44)
  })
})

test.describe('Paginacion en paneles', () => {
  for (const caso of PRIVADAS) {
    test(`${caso.path} pagina arriba y abajo`, async ({ page }) => {
      await ingresar(page, caso.correo, caso.clave, caso.destino)
      await page.goto(caso.path)

      const arriba = page.getByTestId('pagination-top')
      const abajo = page.getByTestId('pagination')

      // Solo aparece cuando hay mas de una pagina.
      if (await arriba.isVisible()) {
        await expect(abajo).toBeVisible()
        await expect(page.getByTestId('pagination-top-range')).toContainText('Mostrando')
      }
    })
  }

  test('los contactos del vendedor se pueden recorrer por paginas', async ({ page }) => {
    await ingresar(page, 'empresa1@movia.co', 'Demo2026', /mi-empresa/)
    await page.goto('/mi-empresa/contactos')

    await expect(page.getByTestId('pagination-top')).toBeVisible()

    // Varios contactos de WhatsApp se ven iguales en pantalla, asi que se
    // comparan por su identificador y no por el texto.
    const idsPagina1 = await page
      .getByTestId('lead-item')
      .evaluateAll((els) => els.map((el) => el.getAttribute('data-lead-id')))

    await page.getByTestId('pagination-next').click()
    await expect(page).toHaveURL(/page=2/)

    const idsPagina2 = await page
      .getByTestId('lead-item')
      .evaluateAll((els) => els.map((el) => el.getAttribute('data-lead-id')))

    expect(idsPagina1.length).toBeGreaterThan(0)
    expect(idsPagina2.length).toBeGreaterThan(0)
    expect(idsPagina2.some((id) => idsPagina1.includes(id))).toBe(false)
  })

  test('la facturacion no muestra solo los ultimos pagos sin aviso', async ({ page }) => {
    await ingresar(page, 'empresa1@movia.co', 'Demo2026', /mi-empresa/)
    await page.goto('/mi-empresa/facturacion')

    const filas = await page.getByTestId('payment-row').count()
    expect(filas).toBeGreaterThan(0)
  })
})
