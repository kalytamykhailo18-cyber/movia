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
  maxPaginas = 40,
): Promise<boolean> {
  await page.goto(ruta)

  for (let intento = 0; intento < maxPaginas; intento++) {
    if ((await fila(page).count()) > 0) return true

    const siguiente = page.getByTestId('pagination-next')
    if ((await siguiente.count()) === 0) return false
    if (await siguiente.isDisabled()) return false

    // La paginacion anterior sigue en pantalla mientras navega, asi que
    // esperar a que "este visible" daria por buena la lista vieja. Se espera
    // a que el rango mostrado cambie, que solo ocurre con la lista nueva.
    const rangoPrevio = await page.getByTestId('pagination-range').innerText()
    await siguiente.click()
    await expect(page.getByTestId('pagination-range')).not.toHaveText(rangoPrevio)
  }

  return false
}
