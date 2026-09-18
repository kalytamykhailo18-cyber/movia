import { test, expect } from '@playwright/test'
import path from 'node:path'

const FIXTURES = path.join(process.cwd(), 'tests', 'fixtures')

const VENDEDOR = { email: 'empresa1@movia.co', password: 'Demo2026' }

// Publicar exige sesion: la publicacion queda a nombre de quien la crea.
const FOTOS = ['foto-activo.jpg', 'foto-activo-2.jpg', 'foto-activo-3.jpg']

// Las fotos se suben de verdad: el formulario ya no genera imagenes.
async function subirFotos(page: import('@playwright/test').Page, cuantas: number) {
  const antes = await page.getByTestId('photo-item').count()
  await page
    .getByTestId('photo-input')
    .setInputFiles(FOTOS.slice(0, cuantas).map((f) => path.join(FIXTURES, f)))
  await expect(page.getByTestId('photo-item')).toHaveCount(antes + cuantas, { timeout: 30000 })
}

async function ingresarComoVendedor(page: import('@playwright/test').Page) {
  await page.goto('/ingresar')
  await page.getByTestId('login-email').fill(VENDEDOR.email)
  await page.getByTestId('login-password').fill(VENDEDOR.password)
  await page.getByTestId('login-submit').click()
  await expect(page).toHaveURL(/\/mi-empresa/)
}

async function uploadCsv(page: import('@playwright/test').Page, file: string) {
  await expect(page.getByTestId('dropzone')).toHaveAttribute('data-ready', 'true', { timeout: 30000 })
  await page.getByTestId('bulk-file-input').setInputFiles(path.join(FIXTURES, file))
  await expect(page.getByTestId('file-name')).toHaveText(file)
}

test.describe('Alta de publicacion', () => {
  test.beforeEach(async ({ page }) => {
    await ingresarComoVendedor(page)
    await page.goto('/publicar')
  })

  test('el indicador de calidad arranca bajo y sugiere el siguiente paso', async ({ page }) => {
    const bar = page.getByTestId('completeness')
    await expect(bar).toBeVisible()
    await expect(bar).toContainText('0% completa')
    await expect(bar).toContainText(/sube al menos 3 fotos/i)
  })

  test('el indicador de calidad se distingue del formulario y no deja ver detras', async ({
    page,
  }) => {
    await page.getByTestId('field-title').scrollIntoViewIfNeeded()
    await page.evaluate(() => window.scrollBy(0, 420))
    await page.waitForTimeout(400)

    const medidas = await page.evaluate(() => {
      const barra = document.querySelector('[data-testid="completeness"]')!.closest('aside')!
      const estilo = getComputedStyle(barra)
      const caja = barra.getBoundingClientRect()
      const encabezado = document.querySelector('header')!.getBoundingClientRect()
      return {
        fondo: estilo.backgroundColor,
        sombra: estilo.boxShadow,
        borde: estilo.borderTopColor,
        huecoConEncabezado: Math.round(caja.top - encabezado.bottom),
      }
    })

    // Fondo propio, no el blanco de las tarjetas del formulario.
    expect(medidas.fondo).toBe('rgb(239, 246, 255)')
    expect(medidas.sombra).not.toBe('none')
    expect(medidas.borde).not.toBe('rgb(229, 231, 235)')

    // Pegada al encabezado: sin franja por donde se vea pasar el formulario.
    expect(medidas.huecoConEncabezado).toBeLessThanOrEqual(1)
  })

  test('el indicador sube al completar campos', async ({ page }) => {
    await page.getByTestId('field-title').fill('Torno CNC Mazak Quick Turn 250')
    await page.getByTestId('field-price').fill('185000000')

    const bar = page.getByTestId('completeness')
    await expect(bar).toContainText(/Publicacion 20% completa/)
  })

  test('llega a 100 por ciento con todos los campos', async ({ page }) => {
    await page.getByTestId('field-title').fill('Fresadora universal Bridgeport Series I')
    await page.getByTestId('field-price').fill('42000000')
    await page.getByTestId('field-brand').fill('Bridgeport')
    await page.getByTestId('field-model').fill('Series I')
    await page.getByTestId('field-year').fill('2012')
    await page.getByTestId('field-condition').selectOption('Usado - buen estado')
    await page.getByTestId('field-description').fill(
      'Fresadora universal con cabezal revisado, mesa de 9x42 pulgadas, visualizador digital de tres ejes y prensa de precision incluida. Equipo operativo disponible para prueba en sitio.',
    )

    const cityOptions = await page.getByTestId('field-city').locator('option').nth(1).getAttribute('value')
    await page.getByTestId('field-city').selectOption(cityOptions!)

    const categoryValue = await page.getByTestId('field-category').locator('option').nth(1).getAttribute('value')
    await page.getByTestId('field-category').selectOption(categoryValue!)

    await expect(page.getByTestId('specs-fields')).toBeVisible()
    await page.getByTestId('spec-potencia').fill('3.7')
    await page.getByTestId('spec-voltaje').selectOption('220V')
    await page.getByTestId('spec-peso').fill('1100')

    await subirFotos(page, 3)

    await expect(page.getByTestId('completeness')).toContainText(/9[0-9]% completa|100% completa/)
  })

  test('los campos tecnicos cambian segun la categoria', async ({ page }) => {
    const select = page.getByTestId('field-category')

    const maquinaria = await select.locator('option', { hasText: 'Maquinaria industrial' }).getAttribute('value')
    await select.selectOption(maquinaria!)
    await expect(page.getByTestId('spec-potencia')).toBeVisible()

    const vehiculos = await select.locator('option', { hasText: 'Vehículos' }).getAttribute('value')
    await select.selectOption(vehiculos!)
    await expect(page.getByTestId('spec-kilometraje')).toBeVisible()
    await expect(page.getByTestId('spec-potencia')).toBeHidden()
  })

  test('agrega y quita fotografias', async ({ page }) => {
    await subirFotos(page, 2)
    await expect(page.getByTestId('photo-item')).toHaveCount(2)

    await page.getByRole('button', { name: /quitar foto 1/i }).click()
    await expect(page.getByTestId('photo-item')).toHaveCount(1)
  })

  test('rechaza una imagen demasiado pequena', async ({ page }) => {
    await page
      .getByTestId('photo-input')
      .setInputFiles(path.join(FIXTURES, 'foto-pequena.jpg'))

    await expect(page.getByTestId('publish-error')).toContainText(/muy pequena/i)
    await expect(page.getByTestId('photo-item')).toHaveCount(0)
  })

  test('la foto subida queda servida y optimizada', async ({ page }) => {
    await subirFotos(page, 1)

    const src = await page.getByTestId('photo-item').first().locator('img').getAttribute('src')
    expect(src).toMatch(/^\/uploads\/\d{4}\/\d{2}\/[\w-]+\.webp$/)

    const res = await page.request.get(src!)
    expect(res.status()).toBe(200)
    expect(res.headers()['content-type']).toBe('image/webp')
  })

  test('publica un activo y redirige a su ficha', async ({ page }) => {
    await page.getByTestId('field-title').fill('Soldadora TIG Miller Dynasty 280')
    await page.getByTestId('field-price').fill('19500000')
    await page.getByTestId('field-brand').fill('Miller')
    await page.getByTestId('field-model').fill('Dynasty 280 DX')
    await page.getByTestId('field-year').fill('2021')
    await page.getByTestId('field-description').fill(
      'Soldadora TIG de alta frecuencia con refrigeracion por agua, antorcha y pedal incluidos. Uso ligero en taller de mantenimiento.',
    )

    const categoryValue = await page
      .getByTestId('field-category')
      .locator('option', { hasText: 'Maquinaria industrial' })
      .getAttribute('value')
    await page.getByTestId('field-category').selectOption(categoryValue!)

    await subirFotos(page, 1)

    await page.getByTestId('publish-submit').click()

    await expect(page).toHaveURL(/\/publicacion\//, { timeout: 20000 })
    await expect(page.getByRole('heading', { level: 1 })).toContainText('Soldadora TIG Miller Dynasty 280')
    await expect(page.getByTestId('detail-price')).toContainText('19.500.000')
  })

  test('exige titulo, categoria y precio', async ({ page }) => {
    await page.getByTestId('publish-submit').click()
    const missing = await page.getByTestId('field-title').evaluate(
      (el) => (el as HTMLInputElement).validity.valueMissing,
    )
    expect(missing).toBe(true)
    await expect(page).toHaveURL(/\/publicar$/)
  })

  test('ofrece el acceso a carga masiva', async ({ page }) => {
    await page.getByTestId('go-bulk').click()
    await expect(page).toHaveURL(/\/publicar\/masivo/)
  })
})

test.describe('Carga masiva', () => {
  test.beforeEach(async ({ page }) => {
    await ingresarComoVendedor(page)
    await page.goto('/publicar/masivo')
  })

  test('descarga la plantilla con las columnas esperadas', async ({ page }) => {
    const [download] = await Promise.all([
      page.waitForEvent('download'),
      page.getByTestId('download-template').click(),
    ])
    expect(download.suggestedFilename()).toContain('movia-plantilla')
  })

  test('la plantilla se filtra por categoria', async ({ page, request }) => {
    const res = await request.get('/api/bulk/template?categoria=vehiculos')
    expect(res.status()).toBe(200)
    const body = await res.text()
    expect(body).toContain('titulo,categoria,precio')
    expect(body).toContain('vehiculos')
    expect(body).not.toContain('maquinaria-industrial')
  })

  test('previsualiza un archivo valido sin errores', async ({ page }) => {
    await uploadCsv(page, 'bulk-valido.csv')

    await expect(page.getByTestId('bulk-preview')).toBeVisible({ timeout: 20000 })
    await expect(page.getByTestId('preview-total')).toHaveText('3')
    await expect(page.getByTestId('preview-valid')).toHaveText('3')
    await expect(page.getByTestId('preview-invalid')).toHaveText('0')
    await expect(page.getByTestId('preview-row-valid')).toHaveCount(3)
  })

  test('reporta errores linea a linea con columna y mensaje', async ({ page }) => {
    await uploadCsv(page, 'bulk-con-errores.csv')

    await expect(page.getByTestId('bulk-preview')).toBeVisible({ timeout: 20000 })
    await expect(page.getByTestId('preview-total')).toHaveText('5')
    await expect(page.getByTestId('preview-valid')).toHaveText('1')
    await expect(page.getByTestId('preview-invalid')).toHaveText('4')

    const issues = page.getByTestId('row-issue')
    await expect(issues.filter({ hasText: 'titulo' }).first()).toContainText(/obligatorio/i)
    await expect(issues.filter({ hasText: 'precio' }).first()).toContainText(/obligatorio/i)
    await expect(issues.filter({ hasText: 'categoria' }).first()).toContainText(/no existe/i)
    await expect(issues.filter({ hasText: 'anio' }).first()).toContainText(/fuera de rango/i)
  })

  test('publica solo las filas validas y las cuenta', async ({ page }) => {
    await uploadCsv(page, 'bulk-valido.csv')
    await expect(page.getByTestId('bulk-preview')).toBeVisible({ timeout: 20000 })

    await page.getByTestId('bulk-commit').click()

    await expect(page.getByTestId('bulk-result')).toBeVisible({ timeout: 20000 })
    await expect(page.getByTestId('bulk-result')).toContainText('Publicamos 3 activos')
  })

  test('las publicaciones cargadas quedan buscables', async ({ page }) => {
    await uploadCsv(page, 'bulk-valido.csv')
    await expect(page.getByTestId('bulk-preview')).toBeVisible({ timeout: 20000 })
    await page.getByTestId('bulk-commit').click()
    await expect(page.getByTestId('bulk-result')).toBeVisible({ timeout: 20000 })

    await page.goto('/buscar?q=Pinacho')
    await expect(page.getByTestId('publication-card').first()).toContainText(/Pinacho/i)
  })

  test('cancelar descarta la previsualizacion', async ({ page }) => {
    await uploadCsv(page, 'bulk-valido.csv')
    await expect(page.getByTestId('bulk-preview')).toBeVisible({ timeout: 20000 })

    await page.getByTestId('bulk-cancel').click()
    await expect(page.getByTestId('bulk-preview')).toBeHidden()
  })
})

test.describe('Validaciones de la api de publicaciones', () => {
  test('no deja publicar sin sesion', async ({ request }) => {
    const res = await request.post('/api/publications', {
      data: { title: 'Activo sin sesion', categoryId: 'x', price: 1000 },
    })
    expect(res.status()).toBe(401)
  })

  test('no deja cargar inventario sin sesion', async ({ request }) => {
    const res = await request.post('/api/bulk/commit', {
      data: { preview: { totalRows: 1, validRows: 1, invalidRows: 0, issues: [], rows: [] } },
    })
    expect(res.status()).toBe(401)
  })

  test('rechaza precio negativo', async ({ page }) => {
    await ingresarComoVendedor(page)
    const res = await page.request.post('/api/publications', {
      data: { title: 'Activo de prueba', categoryId: 'x', price: -100 },
    })
    expect(res.status()).toBe(400)
  })

  test('rechaza categoria inexistente', async ({ page }) => {
    await ingresarComoVendedor(page)
    const res = await page.request.post('/api/publications', {
      data: { title: 'Activo de prueba', categoryId: 'no-existe', price: 1000000 },
    })
    expect(res.status()).toBe(404)
  })

  test('rechaza carga masiva sin archivo', async ({ request }) => {
    const res = await request.post('/api/bulk/preview', { multipart: {} })
    expect(res.status()).toBe(400)
  })
})
