import { expect, type Page, type Locator } from '@playwright/test'

/**
 * Recorre las paginas de un listado hasta encontrar la fila buscada.
 * Los listados estan paginados, asi que lo buscado no tiene por que estar
 * en la primera pagina.
 */
export async function buscarEnListado(
  page: Page,
  ruta: string,
  fila: (page: Page) => Locator,
): Promise<boolean> {
  await page.goto(ruta)

  for (let intento = 0; intento < 20; intento++) {
    if ((await fila(page).count()) > 0) return true

    const siguiente = page.getByTestId('pagination-next')
    if ((await siguiente.count()) === 0) return false
    if (await siguiente.isDisabled()) return false

    await siguiente.click()
    await expect(page.getByTestId('pagination')).toBeVisible()
    await page.waitForLoadState('networkidle')
  }

  return false
}
