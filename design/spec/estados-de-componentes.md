# MOVIA · Estados de componentes

Valores exactos. Todos salen de `design/tokens/movia-tokens.css` y están
implementados en `design/mockups/mockup.css`, así que se pueden leer del DOM de
las maquetas en vez de deducirlos de una captura.

Convenciones:

- Toda transición de color usa `120ms linear`. Toda transición de sombra o
  borde de tarjeta usa `200ms linear`. El zoom de fotografía usa
  `400ms cubic-bezier(0.16, 1, 0.3, 1)`.
- `prefers-reduced-motion: reduce` lleva las tres duraciones a `0.01ms`.
- Altura táctil mínima `44px` en todo control. Verificado en las dos maquetas a
  1280 px y a 412 px: cero incumplimientos.
- El foco nunca usa el contorno del navegador. Siempre halo.

---

## 1. Botones

Base común: `min-height: 44px`, `border-radius: 8px`, `padding-inline: 16px`,
`font-size: 14px`, `font-weight: 600`, `line-height: 1`, `border: 1px solid`.

### Principal

| Estado | Fondo | Texto | Borde |
|---|---|---|---|
| Reposo | `#2563EB` | `#FFFFFF` | transparente |
| Hover | `#1D4ED8` | `#FFFFFF` | transparente |
| Activo | `#1E40AF` | `#FFFFFF` | transparente |
| Foco | `#2563EB` | `#FFFFFF` | halo `0 0 0 3px rgba(37, 99, 235, 0.18)` |
| Deshabilitado | `#93B4F5` | `#EFF6FF` | transparente, `cursor: not-allowed` |
| Cargando | `#2563EB` | etiqueta visible, giro de 16 px en lugar del icono | `cursor: progress` |

### Secundario

| Estado | Fondo | Texto | Borde |
|---|---|---|---|
| Reposo | `#FFFFFF` | `#111827` | `1px #D1D5DB` |
| Hover | `#FFFFFF` | `#111827` | `1px #111827` |
| Foco | `#FFFFFF` | `#111827` | halo `0 0 0 3px rgba(37, 99, 235, 0.18)` |
| Deshabilitado | `#FFFFFF` | `#9CA3AF` | `1px #E5E7EB`, `cursor: not-allowed` |

El borde `#D1D5DB` no es capricho: `tests/e2e/design.spec.ts` lo comprueba.

### Fantasma, sobre navy

Un botón secundario blanco taparía la banda. Sobre navy:

| Estado | Fondo | Texto | Borde |
|---|---|---|---|
| Reposo | transparente | `#FFFFFF` | `1px #253044` |
| Hover | `rgba(96, 165, 250, 0.08)` | `#FFFFFF` | `1px #60A5FA` |
| Foco | transparente | `#FFFFFF` | halo `0 0 0 3px rgba(96, 165, 250, 0.35)` |

### WhatsApp

| Estado | Fondo | Texto |
|---|---|---|
| Reposo | `#16A34A` | `#FFFFFF` |
| Hover | `#15803D` | `#FFFFFF` |

El glifo es el de la marca WhatsApp, sólido, `fill="currentColor"`, y **no**
pertenece a la familia lineal Lucide. La prueba de identidad lo verifica.

### Peligro

Definido por el manual, no aparece en estas dos pantallas: fondo `#DC2626`,
texto `#FFFFFF`, hover `#B91C1C`.

---

## 2. Campos

### Buscador del hero

| Propiedad | Valor |
|---|---|
| Alto | `56px` |
| Fondo | `#FFFFFF` |
| Radio | `8px` |
| Relleno lateral | `16px` |
| Texto | `16px`, `#111827` |
| Marcador de posición | `#6B7280` |
| Foco (`:focus-within`) | halo `0 0 0 3px rgba(96, 165, 250, 0.35)` |

Halo azul claro y no azul MOVIA porque el campo va sobre navy: el halo de
`#2563EB` se pierde contra el fondo.

### Campos de formulario

| Estado | Borde | Sombra |
|---|---|---|
| Reposo | `1px #E5E7EB` | ninguna |
| Foco | `1px #2563EB` | `0 0 0 3px rgba(37, 99, 235, 0.14)` |
| Error | `1px #DC2626` | `0 0 0 3px rgba(220, 38, 38, 0.14)` |
| Deshabilitado | `1px #E5E7EB`, fondo `#F8FAFC` | ninguna |

Radio `8px`, alto mínimo `44px`, etiqueta siempre visible. El error se acompaña
siempre de texto: el manual prohíbe depender sólo del color.

---

## 3. Tarjeta de publicación

Geometría fija por el manual y verificada por la prueba: radio `12px`, borde
`1px #E5E7EB`, fondo `#FFFFFF`.

| Estado | Borde | Sombra | Fotografía |
|---|---|---|---|
| Reposo | `1px #E5E7EB` | `0 1px 2px rgba(17, 24, 39, 0.04)` | `scale(1)` |
| Hover | `1px #BFDBFE` | `0 8px 24px rgba(17, 24, 39, 0.08)` | `scale(1.03)` en 400 ms |
| Foco | igual que hover | igual que hover | `scale(1)` |

Interior:

| Elemento | Valor |
|---|---|
| Fotografía | relación `4/3`, `object-fit: cover` |
| Relleno del cuerpo | `16px` |
| Título | `18px / 600`, `line-height: 1.35`, `letter-spacing: -0.02em`, 2 líneas máximo, alto mínimo `2.7em` |
| Precio | `24px / 700`, `tabular-nums`, `letter-spacing: -0.03em`, `#111827` |
| Nota de impuesto | `12px / 400`, `#6B7280` |
| Franja de especificaciones | 2 columnas, separador superior `1px #E5E7EB`, margen superior `16px` |
| Etiqueta de especificación | `11px / 600`, `letter-spacing: 0.14em`, mayúsculas, `#6B7280` |
| Valor de especificación | `13px / 600`, `tabular-nums`, `#111827` |
| Franja de vendedor | fondo `#F8FAFC`, borde superior `1px #E5E7EB`, relleno `10px 16px` |

El fondo `#F8FAFC` de la franja de vendedor también lo comprueba la prueba de
identidad.

El enlace del título ocupa la caja completa del título (`display: block`,
`min-height: 2.7em`). Sin eso, un título de una sola línea deja un área táctil
de 21 px, que es la mitad del mínimo.

### Insignia "Destacado"

Fondo `#111827`, texto `#FFFFFF` a `11px / 600`, `letter-spacing: 0.06em`,
alto `28px`, esquina inferior derecha cortada 10 px siguiendo el ángulo del
isotipo. Anclada arriba a la izquierda de la fotografía.

### Distintivo de condición

Borde `1px #E5E7EB`, fondo `#FFFFFF`, texto `11px / 600` `#111827`, alto `22px`,
radio `999px`. Va junto a la ubicación. No es una cifra, así que no ocupa
columna en la franja de especificaciones.

---

## 4. Tarjeta destacada

Misma geometría de borde y radio. Cambia el formato: dos columnas,
`240px` de fotografía más el cuerpo, a `132px` en móvil. Título `20px / 600`,
precio `26px / 700`, tres columnas de especificaciones en lugar de dos.

Una publicación destacada ocupa aproximadamente el doble de superficie que una
normal. Ése es el argumento de venta del plan destacado.

---

## 5. Sellos y estados de publicación

| Sello | Fondo | Texto |
|---|---|---|
| Empresa verificada | `#DBEAFE` | `#1E40AF` |
| Activa | `#DCFCE7` | `#15803D` |
| Neutro (Destacado, Top seller, Respuesta rápida, Retirada) | `#E5E7EB` | `#374151` |
| En espera (Vencida, Pendiente) | `#FEF3C7` | `#B45309` |
| Vendida | `#E5E7EB` | `#374151` |

Alto `24px`, radio `999px`, texto `11px / 600`, `letter-spacing: 0.04em`.

Ningún estado se comunica sólo por color: todos llevan su palabra.

**Persona natural** no lleva sello ni icono de verificación. Se nombra en texto,
en `#6B7280` y peso 500, para que la diferencia con una empresa verificada sea
evidente sin inventarle un distintivo propio.

---

## 6. Navegación

### Enlace del encabezado

| Estado | Color | Peso | Indicador |
|---|---|---|---|
| Reposo | `#6B7280` | 500 | ninguno |
| Hover | `#111827` | 500 | ninguno |
| Activo | `#111827` | 600 | barra de `3px` en `#2563EB`, apoyada en el borde inferior del encabezado, con los extremos cortados a 6 px siguiendo el ángulo del isotipo |

Alto `44px`. El encabezado es blanco opaco `#FFFFFF` con borde inferior
`1px #E5E7EB`, sin `backdrop-filter`. La prueba de identidad exige que sea opaco.

### Pastilla de sugerencia, sobre navy

| Estado | Fondo | Texto | Borde |
|---|---|---|---|
| Reposo | `rgba(255, 255, 255, 0.04)` | `#E2E8F0` | `1px #253044` |
| Hover | `rgba(255, 255, 255, 0.04)` | `#FFFFFF` | `1px #60A5FA` |

Alto mínimo `44px`, radio `999px`.

### Enlace de sección ("Ver todas")

Reposo `#2563EB`, hover `#1D4ED8`, `14px / 600`, alto mínimo `44px`.

---

## 7. Galería

| Elemento | Valor |
|---|---|
| Imagen principal | relación `4/3`, borde `1px #E5E7EB`, radio `12px` |
| Contador | `rgba(17, 24, 39, 0.82)`, texto `#FFFFFF` `11px / 600` tabular, alto `28px`, radio `999px`, abajo a la derecha a `12px` |
| Flecha | `44 × 44px`, radio `999px`, fondo `rgba(255, 255, 255, 0.92)`, borde `1px #E5E7EB`; hover borde `#111827` |
| Ampliar | `44 × 44px`, radio `8px`, mismo fondo y borde |
| Miniatura | `84px` de ancho (`64px` en móvil), relación `4/3`, radio `8px`, borde `1px #E5E7EB` |
| Miniatura activa | borde `1px #2563EB` más `box-shadow: 0 0 0 1px #2563EB` |

La miniatura activa se marca con borde y sombra, no sólo con color, para que la
posición se lea también sin percepción de color.

---

## 8. Bloque de precio de la ficha

| Elemento | Valor |
|---|---|
| Fondo | `#111827`, radio `12px 12px 0 0`, relleno `24px` |
| Marca de agua | isotipo, opacidad `0.06`, arriba a la derecha |
| Título | `32px / 700`, `line-height: 1.15`, `letter-spacing: -0.03em`, `#FFFFFF` (`24px` en móvil) |
| Precio | `38px / 700`, `tabular-nums`, `letter-spacing: -0.03em`, `#FFFFFF` (`32px` en móvil) |
| Nota de impuesto | `12px / 400`, `#94A3B8` |
| Datos clave | 4 columnas (2 en móvil), fondo `#FFFFFF`, borde `1px #E5E7EB` sin borde superior, radio `0 0 12px 12px`, relleno `20px 24px` |

El precio en blanco sobre navy también lo verifica la prueba de identidad.

---

## 9. Tabla de ficha técnica

| Elemento | Valor |
|---|---|
| Texto | `14px` |
| Celda | relleno `11px 12px` |
| Etiqueta | `400`, `#6B7280`, alineada a la izquierda, ancho `44%` |
| Valor | `600`, `#111827`, `tabular-nums`, alineado a la derecha |
| Separador | `1px #E5E7EB` entre filas, ninguno en la última |
| Fila impar | fondo `#F8FAFC` |

Valor alineado a la derecha y tabular para que dos publicaciones abiertas en dos
pestañas se comparen línea a línea.

---

## 10. Barra de contacto fija, sólo móvil

Aparece por debajo de `640px`. Fondo `#FFFFFF`, borde superior `1px #E5E7EB`,
sombra `0 -4px 16px rgba(17, 24, 39, 0.08)`, relleno `8px 12px` más
`env(safe-area-inset-bottom)`.

Tres columnas iguales: WhatsApp, Mensaje, Correo. Cada botón mide `119 × 44px` a
412 px de ancho. La ficha reserva `88px` de relleno inferior para que la barra no
tape el final del contenido.

---

## 11. Marcador de fotografía

Estado permanente del producto, no sólo un recurso de maqueta: siempre habrá
publicaciones sin foto.

| Propiedad | Valor |
|---|---|
| Fondo | degradado `160deg` de `#EEF2F7` a `#E4EAF2` |
| Trama | líneas de `1px` en `rgba(37, 99, 235, 0.05)` cada `14px`, inclinadas `58deg` |
| Glifo | icono de la categoría, `34%` del ancho, máximo `96px`, opacidad `0.45` |
| Referencia | `11px / 600`, `letter-spacing: 0.08em`, `#94A3B8`, abajo a la izquierda |
| Aviso "Sin fotografía" | mismo estilo, abajo a la derecha, sólo cuando no hay ninguna foto |

Los `58deg` de la trama son el ángulo del isotipo.

---

## 12. Comprobado en las maquetas

Medido en el DOM, no estimado:

| Comprobación | 1280 px | 412 px |
|---|---|---|
| Controles por debajo de 44 px de alto | 0 | 0 |
| Desbordamiento horizontal | 0 px | 0 px |
| Alto del inicio | 3.063 px | 6.314 px |
| Alto de la ficha | 2.751 px | 5.707 px |

Referencia de producción hoy: inicio 3.253 px a 1280 y **9.040 px** a 412.

Además coinciden con lo que exige `tests/e2e/design.spec.ts`: los nueve colores
de la paleta, los tres radios, Inter, `h1` a 40 px / 700, `h2` a 28 px / 600,
título de tarjeta a 18 px / 600, botón principal `#2563EB` radio 8, tarjeta
radio 12 con borde `1px #E5E7EB`, encabezado blanco opaco, pie navy, franja de
vendedor `#F8FAFC`, primera sección del inicio en navy, isotipo por debajo de
`0.2` de opacidad, y precio de ficha en blanco sobre navy.
