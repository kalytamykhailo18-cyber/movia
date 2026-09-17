import { test, expect, type Page } from '@playwright/test'

const ADMIN = { email: 'admin@movia.co', password: 'Movia2026' }
const SELLER = { email: 'empresa1@movia.co', password: 'Demo2026' }

async function login(page: Page, who: { email: string; password: string }) {
  await page.goto('/ingresar')
  await page.getByTestId('login-email').fill(who.email)
  await page.getByTestId('login-password').fill(who.password)
  await page.getByTestId('login-submit').click()
}

function uniqueEmail(prefix: string) {
  return `${prefix}.${Date.now()}.${Math.random().toString(36).slice(2, 7)}@prueba.co`
}

// NIT distinto en cada corrida: el registro rechaza duplicados.
function randomNit() {
  return String(800000000 + Math.floor(Math.random() * 99999999))
}

test.describe('Acceso', () => {
  test('el panel del vendedor exige sesion', async ({ page }) => {
    await page.goto('/mi-empresa')
    await expect(page).toHaveURL(/\/ingresar/)
  })

  test('la administracion exige sesion', async ({ page }) => {
    await page.goto('/admin')
    await expect(page).toHaveURL(/\/ingresar/)
  })

  test('un vendedor no entra a la administracion', async ({ page }) => {
    await login(page, SELLER)
    await expect(page).toHaveURL(/\/mi-empresa/)

    await page.goto('/admin')
    await expect(page).toHaveURL(/\/mi-empresa/)
  })

  test('credenciales incorrectas no revelan si el correo existe', async ({ page }) => {
    await page.goto('/ingresar')
    await page.getByTestId('login-email').fill(SELLER.email)
    await page.getByTestId('login-password').fill('clave-incorrecta')
    await page.getByTestId('login-submit').click()

    await expect(page.getByTestId('login-error')).toContainText(/correo o contrasena incorrectos/i)

    await page.getByTestId('login-email').fill('no-existe@prueba.co')
    await page.getByTestId('login-password').fill('cualquiera')
    await page.getByTestId('login-submit').click()

    await expect(page.getByTestId('login-error')).toContainText(/correo o contrasena incorrectos/i)
  })

  test('el vendedor entra a su panel y ve su empresa', async ({ page }) => {
    await login(page, SELLER)
    await expect(page).toHaveURL(/\/mi-empresa/)
    await expect(page.getByTestId('company-name')).toBeVisible()
  })

  test('cerrar sesion devuelve al estado publico @desktop', async ({ page }) => {
    await login(page, SELLER)
    // El nombre solo aparece en pantallas anchas; el boton de salir siempre esta.
    await expect(page.getByTestId('logout')).toBeVisible()

    await page.getByTestId('logout').click()
    await expect(page.getByTestId('nav-login')).toBeVisible()

    await page.goto('/mi-empresa')
    await expect(page).toHaveURL(/\/ingresar/)
  })
})

test.describe('Registro', () => {
  test('una persona natural se registra y queda con sesion', async ({ page }) => {
    await page.goto('/registro')
    await page.getByTestId('account-type-natural').click()

    await page.getByTestId('reg-name').fill('Comprador Natural Prueba')
    await page.getByTestId('reg-email').fill(uniqueEmail('natural'))
    await page.getByTestId('reg-password').fill('ClaveSegura123')
    await page.getByTestId('register-submit').click()

    await expect(page).toHaveURL(/\/buscar/)
  })

  test('el formulario de empresa calcula el digito de verificacion del NIT', async ({ page }) => {
    await page.goto('/registro')
    await page.getByTestId('reg-nit').fill('900123456')

    // 900123456 tiene digito de verificacion 8 segun la regla de la DIAN.
    await expect(page.getByTestId('digit-hint')).toContainText('es 8')
  })

  test('avisa cuando el digito de verificacion no corresponde', async ({ page }) => {
    await page.goto('/registro')
    await page.getByTestId('reg-nit').fill('900123456')
    await page.getByTestId('reg-check-digit').fill('7')

    await expect(page.getByTestId('digit-hint')).toContainText(/es 8/)
  })

  test('rechaza un NIT con digito de verificacion invalido', async ({ page }) => {
    await page.goto('/registro')

    await page.getByTestId('reg-name').fill('Responsable Prueba')
    await page.getByTestId('reg-email').fill(uniqueEmail('empresa'))
    await page.getByTestId('reg-password').fill('ClaveSegura123')
    await page.getByTestId('reg-company').fill('Empresa Prueba NIT')
    await page.getByTestId('reg-legal').fill('Empresa Prueba NIT S.A.S.')
    await page.getByTestId('reg-nit').fill('900123456')
    await page.getByTestId('reg-check-digit').fill('7')

    await page.getByTestId('register-submit').click()

    await expect(page.getByTestId('register-error')).toContainText(/digito de verificacion/i)
  })

  test('una empresa con NIT valido queda pendiente de revision', async ({ page }) => {
    await page.goto('/registro')

    await page.getByTestId('reg-name').fill('Responsable Valido')
    await page.getByTestId('reg-email').fill(uniqueEmail('valida'))
    await page.getByTestId('reg-password').fill('ClaveSegura123')
    await page.getByTestId('reg-company').fill(`Empresa Valida ${Date.now()}`)
    await page.getByTestId('reg-legal').fill('Empresa Valida S.A.S.')

    // NIT con su digito correcto.
    await page.getByTestId('reg-nit').fill(randomNit())
    const hint = await page.getByTestId('digit-hint').innerText()
    const digit = hint.match(/es (\d)/)![1]
    await page.getByTestId('reg-check-digit').fill(digit)

    await page.getByTestId('register-submit').click()

    await expect(page).toHaveURL(/\/mi-empresa/)
    await expect(page.getByText(/Verificacion pendiente/i)).toBeVisible()
  })

  test('no permite dos cuentas con el mismo correo', async ({ page }) => {
    await page.goto('/registro')
    await page.getByTestId('account-type-natural').click()

    await page.getByTestId('reg-name').fill('Duplicado Prueba')
    await page.getByTestId('reg-email').fill(SELLER.email)
    await page.getByTestId('reg-password').fill('ClaveSegura123')
    await page.getByTestId('register-submit').click()

    await expect(page.getByTestId('register-error')).toContainText(/ya existe una cuenta/i)
  })
})

test.describe('Seguridad de la api de administracion', () => {
  test('sin sesion no se puede cambiar una tarifa', async ({ request }) => {
    const res = await request.patch('/api/admin/planes/cualquiera', { data: { price: 1 } })
    expect(res.status()).toBe(401)
  })

  test('sin sesion no se puede aprobar una verificacion', async ({ request }) => {
    const res = await request.patch('/api/admin/verificaciones/cualquiera', {
      data: { decision: 'approved' },
    })
    expect(res.status()).toBe(401)
  })

  test('un vendedor autenticado no puede cambiar tarifas', async ({ page }) => {
    await login(page, SELLER)
    await expect(page).toHaveURL(/\/mi-empresa/)

    // page.request comparte las cookies del navegador; request no.
    const res = await page.request.patch('/api/admin/planes/cualquiera', { data: { price: 1 } })
    expect(res.status()).toBe(403)
  })
})

test.describe('Redireccion sin parpadeo', () => {
  test('entrar a una ruta privada no alcanza a pintar el panel', async ({ page }) => {
    const vistos: string[] = []
    await page.exposeFunction('reportarPrivado', (ruta: string) => vistos.push(ruta))
    await page.addInitScript(() => {
      const revisar = () => {
        if (document.querySelector('[data-testid="company-name"], [data-testid="kpi-grid"]')) {
          ;(window as unknown as { reportarPrivado: (r: string) => void }).reportarPrivado(
            location.pathname,
          )
        }
      }
      new MutationObserver(revisar).observe(document.documentElement, {
        childList: true,
        subtree: true,
      })
    })

    await page.goto('/mi-empresa')
    await expect(page).toHaveURL(/\/ingresar/)
    await expect(page.getByTestId('login-form')).toBeVisible()

    expect(vistos, 'se alcanzo a pintar contenido privado antes de redirigir').toEqual([])
  })

  test('la redireccion recuerda a donde iba el usuario', async ({ page }) => {
    await page.goto('/mi-empresa/contactos')
    await expect(page).toHaveURL(/destino=%2Fmi-empresa%2Fcontactos/)
  })

  test('tras ingresar aterriza en la pagina que pidio', async ({ page }) => {
    await page.goto('/mi-empresa/facturacion')
    await expect(page).toHaveURL(/\/ingresar/)

    await page.getByTestId('login-email').fill(SELLER.email)
    await page.getByTestId('login-password').fill(SELLER.password)
    await page.getByTestId('login-submit').click()

    await expect(page).toHaveURL(/\/mi-empresa\/facturacion/)
    await expect(page.getByTestId('plan-card')).toBeVisible()
  })

  test('un vendedor que pide administracion termina en su panel', async ({ page }) => {
    await page.goto('/admin/planes')
    await page.getByTestId('login-email').fill(SELLER.email)
    await page.getByTestId('login-password').fill(SELLER.password)
    await page.getByTestId('login-submit').click()

    await expect(page).toHaveURL(/\/mi-empresa/)
  })
})

test.describe('El menu refleja lo que la cuenta puede hacer', () => {
  test('un visitante no ve las secciones de cuenta @desktop', async ({ page }) => {
    await page.goto('/')

    const menu = page.getByRole('navigation', { name: 'Principal' })
    await expect(menu.getByRole('link', { name: 'Buscar' })).toBeVisible()
    await expect(menu.getByRole('link', { name: 'Categorias' })).toBeVisible()

    await expect(menu.getByRole('link', { name: 'Mi Empresa' })).toHaveCount(0)
    await expect(menu.getByRole('link', { name: 'Favoritos' })).toHaveCount(0)
    await expect(menu.getByRole('link', { name: 'Mensajes' })).toHaveCount(0)
  })

  test('a un visitante, publicar lo lleva directo al ingreso', async ({ page }) => {
    await page.goto('/')
    await expect(page.getByTestId('nav-publish')).toHaveAttribute('href', /\/ingresar/)

    await page.getByTestId('nav-publish').click()
    await expect(page).toHaveURL(/\/ingresar\?destino=%2Fpublicar/)
    await expect(page.getByTestId('login-form')).toBeVisible()
  })

  test('con sesion aparecen las secciones de cuenta @desktop', async ({ page }) => {
    await login(page, SELLER)

    const menu = page.getByRole('navigation', { name: 'Principal' })
    await expect(menu.getByRole('link', { name: 'Mi Empresa' })).toBeVisible()
    await expect(menu.getByRole('link', { name: 'Favoritos' })).toBeVisible()
    await expect(menu.getByRole('link', { name: 'Mensajes' })).toBeVisible()
    await expect(page.getByTestId('nav-publish')).toHaveAttribute('href', '/publicar')
  })

  test('el menu movil tampoco ofrece secciones de cuenta al visitante @mobile', async ({ page }) => {
    await page.goto('/')
    await page.getByRole('button', { name: /abrir menu/i }).click()

    const cajon = page.getByTestId('mobile-menu')
    await expect(cajon.getByRole('link', { name: 'Buscar' })).toBeVisible()
    await expect(cajon.getByRole('link', { name: 'Mi Empresa' })).toHaveCount(0)
    await expect(cajon.getByRole('link', { name: 'Ingresar' })).toBeVisible()
  })

  test('el pie lleva al ingreso cuando no hay sesion', async ({ page }) => {
    await page.goto('/')
    const publicar = page.getByTestId('site-footer').getByRole('link', { name: 'Publicar' })
    await expect(publicar).toHaveAttribute('href', /\/ingresar/)
  })
})
