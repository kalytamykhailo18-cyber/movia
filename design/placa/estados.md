# MOVIA · Dirección "La Placa" · Estados y valores

Valores exactos, no aproximados. Todos salen de `tokens.css` y están
implementados en `placa.css`, así que se pueden leer del DOM de las maquetas en
lugar de deducirlos de una captura.

El encargo pide esto literalmente: *"exact colour, size, spacing, and the hover,
focus and disabled states. The front end is token-driven, so real numbers go
straight in."*

**Convenciones que valen para todo el documento**

- Transición de color: `120 ms linear`. Transición de borde o sombra de tarjeta:
  `200 ms linear`. Zoom de fotografía: `420 ms cubic-bezier(0.16, 1, 0.3, 1)`.
- `prefers-reduced-motion: reduce` lleva las tres duraciones a `0.01 ms`.
- El foco nunca usa el contorno del navegador. Siempre halo.
  - Sobre claro: `0 0 0 3px rgba(37, 99, 235, 0.2)`
  - Sobre navy: `0 0 0 3px rgba(96, 165, 250, 0.32)`
- Altura táctil mínima `44 px` en todo control. Cero incumplimientos medidos a
  1280 px y a 412 px.
- Ningún estado se comunica sólo con color: todos llevan texto o forma.

---

## 0. Relleno interior, un valor por tipo de superficie

No se declara relleno por componente sino por **tipo de superficie**, con tres
tokens. Así dos tarjetas distintas no pueden acabar con rellenos distintos.

| Token | Escritorio | Móvil (≤640 px) | Dónde |
|---|---|---|---|
| `--pad-placa` | `16 px` | `12 px` | Interior de placa, fila de documento |
| `--pad-panel` | `24 px` | `16 px` | Panel, índice, registro, placa mayor |
| `--pad-fila` | `12 px` | `12 px` | Celda de tabla, pie de placa, aviso |

El ajuste de móvil se hace **una sola vez**, redefiniendo los tokens en `:root`
dentro de la media query. Ningún componente lleva su propia excepción.

---

## 1. Botones

Base común: `min-height 44 px`, `border-radius 8 px`, `padding-inline 16 px`,
`font-size 13 px`, `font-weight 600`, `line-height 1`, `border 1px solid`.

Variante grande: `min-height 52 px`, `padding-inline 24 px`, `font-size 17 px`.

### Principal (azul)

| Estado | Fondo | Texto | Borde |
|---|---|---|---|
| Reposo | `#2563EB` | `#FFFFFF` | transparente |
| Hover | `#1D4ED8` | `#FFFFFF` | transparente |
| Activo | `#1E40AF` | `#FFFFFF` | transparente |
| Foco | `#2563EB` | `#FFFFFF` | halo `rgba(37, 99, 235, 0.2)` |
| Deshabilitado | `#93B4F5` | `#EFF6FF` | `cursor: not-allowed` |
| Cargando | `#2563EB` | etiqueta visible, giro de 16 px en lugar del icono | `cursor: progress` |

### Contorno, sobre navy

Un botón blanco taparía la banda, así que sobre navy el secundario es de línea.

| Estado | Fondo | Texto | Borde |
|---|---|---|---|
| Reposo | transparente | `#FFFFFF` | `1px #273142` |
| Hover | transparente | `#FFFFFF` | `1px #60A5FA` |
| Foco | transparente | `#FFFFFF` | halo `rgba(96, 165, 250, 0.32)` |

### Claro, sobre fondo claro

| Estado | Fondo | Texto | Borde |
|---|---|---|---|
| Reposo | `#FFFFFF` | `#111827` | `1px #D1D5DB` |
| Hover | `#FFFFFF` | `#111827` | `1px #111827` |
| Deshabilitado | `#FFFFFF` | `#9CA3AF` | `1px #E5E7EB`, `cursor: not-allowed` |

### WhatsApp

| Estado | Fondo | Texto |
|---|---|---|
| Reposo | `#16A34A` | `#FFFFFF` |
| Hover | `#15803D` | `#FFFFFF` |

El glifo es el de la marca WhatsApp, sólido, `fill="currentColor"`, y **no**
pertenece a la familia lineal.

### Peligro

Definido por el manual, no aparece en estas dos pantallas: fondo `#DC2626`,
texto `#FFFFFF`, hover `#B91C1C`.

---

## 2. La consola de consulta

Es el instrumento principal del producto, así que es el objeto más brillante de
la banda.

| Elemento | Valor |
|---|---|
| Superficie | `#1A2334`, borde `1px #31405A`, radio `12 px`, relleno `16 px` |
| Sombra | `0 24px 48px rgba(0, 0, 0, 0.42)` |
| Campo | **fondo `#FFFFFF`**, alto `52 px`, radio `8 px`, relleno lateral `16 px` |
| Texto del campo | `17 px`, `#111827` |
| Marcador de posición | `#6B7280` |
| Campo en foco | borde `1px #2563EB` más halo `rgba(96, 165, 250, 0.32)` |
| Botón | `#2563EB`, alto `52 px`, relleno lateral `32 px` |

**Por qué el campo es claro.** Con el campo en `#111827` dentro de una consola
`#1A2334` sobre suelo `#111827` el buscador se fundía con el fondo. Un campo
iluminado dentro de un panel oscuro es como se ve un instrumento real: arregla
el contraste sin renunciar a la idea.

### Filtro de la consulta

| Estado | Fondo | Texto | Borde |
|---|---|---|---|
| Reposo | transparente | `#CBD5E1` | `1px #273142` |
| Hover | transparente | `#FFFFFF` | `1px #60A5FA` |

Alto mínimo `44 px`, radio `8 px`, etiqueta a `10 px / 0.08em`, valor a `13 px`.
El valor se trunca antes que la etiqueta si falta sitio.

En escritorio, cuatro columnas iguales. En teléfono, barra desplazable en
horizontal: a dos columnas "Colombia" se cortaba y a una la consola se volvía
una torre.

### Lectura del instrumento

| Elemento | Valor |
|---|---|
| Rejilla | 4 celdas en escritorio, 2 en móvil |
| Separador | `1px #273142` a la izquierda de cada celda salvo la primera |
| Etiqueta | `11 px / 600`, versalita, `letter-spacing 0.16em`, `#8FA0B8` |
| Cifra | `26 px / 800`, `tabular-nums`, `letter-spacing -0.04em`, **`#60A5FA`** |

---

## 3. La placa (tarjeta de publicación)

| Estado | Borde | Sombra | Fotografía |
|---|---|---|---|
| Reposo | `1px #E5E7EB` | `0 1px 2px rgba(17, 24, 39, 0.04)` | `scale(1)` |
| Hover | `1px #BFDBFE` | `0 10px 30px rgba(17, 24, 39, 0.09)` | `scale(1.03)` en 420 ms |
| Foco | igual que hover | igual que hover | `scale(1)` |

Interior:

| Elemento | Valor |
|---|---|
| Fondo | `#FFFFFF`, radio `12 px` |
| Fotografía | relación `4/3`, `object-fit: cover` |
| Modelo | `17 px / 700`, `line-height 1.3`, `letter-spacing -0.025em`, 2 líneas máximo |
| Fila de dato | alto mínimo `30 px`, filete inferior `1px #E5E7EB` |
| Etiqueta del dato | `11 px / 600`, versalita, `0.16em`, `#6B7280` |
| Valor del dato | `13 px / 600`, `tabular-nums`, `#111827`, alineado a la derecha |
| Precio | `26 px / 800`, `tabular-nums`, `letter-spacing -0.04em`, `#111827` |
| Pie de vendedor | fondo `#F8FAFC`, filete superior `1px #E5E7EB`, relleno `12px 16px` |

El enlace del modelo ocupa la caja completa del título (`min-height 2.6em`). Sin
eso, un título de una línea deja un área táctil de 21 px, la mitad del mínimo.

### La chapa

La referencia y la condición remachadas sobre la foto, que es exactamente lo que
lleva grabada una placa real.

| Variante | Fondo | Texto |
|---|---|---|
| Normal | `#111827` | `#FFFFFF`, separador `#60A5FA` |
| Destacada | `#2563EB` | `#FFFFFF`, separador `#BFDBFE` |

Alto `26 px`, `11 px / 600`, `letter-spacing 0.1em`, versalita, `tabular-nums`,
esquina superior derecha redondeada `8 px`, anclada abajo a la izquierda.

### Placa destacada

Mismo borde y radio. Cambia el formato: dos columnas, `240 px` de fotografía más
el cuerpo (`124 px` en móvil), modelo a `20 px`, precio a `30 px`, y cuatro filas
de datos en lugar de dos.

Ocupa aproximadamente el doble de superficie que una normal. Ése es el argumento
de venta del plan destacado.

---

## 3b. La marca de sección

La barra azul que ya usa el build actual, conservada y ampliada.

| Sitio | Valor |
|---|---|
| Cabecera de sección | `4 px` de ancho, radio `999 px`, `#2563EB`, abarca el bloque completo (epígrafe más título), `3 px` de margen arriba y abajo, texto desplazado `16 px` |
| Título de panel en la ficha | `4 px` de ancho, alto `1.05em`, radio `999 px`, `#2563EB`, centrada verticalmente, texto desplazado `12 px` |

En la cabecera de sección abarca el bloque entero en lugar de centrarse sólo en
el título: marca la sección completa y no una línea suelta. En los paneles de la
ficha se mantiene el tratamiento original, centrado sobre un título de una línea.

---

## 3c. Última publicación

Ficha en vivo a la derecha de la banda. Ese hueco sólo tenía la marca de agua, y
una publicación real ahí demuestra de un vistazo que el catálogo se mueve.

| Elemento | Valor |
|---|---|
| Superficie | `#1A2334`, borde `1px #273142`, radio `12 px`, relleno `24 px` |
| Ancho de columna | `316 px`, alineada al pie de la consola |
| Epígrafe | `11 px / 600` versalita `0.16em`, `#60A5FA` |
| Modelo | `15 px / 700`, `#FFFFFF` |
| Fila de dato | alto mínimo `30 px`, filete `1px #273142` |
| Precio | `22 px / 800`, `tabular-nums`, `#FFFFFF` |

Sin fotografía a propósito: es una placa de datos, que es de lo que va este
producto, y evita un tercer plano técnico en la misma pantalla.

Por debajo de `1100 px` se retira. Es información complementaria, así que
desaparece en vez de encoger la consola.

---

## 4. Índice de categorías

Va dentro de un panel propio: sobre el fondo de la página el texto suelto se leía
como contenido, no como control.

| Elemento | Valor |
|---|---|
| Panel | `#FFFFFF`, borde `1px #E5E7EB`, radio `12 px` |
| Fila | alto mínimo `64 px`, relleno lateral `24 px`, filete `1px #E5E7EB` |
| Glifo | `32 × 32 px`, radio `8 px`, fondo `#EFF6FF`, icono `#2563EB` |
| Nombre | `15 px / 600`, `#111827` |
| Conteo | `15 px / 700`, `tabular-nums`, `#111827` |
| Cheurón | `15 px`, `#B6C2D4` |

| Estado | Fila | Glifo | Cheurón |
|---|---|---|---|
| Reposo | `#FFFFFF` | fondo `#EFF6FF` | `#B6C2D4` |
| Hover | fondo `#EFF6FF` | fondo `#DBEAFE` | `#2563EB`, `translateX(2px)` |

Dos columnas en escritorio con filete vertical entre ellas, una en teléfono.

---

## 5. Registro de empresas

| Elemento | Valor |
|---|---|
| Cabecera | `11 px / 600` versalita `0.16em`, `#6B7280`, fondo `#F8FAFC` |
| Celda | relleno `12px 24px`, filete `1px #E5E7EB`, `13 px` |
| Sigla | `34 × 34 px`, radio `8 px`, fondo `#111827`, texto `#FFFFFF` `13 px / 700` |
| Cifras | alineadas a la derecha, `tabular-nums`, `700`, `#111827` |
| Fila en hover | fondo `#EFF6FF` |

En teléfono la tabla se pliega: cada empresa pasa a bloque y la línea de meta
sustituye a las columnas. En escritorio esa línea va oculta, porque si no repite
ciudad, publicaciones y respuesta tres veces.

---

## 6. Sellos y estados de publicación

| Sello | Fondo | Texto |
|---|---|---|
| Empresa verificada | `#DBEAFE` | `#1E40AF` |
| Activa | `#DCFCE7` | `#15803D` |
| Neutro (Top seller, Respuesta rápida, Retirada, Vendida) | `#E5E7EB` | `#374151` |
| En espera (Vencida, Pendiente) | `#FEF3C7` | `#B45309` |
| Sobre navy | `rgba(96, 165, 250, 0.16)` | `#BFDBFE` |

Alto `24 px`, radio `999 px`, `11 px / 600`, `letter-spacing 0.04em`.

**Persona natural** no lleva sello ni icono. Se nombra en texto, `#6B7280` peso
500, para que la diferencia con una empresa verificada sea evidente sin
inventarle un distintivo propio.

---

## 7. Navegación

| Estado | Color | Peso |
|---|---|---|
| Reposo | `#8FA0B8` | 500 |
| Hover | `#FFFFFF` | 500 |
| Activo | `#FFFFFF` | 600 |

Alto `44 px`, radio `8 px`. Barra `#111827` con filete inferior `1px #273142`.

**La marca.** En la barra va el isotipo solo, sobre placa clara de `44 × 44 px`,
radio `8 px`, isotipo a `30 px`. En el pie va el lockup completo sobre placa
clara con relleno `12 px`, logo a `52 px` de alto. En ningún sitio se recolorea:
medido, el 54 % del archivo es `#0C1830`/`#182430`, que sobre `#111827` da
`1.0:1`, y el manual prohíbe alterar los colores institucionales.

Zona de protección: el punto superior del isotipo mide `11,9 %` del alto del
logo, así que a `30 px` el mínimo del manual son `4 px`. La placa usa `7 px`.

---

## 8. Galería

| Elemento | Valor |
|---|---|
| Imagen principal | relación `4/3`, borde `1px #E5E7EB`, radio `12 px` |
| Contador | `rgba(17, 24, 39, 0.85)`, texto `#FFFFFF` `11 px / 600` tabular, alto `26 px`, radio `999 px` |
| Flecha | `44 × 44 px`, radio `999 px`, fondo `rgba(255,255,255,0.94)`, borde `1px #E5E7EB`; hover borde `#111827` |
| Ampliar | `44 × 44 px`, radio `8 px`, mismo fondo y borde |
| Miniatura | `82 px` de ancho (`64 px` en móvil), relación `4/3`, radio `8 px` |
| Miniatura activa | borde `1px #2563EB` más `box-shadow 0 0 0 1px #2563EB` |

La miniatura activa se marca con borde y sombra, no sólo con color.

---

## 9. La placa mayor (ficha)

El momento firma de la ficha: la placa definitiva del activo, en navy, con el
precio como cifra viva.

| Elemento | Valor |
|---|---|
| Superficie | `#111827`, borde `1px #273142`, radio `12 px` |
| Etiqueta "Precio" | `11 px / 600` versalita `0.16em`, `#8FA0B8` |
| Precio | `40 px / 800`, `tabular-nums`, `letter-spacing -0.04em`, `#FFFFFF` |
| Nota de IVA | `11 px`, `#8FA0B8` |
| Fila de dato | alto mínimo `34 px`, filete `1px #273142` |
| Valor del dato | `13 px / 600`, `tabular-nums`, `#FFFFFF`, a la derecha |
| Bloque de contacto | fondo `#1A2334`, filete superior `1px #273142`, relleno `24 px` |

En teléfono esta pieza sube justo debajo de la galería, antes de la descripción:
es la conversión de la página y al final quedaba a cuatro pantallas de scroll.

---

## 10. Ficha técnica

| Elemento | Valor |
|---|---|
| Texto | `13 px` |
| Celda | relleno `12px 24px` |
| Etiqueta | `11 px / 600` versalita `0.16em`, `#6B7280`, a la izquierda, ancho `46 %` |
| Valor | `600`, `#111827`, `tabular-nums`, a la derecha |
| Separador | `1px #E5E7EB` entre filas, ninguno en la última |
| Fila impar | fondo `#F8FAFC` |
| Ancho | sangra hasta el borde de la tarjeta (`margen lateral -24 px`) |

Valor a la derecha y tabulado para que dos publicaciones abiertas en dos pestañas
se comparen línea a línea.

---

## 11. Documentos

| Estado | Borde | Texto |
|---|---|---|
| Reposo | `1px #E5E7EB` | `#111827` |
| Hover | `1px #2563EB` | `#2563EB` |

Alto mínimo `44 px`, radio `8 px`, relleno lateral `16 px`, icono `#2563EB`.

---

## 12. Campos de formulario

No aparecen en estas dos pantallas, pero la regla queda fijada para publicar,
registro e ingreso.

| Estado | Borde | Sombra |
|---|---|---|
| Reposo | `1px #E5E7EB` | ninguna |
| Foco | `1px #2563EB` | `0 0 0 3px rgba(37, 99, 235, 0.2)` |
| Error | `1px #DC2626` | `0 0 0 3px rgba(220, 38, 38, 0.16)` |
| Deshabilitado | `1px #E5E7EB`, fondo `#F8FAFC` | ninguna |

Radio `8 px`, alto mínimo `44 px`, etiqueta siempre visible. El error se acompaña
siempre de texto a `13 px` en `#DC2626`: el manual prohíbe depender sólo del
color.

---

## 13. El plano

Estado permanente del producto, no un recurso de maqueta: siempre habrá
publicaciones sin foto.

| Propiedad | Valor |
|---|---|
| Fondo con categoría | `#EFF6FF` con retícula de `1px` en `rgba(37, 99, 235, 0.07)` cada `16 px` |
| Fondo sin foto | `#F8FAFC` con retícula en `rgba(17, 24, 39, 0.05)` |
| Glifo | `30 %` del ancho (`46 %` en placa destacada, `22 %` en galería grande) |
| Aviso "Sin fotografía" | `11 px / 600`, `0.08em`, arriba a la derecha |

---

## 14. El subrayado del claim

"Muévelo" va en `#60A5FA` con el trazo a mano que ya usa el build actual. Se
conserva tal cual por decisión del cliente.

| Propiedad | Valor |
|---|---|
| Color | `#2563EB` |
| Grosor | `4` |
| Extremos | redondeados |
| Trazado | `M2 9 C 50 3, 150 3, 198 8` en un `viewBox` de `200 × 12` |
| Escalado | `preserveAspectRatio: none`, ancho `100 %`, alto `10 px` |
| Posición | `-4 px` respecto a la línea base de la palabra |

Queda anotado que el trazo mide `3.43:1` sobre el navy y `2.03:1` contra la
propia palabra, así que es un elemento de bajo contraste. Es decorativo, no
transporta información, y ningún dato depende de él. Si en algún momento se
quiere que se lea con más fuerza, subirlo a `#3B82F6` lo lleva a `4.82:1` sin
cambiar el gesto.

---

## 14b. Entrada

Una sola secuencia orquestada al cargar, no efectos sueltos por la página.

| Propiedad | Valor |
|---|---|
| Recorrido | `opacity 0 → 1`, `translateY 10px → 0` |
| Duración | `420 ms`, `cubic-bezier(0.16, 1, 0.3, 1)` |
| Escalonado | `70 ms` entre pasos |
| Pasos | epígrafe, titular, entradilla, consola, y la última publicación a `280 ms` |

Nada más se anima al cargar. Con `prefers-reduced-motion: reduce` la animación
se desactiva por completo, no se acelera.

---

## 14c. Puntos de corte

Cada componente se pliega cuando deja de caber, no en un punto redondo elegido
a ojo. Los tres primeros salen de medir el ancho mínimo real del contenido.

| Corte | Qué cambia | Por qué ahí |
|---|---|---|
| `1200 px` | La placa destacada pasa a una columna | Es apaisada: foto de 240 px más cuerpo. A dos columnas a 1100 px al cuerpo le quedaban 238 px y necesita 282, así que el precio se salía de la tarjeta |
| `1100 px` | Se retira la última publicación de la banda | Es complementaria: desaparece en vez de estrechar la consola |
| `1024 px` | La ficha pasa a una columna, el catálogo a dos | La columna lateral de 372 px deja de caber |
| `860 px` | La barra colapsa a menú | Logo, cuatro secciones, Ingresar y Publicar necesitan unos 630 px. Colapsando sólo por debajo de 640 se salía de la ventana entre 641 y 680 |
| `768 px` | El registro se pliega a bloques | La tabla no baja de 647 px de ancho de contenido |
| `640 px` | Teléfono: rellenos, tarjeta apaisada, filtros desplazables, barra de contacto fija | |

Comprobado sin desbordamiento ni incumplimientos táctiles a `360`, `412`,
`641`, `768`, `772`, `861`, `900`, `1023`, `1100`, `1201` y `1280 px`.

---

## 15. Contraste, medido

| Par | Ratio | |
|---|---|---|
| `#FFFFFF` sobre `#111827` | 17.74:1 | |
| `#93C5FD` sobre `#111827` | 9.84:1 | |
| `#8FA0B8` sobre `#111827` | 7.4:1 | texto secundario sobre navy |
| `#60A5FA` sobre `#111827` | 6.98:1 | la cifra viva |
| `#3B82F6` sobre `#111827` | 4.82:1 | alternativa para el subrayado |
| `#2563EB` sobre `#111827` | 3.43:1 | **no se usa para texto sobre navy**; sí para el subrayado, que es decorativo |

Ésa última fila es la razón de que exista `--lectura`. El azul de marca no pasa
AA sobre el navy de marca, y el manual no da ningún valor para resolverlo.

---

## 16. Comprobado en las maquetas

Medido en el DOM, no estimado:

| Comprobación | 1280 px | 412 px |
|---|---|---|
| Controles por debajo de 44 px | 0 | 0 |
| Desbordamiento horizontal | 0 px | 0 px |
| Valores truncados en los filtros | 0 | 0 |
| Variables CSS usadas sin definir | 0 | 0 |
| Alto del inicio | 3.408 px | 5.354 px |
| Alto de la ficha | 2.758 px | 4.253 px |
| Barras de sección presentes | 4 inicio + 1 ficha | idem |
| Barras de panel en la ficha | 3 | 3 |

Referencia del build actual: inicio `3.253 px` a 1280 y **`9.040 px`** a 412.
