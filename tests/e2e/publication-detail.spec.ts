import { test, expect, type Page } from '@playwright/test'

async function openFirstPublication(page: Page) {
  await page.goto('/buscar')
  await page.getByTestId('publication-card').first().click()
  await expect(page).toHaveURL(/\/publicacion\//)
}

test.describe('Ficha de publicacion', () => {
  test.beforeEach(async ({ page }) => {
    await openFirstPublication(page)
  })

  test('muestra titulo, precio e impuesto incluido', async ({ page }) => {
    await expect(page.getByRole('heading', { level: 1 })).toBeVisible()
    await expect(page.getByTestId('detail-price')).toContainText('$')
    // Se apunta a la linea de impuesto de la ficha, no a cualquier "IVA
    // incluido" de la pagina. Cada precio del catalogo declara ahora si lleva
    // impuesto, que en un marketplace B2B colombiano es lo que permite
    // comparar dos publicaciones, y el cajetin lo repite al pie. El texto
    // suelto aparecia en seis sitios y el localizador no sabia a cual ir.
    await expect(page.getByTestId('detail-tax')).toContainText(/IVA incluido/i)
  })

  test('muestra la galeria con contador de imagenes', async ({ page }) => {
    await expect(page.getByTestId('gallery')).toBeVisible()
    await expect(page.getByTestId('gallery-counter')).toHaveText(/^1 \/ \d+$/)
  })

  test('navega la galeria por miniaturas', async ({ page }) => {
    const counter = page.getByTestId('gallery-counter')
    await expect(counter).toHaveText(/^1 \//)

    await page.getByRole('button', { name: 'Ver imagen 3' }).click()
    await expect(counter).toHaveText(/^3 \//)

    await page.getByRole('button', { name: 'Ver imagen 1' }).click()
    await expect(counter).toHaveText(/^1 \//)
  })

  test('navega la galeria con el teclado', async ({ page }) => {
    await page.keyboard.press('ArrowRight')
    await expect(page.getByTestId('gallery-counter')).toHaveText(/^2 \//)
    await page.keyboard.press('ArrowLeft')
    await expect(page.getByTestId('gallery-counter')).toHaveText(/^1 \//)
  })

  test('muestra identidad del vendedor y verificacion', async ({ page }) => {
    await expect(page.getByTestId('seller-name')).toBeVisible()
    await expect(page.getByText(/Empresa verificada|Verificacion pendiente|No verificada/)).toBeVisible()
  })

  test('muestra la ficha tecnica con unidades', async ({ page }) => {
    await expect(page.getByTestId('specs-section')).toBeVisible()
    await expect(page.getByTestId('specs-section')).toContainText(/Marca/)
  })

  test('ofrece los tres canales de contacto', async ({ page }) => {
    await expect(page.getByTestId('contact-whatsapp')).toBeVisible()
    await expect(page.getByTestId('contact-message')).toBeVisible()
    await expect(page.getByTestId('contact-email')).toBeVisible()
  })

  test('muestra activos similares', async ({ page }) => {
    await expect(page.getByTestId('similar-grid')).toBeVisible()
    expect(await page.getByTestId('similar-grid').getByTestId('publication-card').count()).toBeGreaterThan(0)
  })

  test('expone structured data de producto para SEO', async ({ page }) => {
    const raw = await page.locator('script[type="application/ld+json"]').innerText()
    const data = JSON.parse(raw)
    expect(data['@type']).toBe('Product')
    expect(data.offers.priceCurrency).toBe('COP')
    expect(typeof data.offers.price).toBe('number')
  })

  test('registra una visualizacion al abrir la ficha', async ({ page }) => {
    const response = page.waitForResponse(
      (r) => r.url().includes('/api/events') && r.request().method() === 'POST',
    )
    await page.reload()
    const res = await response
    expect(res.status()).toBe(200)
  })
})

test.describe('Controles superpuestos de la galeria', () => {
  test.beforeEach(async ({ page }) => {
    await openFirstPublication(page)
  })

  test('avanza y retrocede con las flechas', async ({ page }) => {
    const counter = page.getByTestId('gallery-counter')
    await page.getByTestId('gallery-next').click()
    await expect(counter).toHaveText(/^2 \//)
    await page.getByTestId('gallery-prev').click()
    await expect(counter).toHaveText(/^1 \//)
  })

  test('amplia la imagen y permite volver sin perder la posicion', async ({ page }) => {
    await page.getByTestId('gallery-next').click()
    await expect(page.getByTestId('gallery-counter')).toHaveText(/^2 \//)

    await page.getByTestId('gallery-expand').click()
    await expect(page.getByTestId('gallery-lightbox')).toBeVisible()
    await page.keyboard.press('Escape')
    await expect(page.getByTestId('gallery-lightbox')).toBeHidden()
    await expect(page.getByTestId('gallery-counter')).toHaveText(/^2 \//)
  })
})

test.describe('Contacto comprador-vendedor', () => {
  test('el formulario de mensaje registra un lead', async ({ page }) => {
    await openFirstPublication(page)

    await page.getByTestId('contact-message').click()
    await expect(page.getByTestId('contact-form')).toBeVisible()

    await page.getByTestId('contact-name').fill('Comprador de prueba')
    await page.getByTestId('contact-email-input').fill('comprador.prueba@empresa.co')
    await page.getByTestId('contact-phone').fill('+573001112233')
    await page.getByTestId('contact-message-input').fill('Buenos dias, esta disponible para inspeccion?')

    const leadCall = page.waitForResponse(
      (r) => r.url().includes('/api/leads') && r.request().method() === 'POST',
    )
    await page.getByTestId('contact-submit').click()

    const res = await leadCall
    expect(res.status()).toBe(201)
    const body = await res.json()
    expect(body.ok).toBe(true)
    expect(body.leadId).toBeTruthy()

    await expect(page.getByTestId('contact-success')).toBeVisible()
  })

  test('el formulario exige los campos obligatorios', async ({ page }) => {
    await openFirstPublication(page)
    await page.getByTestId('contact-message').click()
    await page.getByTestId('contact-submit').click()

    const invalid = await page.getByTestId('contact-name').evaluate(
      (el) => (el as HTMLInputElement).validity.valueMissing,
    )
    expect(invalid).toBe(true)
  })

  test('el boton de whatsapp registra el lead con su fuente', async ({ page, context }) => {
    await openFirstPublication(page)

    await context.route('https://wa.me/**', (route) => route.abort())

    const leadCall = page.waitForResponse(
      (r) => r.url().includes('/api/leads') && r.request().method() === 'POST',
    )
    await page.getByTestId('contact-whatsapp').click()

    const res = await leadCall
    expect(res.status()).toBe(201)
    const payload = JSON.parse(res.request().postData()!)
    expect(payload.source).toBe('whatsapp')
  })
})

test.describe('Validaciones de la api de contacto', () => {
  test('rechaza payload invalido', async ({ request }) => {
    const res = await request.post('/api/leads', { data: { source: 'whatsapp' } })
    expect(res.status()).toBe(400)
  })

  test('rechaza publicacion inexistente', async ({ request }) => {
    const res = await request.post('/api/leads', {
      data: { publicationId: 'no-existe', source: 'chat', message: 'hola' },
    })
    expect(res.status()).toBe(404)
  })

  test('rechaza fuente no permitida', async ({ request }) => {
    const res = await request.post('/api/leads', {
      data: { publicationId: 'cualquiera', source: 'telegram' },
    })
    expect(res.status()).toBe(400)
  })
})
