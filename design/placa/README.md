# Dirección "La Placa"

Propuesta de identidad partiendo de cero, sin heredar nada del build actual.
Inicio y ficha, a 1280 px y 412 px.

```bash
python3 -m http.server 8899     # desde la raíz del repositorio
```

- http://127.0.0.1:8899/design/placa/inicio.html
- http://127.0.0.1:8899/design/placa/ficha.html

---

## La idea

Toda máquina industrial lleva remachada una **placa de características**:
marca, modelo, año, potencia, voltaje. Mayúscula corta, cifras tabuladas,
etiqueta a la izquierda y valor a la derecha. Es el artefacto que define este
oficio y la única fuente de verdad sobre qué es una máquina.

**Aquí cada publicación es una placa.** Ése es el elemento firma y se repite
en las dos pantallas: en el catálogo como tarjeta y en la ficha a tamaño real.

No es un recurso que se pueda trasplantar a otro marketplace, que es
exactamente lo que se le pedía a esta propuesta.

## Cómo se traduce la referencia del cliente

Su referencia es una app de vida nocturna: oscuro, acento de neón, mucha
personalidad. En un catálogo de maquinaria el equivalente honesto del neón no
es la luz de discoteca, es **la lectura del instrumento**: la cifra que brilla
en un panel de control oscuro.

De ahí salen las dos decisiones grandes:

1. **El navy es el marco del producto**, no un bloque del hero. Barra, banda,
   identidad de la ficha, placa del precio y pie. El manual, sección 4, asigna
   el navy justamente a "estructura, encabezados, navegación y footer": una
   barra navy cumple el manual **más** de cerca que una blanca.
2. **Un solo color vivo con un solo oficio.** `#60A5FA` aparece únicamente en
   cifras y datos sobre navy. Nada más brilla.

## Las reglas fijas, intactas

| Regla | Cómo se cumple |
|---|---|
| Logo suministrado, sin redibujar la M | Se usa el archivo tal cual, sin recolorear. Ver más abajo |
| Paleta cerrada, sin naranja | Los nueve valores del encargo. Los derivados son ese mismo navy aclarado con blanco, nunca más oscuro que `#111827` |
| Inter | Única familia. El carácter sale de cómo se usa, no de cambiarla |
| Área táctil 44 px | Cero incumplimientos, medido en el DOM a 1280 y a 412 |
| Funciona a 412 px | Cero desbordamiento horizontal |

## La marca sobre navy

Medido sobre el archivo suministrado: el **54 %** del logo es `#0C1830` /
`#182430`, que sobre `#111827` da **1.0:1**. Más de la mitad de la marca, el
wordmark completo incluido, desaparece. Sólo el trazo azul `#1878F0` sobrevive,
a 4.21:1.

Recolorear con un filtro lo hace visible pero altera los colores
institucionales, que la sección 3 del manual lista como uso incorrecto. Así que
no se hace.

La salida está en el propio manual, sección 2:

| Sitio | Qué se usa | Regla que lo respalda |
|---|---|---|
| Barra de navegación | Isotipo solo, sobre placa clara de 44 × 44 px | *"en tamaños menores, utilizar el isotipo"*. En una barra de 64 px el lockup se pinta a 43 px de ancho y el wordmark queda en 8 px de alto |
| Pie | Lockup completo sobre placa clara | Hay sitio, así que la palabra se lee |

**Zona de protección.** El punto superior del isotipo mide 19 px en un logo de
160 px, es decir el 11,9 % del alto. Con el isotipo a 30 px el mínimo del manual
son 4 px; la placa usa 7 px por cada lado.

La placa clara no es un parche: en esta dirección todo es una placa, así que la
marca teniendo la suya es coherente. Y en la barra mide exactamente 44 px, que
es el área táctil mínima.

**Sigue haciendo falta la versión clara del logo.** El manual la promete en la
sección 2 y no está entre los archivos. Con ella, la marca iría directa sobre el
navy y la placa sobraría.

## Tipografía: una familia, tres voces

Inter es fija, así que no hay pareja display más texto. La personalidad sale
del uso:

| Voz | Valores | Dónde |
|---|---|---|
| Placa | 800, hasta 56 px, `letter-spacing: -0.04em` | Titular y modelo del activo |
| Dato | 600–700 con `tabular-nums` y cero cortado | Toda cifra |
| Etiqueta | 600, 11 px, mayúscula, `letter-spacing: 0.16em` (10 px / 0.08em dentro de los filtros) | Encima de cada dato |

El salto 800 contra 400 es el que hace el trabajo. La mayoría de plantillas se
quedan en 600/400 y por eso se parecen entre sí. El cero cortado y las cifras
tabulares van encendidos en todo el documento con `font-feature-settings`.

## Lo que se evitó a propósito

| Respuesta de plantilla | Qué se hizo |
|---|---|
| Tres cifras gigantes flotando en el hero | La lectura del instrumento, dentro de la consola de búsqueda y separada por filetes |
| Ocho tarjetas de categoría con icono | Un índice tipográfico de catálogo de repuestos |
| Foto grande con texto suelto debajo | La foto lleva remachada la referencia; debajo va la tabla de datos |
| Cuatro tarjetas de empresa con párrafo recortado | Un padrón, con columnas y cifras |
| Campo de búsqueda blanco flotando | Una consola de consulta con los filtros que este oficio necesita |

## El estado sin fotografía, diseñado

No hay fotografía del catálogo: todo apunta a un marcador. En vez de dejar un
hueco gris, el hueco se dibuja como **plano técnico**, retícula fina en azul de
marca con el glifo de la categoría en trazo. Resuelve la maqueta y resuelve un
estado que el producto va a tener siempre, porque habrá vendedores que
publiquen sin foto.

## Medido, no estimado

| | 1280 px | 412 px |
|---|---|---|
| Controles bajo 44 px | 0 | 0 |
| Desbordamiento horizontal | 0 px | 0 px |
| Valores truncados en los filtros | 0 | 0 |
| Alto del inicio | 3.408 px | 5.354 px |
| Alto de la ficha | 2.758 px | 4.253 px |

Referencia del build actual: inicio 3.253 px a 1280 y **9.040 px** a 412.

En teléfono la ficha coloca el precio y el contacto justo debajo de la galería,
antes de la descripción: son la conversión de la página.

## Correcciones de la primera revisión

Tres cosas fallaban y las tres eran de bulto:

1. **Las cifras no se veían.** Por evitar el bloque de tres números gigantes
   las había dejado en 13 px sueltas bajo la banda, y dejaron de existir.
   Ahora son la lectura del instrumento: dentro de la consola, 26 px, azul de
   lectura, separadas por filetes. Presentes, pero siguen sin ser un bloque
   de marketing porque describen el corpus sobre el que se busca.
2. **El buscador se fundía con el fondo.** Consola `#1A2334` sobre suelo
   `#111827` con el campo también en `#111827`: camuflaje. El campo pasa a
   blanco y la consola gana sombra y filete más claro. Un campo iluminado
   dentro de un panel oscuro es justo como se ve un instrumento real, así que
   el contraste se arregla sin renunciar a la idea.
3. **Las categorías parecían texto suelto.** Sobre el fondo de la página no
   había nada que dijera "esto se pulsa" hasta pasar el ratón. El índice pasa
   a panel propio con superficie blanca, glifo, cifra tabulada y cheurón por
   fila.

De paso: los filtros se alinean en cuatro columnas iguales en escritorio y en
barra desplazable en teléfono, donde a dos columnas "Colombia" se cortaba.

Y dos más de la segunda vuelta:

4. **La marca ya no se recolorea.** Ver la sección de arriba.
5. **La llamada final deja de ser una caja centrada.** Todo en esta página está
   alineado a la izquierda y tabulado; una caja centrada era lo único que no
   seguía esa ley, y además es la forma de cierre de cualquier plantilla. Pasa a
   dos columnas, con el argumento a la izquierda y la acción a la derecha.

## Lo que hay que hablar con el cliente

1. **La barra navy.** Es el cambio que más se nota. El manual lo respalda, pero
   es una decisión suya.
2. **Sigue faltando la versión clara del logo**, que evitaría las placas claras,
   y la versión con descriptor que el manual define como logo completo. Tampoco
   hay SVG.
3. **Sigue faltando fotografía real.** Ninguna dirección se puede cerrar del
   todo hasta que existan imágenes.
4. Si se aprueba, esta dirección **rompe dos pruebas** de
   `tests/e2e/design.spec.ts`: la que exige encabezado blanco opaco y la que
   comprueba que la primera sección del inicio es navy. Habría que moverlas a
   conciencia, no saltárselas.
