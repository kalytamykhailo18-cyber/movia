import { test, expect } from '@playwright/test'
import { buscarEnListado } from './helpers'

test.describe('Integridad de la navegacion', () => {
  test('ningun enlace del encabezado o del pie lleva a una pagina inexistente', async ({
    page,
    request,
  }) => {
    await page.goto('/')

    const hrefs = await page.evaluate(() =>
      Array.from(document.querySelectorAll('header a[href], footer a[href]'))
        .map((a) => a.getAttribute('href'))
        .filter((href): href is string => Boolean(href && href.startsWith('/'))),
    )

    const unique = [...new Set(hrefs)]
    expect(unique.length).toBeGreaterThan(5)

    const broken: string[] = []
    for (const href of unique) {
      const res = await request.get(href)
      if (res.status() >= 400) broken.push(`${href} -> ${res.status()}`)
    }

    expect(broken).toEqual([])
  })

  test('el enlace al vendedor desde una ficha abre el perfil de la empresa', async ({ page }) => {
    await page.goto('/buscar')
    await page.getByTestId('publication-card').first().click()
    await expect(page).toHaveURL(/\/publicacion\//)

    const seller = await page.getByTestId('seller-name').innerText()
    await page.getByTestId('seller-name').click()

    await expect(page).toHaveURL(/\/empresa\//)
    await expect(page.getByRole('heading', { level: 1 })).toContainText(seller)
  })

  test('una publicacion inexistente devuelve 404', async ({ request }) => {
    const res = await request.get('/publicacion/no-existe-esta-publicacion')
    expect(res.status()).toBe(404)
  })

  test('una empresa inexistente devuelve 404', async ({ request }) => {
    const res = await request.get('/empresa/no-existe')
    expect(res.status()).toBe(404)
  })
})

test.describe('Categorias', () => {
  test('lista las categorias con sus campos tecnicos', async ({ page }) => {
    await page.goto('/categorias')
    await expect(page.getByRole('heading', { name: 'Categorias', level: 1 })).toBeVisible()
    await expect(page.getByTestId('category-item')).toHaveCount(8)

    const specs = page.getByTestId('category-specs')
    await expect(specs).toContainText('Maquinaria industrial')
    await expect(specs).toContainText('Potencia')
    await expect(specs).toContainText('Kilometraje')
  })

  test('una categoria lleva a la busqueda filtrada', async ({ page }) => {
    await page.goto('/categorias')
    await page.getByRole('link', { name: /vehiculos/i }).first().click()
    await expect(page).toHaveURL(/category=vehiculos/)
    await expect(page.getByTestId('publication-card').first()).toBeVisible()
  })
})

test.describe('Planes y precios', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/planes')
  })

  test('muestra las suscripciones y las publicaciones individuales', async ({ page }) => {
    await expect(page.getByTestId('plans-subscription').getByTestId('plan-card')).toHaveCount(2)
    await expect(page.getByTestId('plans-single').getByTestId('plan-card')).toHaveCount(2)
  })

  test('declara el impuesto incluido y desglosa la base', async ({ page }) => {
    await expect(page.getByText(/con IVA incluido/i).first()).toBeVisible()
    await expect(page.getByTestId('plan-tax').first()).toContainText(/Base .* \+ IVA/)
  })

  test('el desglose coincide con el precio mostrado', async ({ page }) => {
    const card = page.getByTestId('plan-card').first()
    const toNumber = (t: string) => Number(t.replace(/\D/g, ''))

    const total = toNumber(await card.getByTestId('plan-price').innerText())
    const taxLine = await card.getByTestId('plan-tax').innerText()
    const [base, tax] = taxLine.match(/[\d.]+/g)!.slice(0, 2).map((n) => Number(n.replace(/\D/g, '')))

    expect(Math.abs(base + tax - total)).toBeLessThanOrEqual(2)
  })

  test('informa los medios de pago colombianos', async ({ page }) => {
    await expect(page.getByText(/PSE desde tu banco/i)).toBeVisible()
    await expect(page.getByText(/Tarjeta debito y credito/i)).toBeVisible()
    await expect(page.getByText(/Factura electronica por cada pago/i)).toBeVisible()
  })
})

test.describe('Perfil publico de empresa', () => {
  test('muestra identidad, verificacion y publicaciones activas', async ({ page }) => {
    // Se entra por el vendedor de una publicacion: asi la empresa tiene
    // inventario seguro, a diferencia de la primera del directorio.
    await page.goto('/buscar')
    await page.getByTestId('publication-card').first().click()
    await expect(page).toHaveURL(/\/publicacion\//)
    await page.getByTestId('seller-name').click()

    await expect(page).toHaveURL(/\/empresa\//)
    await expect(page.getByTestId('company-header')).toBeVisible()
    await expect(page.getByText('Empresa verificada').first()).toBeVisible()
    await expect(page.getByTestId('company-publications')).toBeVisible()
  })

  test('expone structured data de organizacion', async ({ page }) => {
    await page.goto('/empresas')
    await page.getByTestId('company-card').first().click()

    const raw = await page.locator('script[type="application/ld+json"]').innerText()
    const data = JSON.parse(raw)
    expect(data['@type']).toBe('Organization')
    expect(data.name).toBeTruthy()
  })

  test('el listado distingue empresas verificadas de pendientes', async ({ page }) => {
    // El listado esta paginado, asi que cada estado puede caer en otra pagina.
    const hayVerificada = await buscarEnListado(page, '/empresas', (p) =>
      p.getByTestId('company-card').filter({ hasText: 'Empresa verificada' }),
    )
    expect(hayVerificada, 'deberia existir al menos una empresa verificada').toBe(true)

    const hayPendiente = await buscarEnListado(page, '/empresas', (p) =>
      p.getByTestId('company-card').filter({ hasText: 'Verificacion pendiente' }),
    )
    expect(hayPendiente, 'deberia existir al menos una empresa pendiente').toBe(true)
  })
})

test.describe('Secciones que requieren cuenta', () => {
  test('favoritos explica que se habilita con la cuenta', async ({ page }) => {
    await page.goto('/favoritos')
    await expect(page.getByTestId('favorites-requires-account')).toBeVisible()
    await expect(page.getByTestId('favorites-requires-account')).toContainText(/cuenta/i)
  })

  test('mensajes remite a los contactos ya registrados', async ({ page }) => {
    await page.goto('/mensajes')
    await expect(page.getByTestId('messages-requires-account')).toContainText(/Contactos recibidos/i)
  })
})
