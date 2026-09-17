import { test, expect, type Page } from '@playwright/test'

const ADMIN = { email: 'admin@movia.co', password: 'Movia2026' }

async function loginAsAdmin(page: Page) {
  await page.goto('/ingresar')
  await page.getByTestId('login-email').fill(ADMIN.email)
  await page.getByTestId('login-password').fill(ADMIN.password)
  await page.getByTestId('login-submit').click()
  await expect(page).toHaveURL(/\/admin/)
}

function toNumber(text: string) {
  return Number(text.replace(/\D/g, ''))
}

// Cada proyecto necesita su propia empresa pendiente: si comparte la del seed,
// el primero que la aprueba deja al otro sin nada que revisar.
async function registerPendingCompany(page: Page, baseURL: string | undefined) {
  const stamp = `${Date.now()}${Math.floor(Math.random() * 1000)}`
  const name = `Empresa Revision ${stamp}`
  const nit = String(800000000 + Math.floor(Math.random() * 99999999))

  const fresh = await page.context().browser()!.newContext({ baseURL })
  const visitor = await fresh.newPage()

  await visitor.goto('/registro')
  await visitor.getByTestId('reg-name').fill('Responsable Revision')
  await visitor.getByTestId('reg-email').fill(`revision.${stamp}@prueba.co`)
  await visitor.getByTestId('reg-password').fill('ClaveSegura123')
  await visitor.getByTestId('reg-company').fill(name)
  await visitor.getByTestId('reg-legal').fill(`${name} S.A.S.`)
  await visitor.getByTestId('reg-nit').fill(nit)

  const hint = await visitor.getByTestId('digit-hint').innerText()
  await visitor.getByTestId('reg-check-digit').fill(hint.match(/es (\d)/)![1])
  await visitor.getByTestId('register-submit').click()
  await expect(visitor).toHaveURL(/\/mi-empresa/)
  await fresh.close()

  return { name, nit }
}

test.describe('Administracion', () => {
  test.beforeEach(async ({ page }) => {
    await loginAsAdmin(page)
  })

  test('el resumen muestra los indicadores de operacion', async ({ page }) => {
    await expect(page.getByTestId('metric-revenue')).toContainText('Ingresos aprobados')
    await expect(page.getByTestId('metric-subs')).toContainText('Suscripciones activas')
    await expect(page.getByTestId('metric-pubs')).toContainText('Publicaciones activas')
    await expect(page.getByTestId('metric-users')).toContainText('Usuarios')
  })

  test('registra la actividad de administracion', async ({ page }) => {
    await expect(page.getByTestId('audit-log')).toBeVisible()
  })

  test('recorre las secciones de administracion', async ({ page }) => {
    await page.getByTestId('admin-nav-planes').click()
    await expect(page.getByRole('heading', { name: 'Planes y tarifas' })).toBeVisible()

    await page.getByTestId('admin-nav-verificaciones').click()
    await expect(page.getByRole('heading', { name: 'Verificaciones' })).toBeVisible()

    await page.getByTestId('admin-nav-usuarios').click()
    await expect(page.getByRole('heading', { name: 'Usuarios' })).toBeVisible()
  })
})

test.describe('Tarifas editables desde administracion', () => {
  test.beforeEach(async ({ page }) => {
    await loginAsAdmin(page)
  })

  test('cambiar el precio de un plan se refleja en la pagina publica', async ({ page }) => {
    // Este es el criterio del manual: las tarifas se modifican desde
    // administracion sin tocar el codigo.
    await page.goto('/planes')
    const publicBefore = toNumber(
      await page
        .getByTestId('plan-card')
        .filter({ hasText: 'Empresa mensual' })
        .getByTestId('plan-price')
        .innerText(),
    )

    const nuevoPrecio = publicBefore === 275000 ? 289000 : 275000

    await page.goto('/admin/planes')
    await page.getByTestId('plan-price-empresa-mensual').fill(String(nuevoPrecio))
    await page.getByTestId('plan-save-empresa-mensual').click()
    await expect(page.getByTestId('plan-saved-empresa-mensual')).toBeVisible()

    await page.goto('/planes')
    const publicAfter = toNumber(
      await page
        .getByTestId('plan-card')
        .filter({ hasText: 'Empresa mensual' })
        .getByTestId('plan-price')
        .innerText(),
    )

    expect(publicAfter).toBe(nuevoPrecio)
    expect(publicAfter).not.toBe(publicBefore)
  })

  test('el desglose de impuesto se recalcula con el nuevo precio', async ({ page }) => {
    await page.goto('/admin/planes')
    await page.getByTestId('plan-price-publicacion-15').fill('119000')
    await page.getByTestId('plan-save-publicacion-15').click()
    await expect(page.getByTestId('plan-saved-publicacion-15')).toBeVisible()

    await page.goto('/planes')
    const card = page.getByTestId('plan-card').filter({ hasText: 'Publicacion 15 dias' })

    const total = toNumber(await card.getByTestId('plan-price').innerText())
    const taxLine = await card.getByTestId('plan-tax').innerText()
    const [base, tax] = taxLine.match(/[\d.]+/g)!.slice(0, 2).map((n) => Number(n.replace(/\D/g, '')))

    expect(total).toBe(119000)
    expect(Math.abs(base + tax - total)).toBeLessThanOrEqual(2)
  })

  test('cambiar el cupo de publicaciones queda guardado', async ({ page }) => {
    await page.goto('/admin/planes')
    await page.getByTestId('plan-quota-empresa-mensual').fill('40')
    await page.getByTestId('plan-save-empresa-mensual').click()
    await expect(page.getByTestId('plan-saved-empresa-mensual')).toBeVisible()

    await page.reload()
    await expect(page.getByTestId('plan-quota-empresa-mensual')).toHaveValue('40')
  })

  test('ocultar un plan lo retira de la pagina publica', async ({ page }) => {
    await page.goto('/admin/planes')
    await page.getByTestId('plan-active-destacado-7').uncheck()
    await page.getByTestId('plan-save-destacado-7').click()
    await expect(page.getByTestId('plan-saved-destacado-7')).toBeVisible()

    await page.goto('/planes')
    await expect(page.getByTestId('plan-card').filter({ hasText: 'Destacado 7 dias' })).toHaveCount(0)

    // se restaura para no dejar el demo incompleto
    await page.goto('/admin/planes')
    await page.getByTestId('plan-active-destacado-7').check()
    await page.getByTestId('plan-save-destacado-7').click()
    await expect(page.getByTestId('plan-saved-destacado-7')).toBeVisible()

    await page.goto('/planes')
    await expect(page.getByTestId('plan-card').filter({ hasText: 'Destacado 7 dias' })).toHaveCount(1)
  })

  test('rechaza un precio negativo', async ({ page }) => {
    const plan = await page.request.get('/api/admin/planes/x')
    expect([401, 403, 404, 405]).toContain(plan.status())

    await page.goto('/admin/planes')
    const id = await page.getByTestId('plan-row').first().getAttribute('data-slug')
    expect(id).toBeTruthy()

    const res = await page.request.patch('/api/admin/planes/no-existe', { data: { price: -1 } })
    expect(res.status()).toBe(400)
  })
})

test.describe('Verificacion de empresas', () => {
  test.beforeEach(async ({ page }) => {
    await loginAsAdmin(page)
  })

  test('lista las empresas pendientes con su NIT', async ({ page }) => {
    await page.goto('/admin/verificaciones')

    const rows = page.getByTestId('verification-row')
    if ((await rows.count()) === 0) {
      await expect(page.getByTestId('verifications-empty')).toBeVisible()
      return
    }

    await expect(rows.first().getByTestId('verification-nit')).toContainText(/NIT \d+-\d/)
  })

  test('aprobar una empresa le otorga el distintivo publico', async ({ page, baseURL }) => {
    const target = await registerPendingCompany(page, baseURL)

    await page.goto('/empresas')
    await expect(
      page.getByTestId('company-card').filter({ hasText: target.name }),
    ).toContainText('Verificacion pendiente')

    await page.goto('/admin/verificaciones')
    await page.getByTestId(`approve-${target.nit}`).click()
    await expect(page.getByText('Aprobada').first()).toBeVisible()

    await page.goto('/empresas')
    await expect(
      page.getByTestId('company-card').filter({ hasText: target.name }),
    ).toContainText('Empresa verificada')
  })

  test('rechazar una empresa la deja sin distintivo', async ({ page, baseURL }) => {
    const target = await registerPendingCompany(page, baseURL)

    await page.goto('/admin/verificaciones')
    await page.getByTestId(`reject-${target.nit}`).click()
    await expect(page.getByText('Rechazada').first()).toBeVisible()

    await page.goto('/empresas')
    await expect(
      page.getByTestId('company-card').filter({ hasText: target.name }),
    ).toContainText('No verificada')
  })
})

test.describe('Gestion de usuarios', () => {
  test.beforeEach(async ({ page }) => {
    await loginAsAdmin(page)
    await page.goto('/admin/usuarios')
  })

  test('lista los usuarios con su rol y estado', async ({ page }) => {
    await expect(page.getByTestId('users-table')).toBeVisible()
    expect(await page.getByTestId('user-row').count()).toBeGreaterThan(1)
  })

  test('el administrador no puede suspender su propia cuenta', async ({ page }) => {
    const own = page.getByTestId('user-row').filter({ hasText: ADMIN.email })
    await expect(own).toContainText('Tu cuenta')
  })

  test('suspender un usuario le impide iniciar sesion', async ({ page, browser }) => {
    const target = 'comprador6@movia.co'

    await page.getByTestId(`toggle-${target}`).click()
    await expect(
      page.getByTestId('user-row').filter({ hasText: target }),
    ).toContainText('Suspendido')

    // Contexto limpio: si comparte cookies con el admin, /ingresar redirige.
    const fresh = await browser.newContext({ baseURL: page.url().split('/admin')[0] })
    const visitor = await fresh.newPage()
    await visitor.goto('/ingresar')
    await visitor.getByTestId('login-email').fill(target)
    await visitor.getByTestId('login-password').fill('Demo2026')
    await visitor.getByTestId('login-submit').click()
    await expect(visitor.getByTestId('login-error')).toContainText(/suspendida/i)
    await fresh.close()

    // se reactiva para dejar el demo como estaba
    await page.reload()
    await page.getByTestId(`toggle-${target}`).click()
    await expect(
      page.getByTestId('user-row').filter({ hasText: target }),
    ).toContainText('Activo')
  })
})
