import { test, expect, type Page } from '@playwright/test'

// La pagina solo pasa por el service worker cuando este la controla.
// registration.active puede ser cierto antes de que eso ocurra.
async function waitUntilControlled(page: Page) {
  await expect
    .poll(() => page.evaluate(() => Boolean(navigator.serviceWorker?.controller)), { timeout: 20000 })
    .toBe(true)
}

test.describe('PWA instalable', () => {
  test('el manifest declara lo necesario para instalar', async ({ request }) => {
    const res = await request.get('/manifest.webmanifest')
    expect(res.status()).toBe(200)

    const manifest = await res.json()
    expect(manifest.name).toContain('MOVIA')
    expect(manifest.short_name).toBe('MOVIA')
    expect(manifest.start_url).toBe('/')
    expect(manifest.display).toBe('standalone')
    expect(manifest.theme_color).toBe('#111827')
  })

  test('declara iconos de 192 y 512 y uno maskable', async ({ request }) => {
    const manifest = await (await request.get('/manifest.webmanifest')).json()

    const sizes = manifest.icons.map((i: { sizes: string }) => i.sizes)
    expect(sizes).toContain('192x192')
    expect(sizes).toContain('512x512')

    const maskable = manifest.icons.find((i: { purpose?: string }) => i.purpose === 'maskable')
    expect(maskable).toBeTruthy()
  })

  test('los iconos declarados existen y son imagenes', async ({ request }) => {
    const manifest = await (await request.get('/manifest.webmanifest')).json()

    for (const icon of manifest.icons) {
      const res = await request.get(icon.src)
      expect(res.status(), `${icon.src} deberia existir`).toBe(200)
      expect(res.headers()['content-type']).toContain('image/png')
    }
  })

  test('ofrece accesos directos a publicar, buscar y mi empresa', async ({ request }) => {
    const manifest = await (await request.get('/manifest.webmanifest')).json()
    const urls = manifest.shortcuts.map((s: { url: string }) => s.url)

    expect(urls).toContain('/publicar')
    expect(urls).toContain('/buscar')
    expect(urls).toContain('/mi-empresa')
  })

  test('la pagina enlaza el manifest y el icono de apple', async ({ page }) => {
    await page.goto('/')
    await expect(page.locator('link[rel="manifest"]')).toHaveCount(1)
    await expect(page.locator('link[rel="apple-touch-icon"]')).toHaveCount(1)
  })

  test('el service worker se registra y queda activo', async ({ page }) => {
    await page.goto('/')
    await waitUntilControlled(page)
  })

  test('el service worker no intercepta la api', async ({ page }) => {
    await page.goto('/')
    await waitUntilControlled(page)

    const res = await page.evaluate(async () => {
      const r = await fetch('/api/leads', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ source: 'chat' }),
      })
      return r.status
    })

    expect(res).toBe(400)
  })

  test('la pagina sin conexion se sirve cuando la red falla', async ({ page, context }) => {
    await page.goto('/')
    await waitUntilControlled(page)

    await context.setOffline(true)
    await page.goto('/buscar').catch(() => null)

    await expect(page.getByTestId('offline')).toBeVisible({ timeout: 15000 })
    await expect(page.getByRole('heading', { name: /sin conexion/i })).toBeVisible()

    await context.setOffline(false)
  })
})
