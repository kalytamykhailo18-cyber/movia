import { test, expect } from '@playwright/test'

test.describe('Mi Empresa - resumen', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/mi-empresa')
  })

  test('identifica la empresa y su verificacion', async ({ page }) => {
    await expect(page.getByTestId('company-name')).toBeVisible()
    await expect(page.getByText('Empresa verificada').first()).toBeVisible()
  })

  test('muestra los indicadores principales del manual', async ({ page }) => {
    await expect(page.getByTestId('kpi-views')).toContainText('Visualizaciones')
    await expect(page.getByTestId('kpi-leads')).toContainText('Contactos recibidos')
    await expect(page.getByTestId('kpi-favorites')).toContainText('Favoritos')
    await expect(page.getByTestId('kpi-followers')).toContainText('Seguidores')
  })

  test('los contadores llegan a un valor real, no cero', async ({ page }) => {
    const views = page.getByTestId('kpi-views-value')
    await expect(views).toBeVisible()
    await expect
      .poll(async () => Number((await views.innerText()).replace(/\D/g, '')), { timeout: 10000 })
      .toBeGreaterThan(0)
  })

  test('desglosa los canales de contacto', async ({ page }) => {
    await expect(page.getByTestId('kpi-whatsapp')).toContainText('Clics en WhatsApp')
    await expect(page.getByTestId('kpi-email')).toContainText('Contactos por correo')
    await expect(page.getByTestId('kpi-chats')).toContainText('Chats iniciados')

    const whatsapp = Number(
      (await page.getByTestId('kpi-whatsapp-value').innerText()).replace(/\D/g, ''),
    )
    expect(whatsapp).toBeGreaterThan(0)
  })

  test('grafica la tendencia de 30 dias', async ({ page }) => {
    await expect(page.getByTestId('trend-chart')).toBeVisible()
    await expect(page.getByTestId('trend-chart')).toContainText(/ultimos 30 dias/i)
    await expect(page.getByRole('img', { name: /tendencia de visualizaciones/i })).toBeVisible()
  })

  test('muestra el reparto de contactos por canal', async ({ page }) => {
    const breakdown = page.getByTestId('source-breakdown')
    await expect(breakdown).toBeVisible()
    await expect(breakdown).toContainText('WhatsApp')
    await expect(breakdown).toContainText('Correo')
  })

  test('muestra el estado del inventario', async ({ page }) => {
    await expect(page.getByTestId('inventory-breakdown')).toContainText('Activas')
    await expect(page.getByTestId('inventory-breakdown')).toContainText('Vendidas')
    await expect(page.getByTestId('inventory-breakdown')).toContainText('Vencidas')
  })

  test('muestra el plan vigente con cupos y fecha de renovacion', async ({ page }) => {
    const card = page.getByTestId('subscription-card')
    await expect(card).toBeVisible()
    await expect(card).toContainText(/publicaciones usadas/i)
    await expect(card).toContainText(/renueva en/i)
  })
})

test.describe('Mi Empresa - rendimiento por publicacion', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/mi-empresa/publicaciones')
  })

  test('lista las publicaciones de la empresa', async ({ page }) => {
    const rows = page.getByTestId('performance-row')
    expect(await rows.count()).toBeGreaterThan(0)
  })

  test('cada fila trae vistas, contactos, favoritos y dias activa', async ({ page }) => {
    const row = page.getByTestId('performance-row').first()
    await expect(row.getByTestId('metric-views')).toBeVisible()
    await expect(row.getByTestId('metric-leads')).toBeVisible()
    await expect(row.getByTestId('metric-favorites')).toBeVisible()
    await expect(row.getByTestId('metric-days')).toBeVisible()

    const views = (await page.getByTestId('metric-views').allInnerTexts()).map(Number)
    expect(Math.max(...views)).toBeGreaterThan(0)
  })

  test('muestra conversion y tiempo hasta el primer contacto', async ({ page }) => {
    const row = page.getByTestId('performance-row').first()
    await expect(row.getByTestId('metric-conversion')).toContainText(/Conversion \d/)
    await expect(row.getByTestId('metric-first-contact')).toContainText(
      /Primer contacto a las \d+ h|Sin contactos aun/,
    )
  })

  test('muestra el indicador de calidad de cada publicacion', async ({ page }) => {
    const row = page.getByTestId('performance-row').first()
    await expect(row.getByTestId('completeness')).toContainText(/% completa/)
  })

  test('el titulo enlaza a la ficha publica', async ({ page }) => {
    await page.getByTestId('performance-title').first().click()
    await expect(page).toHaveURL(/\/publicacion\//)
  })
})

test.describe('Mi Empresa - contactos recibidos', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/mi-empresa/contactos')
  })

  test('lista los contactos con su canal de origen', async ({ page }) => {
    await expect(page.getByTestId('leads-list')).toBeVisible()
    const items = page.getByTestId('lead-item')
    expect(await items.count()).toBeGreaterThan(0)
    await expect(items.first()).toContainText(/WhatsApp|Correo|Chat interno/)
  })

  test('cada contacto referencia su publicacion', async ({ page }) => {
    await expect(page.getByTestId('lead-publication').first()).toBeVisible()
    await page.getByTestId('lead-publication').first().click()
    await expect(page).toHaveURL(/\/publicacion\//)
  })

  test('el total de contactos es mayor a cero', async ({ page }) => {
    const total = Number(await page.getByTestId('leads-total').innerText())
    expect(total).toBeGreaterThan(0)
  })
})

test.describe('Mi Empresa - facturacion', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/mi-empresa/facturacion')
  })

  test('muestra el plan activo con sus cupos', async ({ page }) => {
    await expect(page.getByTestId('plan-card')).toBeVisible()
    await expect(page.getByTestId('quota-publications')).toContainText(/de \d+/)
  })

  test('lista los pagos con base, impuesto y total', async ({ page }) => {
    await expect(page.getByTestId('payments-table')).toBeVisible()
    const row = page.getByTestId('payment-row').first()
    await expect(row).toContainText(/PSE|Tarjeta/)
    await expect(row.getByTestId('payment-total')).toContainText('$')
  })

  test('el total corresponde a base mas impuesto', async ({ page }) => {
    const row = page.getByTestId('payment-row').first()
    const cells = await row.locator('td').allInnerTexts()
    const toNumber = (text: string) => Number(text.replace(/\D/g, ''))

    const net = toNumber(cells[3])
    const tax = toNumber(cells[4])
    const total = toNumber(cells[5])

    expect(Math.abs(net + tax - total)).toBeLessThanOrEqual(2)
  })

  test('cada pago aprobado tiene factura electronica', async ({ page }) => {
    await expect(page.getByTestId('invoice-number').first()).toContainText(/FE-\d+/)
  })

  test('declara que el precio incluye el impuesto', async ({ page }) => {
    await expect(page.getByText(/incluye IVA de 19%/i)).toBeVisible()
  })
})

test.describe('Navegacion del panel', () => {
  test('recorre las cuatro secciones', async ({ page }) => {
    await page.goto('/mi-empresa')

    // En movil la barra de secciones se desplaza en horizontal, igual que al deslizarla con el dedo.
    async function openSection(testId: string) {
      const tab = page.getByTestId(testId)
      await tab.scrollIntoViewIfNeeded()
      await tab.click()
    }

    await openSection('nav-publicaciones')
    await expect(page).toHaveURL(/\/mi-empresa\/publicaciones/)
    await expect(page.getByRole('heading', { name: 'Mis publicaciones' })).toBeVisible()

    await openSection('nav-contactos')
    await expect(page).toHaveURL(/\/mi-empresa\/contactos/)
    await expect(page.getByRole('heading', { name: 'Contactos recibidos' })).toBeVisible()

    await openSection('nav-facturacion')
    await expect(page).toHaveURL(/\/mi-empresa\/facturacion/)
    await expect(page.getByRole('heading', { name: 'Suscripcion y facturacion' })).toBeVisible()

    await openSection('nav-mi-empresa')
    await expect(page).toHaveURL(/\/mi-empresa$/)
  })
})

test.describe('Ciclo completo: contacto se refleja en analitica', () => {
  test('un contacto nuevo aparece en el panel del vendedor', async ({ page }) => {
    await page.goto('/mi-empresa/contactos')
    const before = Number(await page.getByTestId('leads-total').innerText())

    await page.goto('/mi-empresa/publicaciones')
    await page.getByTestId('performance-title').first().click()
    await expect(page).toHaveURL(/\/publicacion\//)

    await page.getByTestId('contact-message').click()
    await page.getByTestId('contact-name').fill('Comprador ciclo completo')
    await page.getByTestId('contact-email-input').fill('ciclo@empresa.co')
    await page.getByTestId('contact-message-input').fill('Solicito ficha tecnica y disponibilidad.')

    const leadCall = page.waitForResponse(
      (r) => r.url().includes('/api/leads') && r.request().method() === 'POST',
    )
    await page.getByTestId('contact-submit').click()
    expect((await leadCall).status()).toBe(201)

    await page.goto('/mi-empresa/contactos')
    const after = Number(await page.getByTestId('leads-total').innerText())
    expect(after).toBeGreaterThan(before)

    await expect(page.getByTestId('lead-item').first()).toContainText('Comprador ciclo completo')
  })
})
