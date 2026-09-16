import { test, expect } from '@playwright/test'

// Valores tomados del Manual de Marca, secciones 4, 5, 6 y 14.
const NAVY = 'rgb(17, 24, 39)'
const PRIMARY = 'rgb(37, 99, 235)'
const BORDER = 'rgb(229, 231, 235)'
const SECONDARY_BORDER = 'rgb(209, 213, 219)'

function px(value: string) {
  return Number(value.replace('px', ''))
}

test.describe('Manual de marca - tipografia', () => {
  test('usa Inter en toda la interfaz', async ({ page }) => {
    await page.goto('/')
    const family = await page.locator('body').evaluate((el) => getComputedStyle(el).fontFamily)
    expect(family).toContain('Inter')
  })

  test('el titulo principal usa 32 a 40 px con peso 700', async ({ page }) => {
    await page.goto('/')
    const h1 = page.locator('h1').first()
    const size = px(await h1.evaluate((el) => getComputedStyle(el).fontSize))
    const weight = await h1.evaluate((el) => getComputedStyle(el).fontWeight)

    expect(size).toBeGreaterThanOrEqual(32)
    expect(size).toBeLessThanOrEqual(40)
    expect(weight).toBe('700')
  })

  test('los titulos de seccion usan 24 a 28 px con peso 600', async ({ page }) => {
    await page.goto('/')
    const h2 = page.locator('h2').first()
    const size = px(await h2.evaluate((el) => getComputedStyle(el).fontSize))
    const weight = await h2.evaluate((el) => getComputedStyle(el).fontWeight)

    expect(size).toBeGreaterThanOrEqual(24)
    expect(size).toBeLessThanOrEqual(28)
    expect(weight).toBe('600')
  })

  test('el titulo de una tarjeta usa 18 a 20 px con peso 600', async ({ page }) => {
    await page.goto('/buscar')
    const title = page.getByTestId('publication-card').first().locator('h3')
    const size = px(await title.evaluate((el) => getComputedStyle(el).fontSize))
    const weight = await title.evaluate((el) => getComputedStyle(el).fontWeight)

    expect(size).toBeGreaterThanOrEqual(18)
    expect(size).toBeLessThanOrEqual(20)
    expect(weight).toBe('600')
  })
})

test.describe('Manual de marca - componentes', () => {
  test('el boton principal es azul MOVIA con radio 8 y altura tactil', async ({ page }) => {
    await page.goto('/')
    const button = page.getByTestId('hero-search-submit')

    const style = await button.evaluate((el) => {
      const s = getComputedStyle(el)
      return { bg: s.backgroundColor, radius: s.borderRadius, color: s.color }
    })
    const box = await button.boundingBox()

    expect(style.bg).toBe(PRIMARY)
    expect(style.color).toBe('rgb(255, 255, 255)')
    expect(px(style.radius)).toBe(8)
    expect(box!.height).toBeGreaterThanOrEqual(44)
  })

  test('el boton secundario es blanco con texto navy y borde gris', async ({ page }) => {
    await page.goto('/publicar')
    const style = await page.getByRole('button', { name: 'Cancelar' }).evaluate((el) => {
      const s = getComputedStyle(el)
      return { bg: s.backgroundColor, color: s.color, border: s.borderTopColor, radius: s.borderRadius }
    })

    expect(style.bg).toBe('rgb(255, 255, 255)')
    expect(style.color).toBe(NAVY)
    expect(style.border).toBe(SECONDARY_BORDER)
    expect(px(style.radius)).toBe(8)
  })

  test('las tarjetas usan radio 12 y borde de 1 px gris', async ({ page }) => {
    await page.goto('/buscar')
    const style = await page.getByTestId('publication-card').first().evaluate((el) => {
      const s = getComputedStyle(el)
      return { radius: s.borderRadius, width: s.borderTopWidth, color: s.borderTopColor }
    })

    expect(px(style.radius)).toBe(12)
    expect(px(style.width)).toBe(1)
    expect(style.color).toBe(BORDER)
  })

  test('los campos usan radio 8 y altura tactil minima', async ({ page }) => {
    await page.goto('/publicar')
    const field = page.getByTestId('field-title')

    const radius = await field.evaluate((el) => getComputedStyle(el).borderRadius)
    const box = await field.boundingBox()

    expect(px(radius)).toBe(8)
    expect(box!.height).toBeGreaterThanOrEqual(44)
  })

  test('los campos enfocados no muestran contorno duro sino un halo suave', async ({ page }) => {
    await page.goto('/publicar')

    for (const id of ['field-title', 'field-category', 'field-description']) {
      const field = page.getByTestId(id)
      await field.focus()

      // El borde tiene transicion de color, hay que dejar que termine.
      await expect
        .poll(() => field.evaluate((el) => getComputedStyle(el).borderTopColor))
        .toBe(PRIMARY)

      const style = await field.evaluate((el) => {
        const s = getComputedStyle(el)
        return { outline: s.outlineStyle, shadow: s.boxShadow }
      })

      expect(style.outline, `${id} no debe tener contorno`).toBe('none')
      expect(style.shadow, `${id} debe tener halo`).toContain('rgba(37, 99, 235')
    }
  })

  test('todo control interactivo cumple el area tactil de 44 px', async ({ page }) => {
    await page.goto('/buscar')

    const small = await page.evaluate(() => {
      const offenders: string[] = []
      for (const el of Array.from(document.querySelectorAll('button, a[href], select, input'))) {
        const r = el.getBoundingClientRect()
        if (r.width === 0 || r.height === 0) continue
        // Los enlaces dentro de un parrafo siguen el flujo del texto.
        if (el.tagName === 'A' && el.closest('p')) continue
        if (r.height < 44) offenders.push(`${el.tagName}.${el.className.toString().slice(0, 30)}:${Math.round(r.height)}`)
      }
      return offenders
    })

    expect(small).toEqual([])
  })
})

test.describe('Manual de marca - identidad', () => {
  test('el encabezado fijo es opaco y no deja ver el contenido detras', async ({ page }) => {
    await page.goto('/buscar')
    await page.evaluate(() => window.scrollBy(0, 600))

    const header = page.locator('header')
    const style = await header.evaluate((el) => {
      const s = getComputedStyle(el)
      return { bg: s.backgroundColor, backdrop: s.backdropFilter }
    })

    expect(style.bg).toBe('rgb(255, 255, 255)')
    expect(style.backdrop).toBe('none')
  })

  // La barra de secciones solo existe en escritorio.
  test('el subrayado de la seccion activa se apoya en el borde del encabezado @desktop', async ({ page }) => {
    await page.goto('/mensajes')

    const gap = await page.evaluate(() => {
      const header = document.querySelector('header')!.getBoundingClientRect()
      const indicator = document.querySelector('header nav span.pointer-events-none')
      if (!indicator) return null
      return Math.round(header.bottom - indicator.getBoundingClientRect().bottom)
    })

    expect(gap).not.toBeNull()
    expect(gap!).toBeLessThanOrEqual(2)
    expect(gap!).toBeGreaterThanOrEqual(0)
  })

  test('el pie llega al borde inferior en paginas cortas', async ({ page }) => {
    await page.goto('/mensajes')

    const gap = await page.evaluate(() => {
      const footer = document.querySelector('footer')!.getBoundingClientRect()
      return Math.round(window.innerHeight - footer.bottom)
    })

    expect(gap).toBeLessThanOrEqual(1)
  })

  test('el pie usa el navy institucional', async ({ page }) => {
    await page.goto('/')
    const bg = await page.locator('footer').evaluate((el) => getComputedStyle(el).backgroundColor)
    expect(bg).toBe(NAVY)
  })

  test('la paleta declarada coincide con el manual', async ({ page }) => {
    await page.goto('/')

    const tokens = await page.evaluate(() => {
      const s = getComputedStyle(document.documentElement)
      return {
        navy: s.getPropertyValue('--color-navy').trim(),
        primary: s.getPropertyValue('--color-primary').trim(),
        hover: s.getPropertyValue('--color-primary-hover').trim(),
        soft: s.getPropertyValue('--color-primary-soft').trim(),
        background: s.getPropertyValue('--color-background').trim(),
        border: s.getPropertyValue('--color-border').trim(),
        muted: s.getPropertyValue('--color-text-muted').trim(),
        success: s.getPropertyValue('--color-success').trim(),
        danger: s.getPropertyValue('--color-danger').trim(),
      }
    })

    expect(tokens).toEqual({
      navy: '#111827',
      primary: '#2563eb',
      hover: '#1d4ed8',
      soft: '#eff6ff',
      background: '#f8fafc',
      border: '#e5e7eb',
      muted: '#6b7280',
      success: '#16a34a',
      danger: '#dc2626',
    })
  })

  test('los radios declarados coinciden con el manual', async ({ page }) => {
    await page.goto('/')

    const radii = await page.evaluate(() => {
      const s = getComputedStyle(document.documentElement)
      return {
        input: s.getPropertyValue('--radius-input').trim(),
        card: s.getPropertyValue('--radius-card').trim(),
        modal: s.getPropertyValue('--radius-modal').trim(),
      }
    })

    expect(radii).toEqual({ input: '8px', card: '12px', modal: '16px' })
  })

  test('distingue empresas verificadas de personas naturales', async ({ page }) => {
    // Se busca cada caso por su publicacion, no por el orden de la primera pagina:
    // otras pruebas cargan inventario y desplazan los resultados.
    await page.goto('/buscar?q=Schulz')
    const natural = page.getByTestId('publication-card').first()
    await expect(natural).toContainText('Persona natural')

    await page.goto('/buscar?q=Mazak')
    const company = page.getByTestId('publication-card').first()
    await expect(company.locator('svg.lucide-badge-check')).toHaveCount(1)
    await expect(company).not.toContainText('Persona natural')
  })

  test('una publicacion de persona natural no muestra sello de empresa', async ({ page }) => {
    await page.goto('/buscar?q=Schulz')
    const card = page.getByTestId('publication-card').first()

    await expect(card).toContainText('Persona natural')
    await expect(card.locator('svg.lucide-badge-check')).toHaveCount(0)
  })
})
