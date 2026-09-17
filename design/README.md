# design/

Propuesta de identidad visual para **Inicio** y **Ficha de publicación**, a
1280 px y 412 px.

Esta carpeta es una propuesta, no código de producción. No la importa nada de
`src/` y no afecta al build ni a las pruebas.

## Contenido

```
tokens/movia-tokens.css        Tokens definitivos. Entran en src/app/globals.css al aprobarse.
mockups/inicio.html            Maqueta del inicio, responsive.
mockups/ficha.html             Maqueta de la ficha, responsive.
mockups/mockup.css             Hoja de las maquetas. CSS plano, valores legibles sin traducir.
spec/decisiones-de-diseno.md   Qué cambia, por qué, y dónde contradice al manual.
spec/estados-de-componentes.md Valores exactos de hover, foco, deshabilitado y carga.
```

## Cómo verlas

Las maquetas cargan el logo desde `public/brand/`, así que necesitan servirse
desde la raíz del repositorio:

```bash
python3 -m http.server 8899
```

Luego abrir:

- http://127.0.0.1:8899/design/mockups/inicio.html
- http://127.0.0.1:8899/design/mockups/ficha.html

Revisar a 1280 px de ancho y a 412 px. Son un solo archivo responsive por
pantalla, no cuatro archivos: así el corte entre escritorio y móvil es el mismo
que tendrá el producto.

## Por dónde empezar a leer

1. `spec/decisiones-de-diseno.md`, sección 1, para ver por qué el build actual
   cumple el manual y aun así se lee genérico.
2. Las dos maquetas en el navegador.
3. `spec/decisiones-de-diseno.md`, sección 4, que es la parte que hay que hablar
   con el cliente: los cuatro puntos donde la propuesta contradice el manual.

## Pendiente del cliente

- Versión clara del logo, para fondos oscuros. El manual la exige y no está
  entre los archivos suministrados.
- Logo con el descriptor `MARKETPLACE DE ACTIVOS EMPRESARIALES`, que el manual
  define como parte del logo completo.
- Los dos anteriores en SVG si es posible.
- Fotografía real del catálogo. Hoy todo apunta a `/api/placeholder`.

## Si se aprueba

Fase 2: llevar los tokens a `src/app/globals.css` y aplicar la dirección a los
componentes reales (`hero-search`, `publication-card`, `category-grid`,
`gallery`, `contact-panel`, `site-header`, `site-footer` y la ficha). Las
maquetas ya respetan todo lo que comprueba `tests/e2e/design.spec.ts`, así que
la suite no debería moverse.
