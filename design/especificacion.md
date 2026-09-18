# Especificación de la dirección visual

Valores exactos de color, tamaño, espaciado y estados para **Inicio** y **Ficha
de publicación**. El encargo pide números, no sólo capturas: «el front es
token-driven, los números reales entran directos».

Todo lo que sigue está **medido sobre el build**, no escrito de memoria. Los
valores de estado se leyeron del DOM con `getComputedStyle` en reposo, hover y
foco; los contrastes están calculados con la fórmula de WCAG 2.1. Donde un
número contradice al manual, se dice y se explica.

Fuente de verdad en código: `src/app/globals.css`.

---

## 1. Color

### 1.1 Paleta del manual, intacta

Los trece tokens de la sección 14 del manual, sin una sola desviación. Una
prueba automática los comprueba uno a uno (`design.spec.ts`, «la paleta
declarada coincide con el manual»).

| Token | Valor | Uso |
|---|---|---|
| `--color-navy` | `#111827` | Estructura: barra, entrada, cierre, cajetín |
| `--color-primary` | `#2563EB` | Acción principal, enlaces, filete de sección |
| `--color-primary-hover` | `#1D4ED8` | Hover de la acción principal |
| `--color-primary-soft` | `#EFF6FF` | Fondo de fila activa, plano técnico |
| `--color-surface` | `#FFFFFF` | Tarjeta, panel, placa de marca |
| `--color-background` | `#F8FAFC` | Página, franja de vendedor |
| `--color-border` | `#E5E7EB` | Filete de 1 px |
| `--color-text-muted` | `#6B7280` | Texto secundario, rótulo técnico |
| `--color-success` | `#16A34A` | Verificado, WhatsApp |
| `--color-danger` | `#DC2626` | Error, cerrar sesión |
| `--color-accent` | `#7C3AED` | Sólo analítica |
| `--radius-input` | `8px` | Campo, botón, placa de marca |
| `--radius-card` | `12px` | Tarjeta, panel |
| `--radius-modal` | `16px` | Modal, lupa de galería |

Sin naranja en ningún punto del producto. Comprobado por prueba automática
(`home.spec.ts`, «no usa naranja como color de identidad»).

### 1.2 Derivados sobre navy, y por qué existen

El manual define la paleta **para fondo claro** y no da ningún valor para
trabajar **sobre** el navy, que es donde esta dirección apoya la identidad. Los
siguientes no son una familia nueva: son navy y azul aclarados con blanco.

| Token | Valor | Contraste medido | Por qué |
|---|---|---|---|
| `--color-primary-bright` | `#60A5FA` | **6,98:1** sobre navy | El azul de marca sobre navy da **3,43:1**, que no pasa AA para texto normal. Este sí |
| `--color-navy-muted` | `#8FA0B8` | **6,66:1** sobre navy | Texto secundario legible sobre navy |
| `--color-navy-raised` | `#1A2334` | — | Superficie elevada sobre el suelo navy |
| `--color-navy-line` | `#273142` | — | Filete divisorio sobre navy |
| `--color-navy-edge` | `#31405A` | — | Filete de control, que necesita más peso |

### 1.3 Contraste medido de los pares reales

| Par | Ratio | Cumple |
|---|---|---|
| Blanco sobre navy | 17,74:1 | AA y AAA |
| Navy sobre blanco | 17,74:1 | AA y AAA |
| `#60A5FA` sobre navy | 6,98:1 | AA texto normal |
| `#8FA0B8` sobre navy | 6,66:1 | AA texto normal |
| Blanco sobre `#1D4ED8` (botón hover) | 6,70:1 | AA texto normal |
| Blanco sobre `#2563EB` (botón) | 5,17:1 | AA texto normal |
| `#2563EB` sobre blanco | 5,17:1 | AA texto normal |
| `#B45309` sobre blanco | 5,02:1 | AA texto normal |
| `#DC2626` sobre blanco | 4,83:1 | AA texto normal |
| `#6B7280` sobre blanco | 4,83:1 | AA texto normal |
| `#6B7280` sobre `#F8FAFC` | 4,62:1 | AA texto normal |
| `#16A34A` sobre blanco | 3,30:1 | AA sólo grande o UI |

**Aviso sobre el verde.** `#16A34A` es el valor del manual y da 3,30:1 sobre
blanco: no alcanza AA para texto normal. Por eso el verde nunca lleva sola la
información en esta dirección. «Empresa verificada» combina icono, texto y
fondo suave, y el estado nunca depende únicamente del color, que es lo que pide
la sección 13 del manual.

### 1.4 Fondos suaves de distintivo

No se introduce ningún valor nuevo: cada fondo es **su propio color de marca al
10 % sobre blanco**.

| Distintivo | Fondo | Texto |
|---|---|---|
| Verificado | `--color-primary-soft` `#EFF6FF` | `#2563EB` |
| Éxito | `rgba(22,163,74,0.10)` | `#16A34A` |
| Pendiente | `rgba(180,83,9,0.10)` | `#B45309` |
| Error | `rgba(220,38,38,0.10)` | `#DC2626` |
| Neutro | `#F8FAFC` con filete `#E5E7EB` | `#6B7280` |
| Destacado | `--color-navy` | Blanco |

---

## 2. Tipografía

Inter, familia única. `font-feature-settings: 'zero' 1, 'cv05' 1`: cero cortado
y formas alternas. Es lo que hace que un catálogo de maquinaria se lea como una
hoja de datos. Inter lo trae de serie y casi nadie lo enciende.

Rangos de la sección 5 del manual, cumplidos enteros.

Dos columnas a propósito: **lo que declara el token** y **lo que renderiza la
pantalla hoy**. Todavía no coinciden en dos filas, porque las pantallas llevan
medidas literales; está anotado en la sección 7 como el siguiente tramo. Se
publican los dos números en vez de sólo el que conviene.

| Papel | Token | Declara | Renderiza (escritorio / teléfono) | Peso | Tracking |
|---|---|---|---|---|---|
| Título principal | `--text-display` | 40px | 40px / 32px | 700 | −0,04em |
| Título de ficha | `--text-title` | 34px | **32px** / 24px | 700 | −0,04em |
| Título de sección | `--text-section` | 24px | **28px** / 24px | 600 | −0,025em |
| Subtítulo, título de placa | `--text-subtitle` | 18px | 18px | 600 | −0,025em |
| Texto base | `--text-body` | 16px | 16px | 400 | 0 |
| Texto pequeño | `--text-small` | 14px | 14px | 400 / 600 | 0 |
| Texto mínimo | `--text-tiny` | 12px | 12px | 400 | 0 |
| **Rótulo técnico** | `--text-label` | 11px | 11px | 600 | **+0,16em**, versalitas |

Las dos filas en negrita son las que no cuadran. Los dos valores renderizados
siguen dentro de los rangos de la sección 5 del manual (título principal 32-40,
título de sección 24-28), así que la pantalla es correcta; lo que falta es que
el token sea el que manda.

**Cifras.** Precio en 26px peso 800 en la tarjeta compacta, 30px en la
destacada, 32px en la ficha. Todas las cifras comparables llevan
`tabular-nums`, para que dos publicaciones se lean columna contra columna.

**Desviación declarada.** El manual pide 700 para las cifras; el precio usa
**800**. El precio no es texto, es el dato por el que se entra en una
publicación. Los titulares sí conservan el 700 del manual.

**El rótulo técnico** (11px, 600, +0,16em, versalitas) es el recurso que
sostiene el carácter de ficha técnica en todo el producto, sin recurrir a
ningún color nuevo. Es `.movia-etiqueta` en el código.

---

## 3. Espaciado y radios

Escala de la sección 14: múltiplos de 4 y 8. `8, 12, 16, 24, 32, 48, 64`.

| Token | Escritorio | Teléfono (≤640) | Uso |
|---|---|---|---|
| `--pad-card` | 16px | 12px | Interior de tarjeta |
| `--pad-panel` | 24px | 16px | Interior de panel y sección |
| `--pad-cell` | 12px | 12px | Celda de tabla, fila de índice |

Separación entre secciones: 32px en teléfono, 48px desde `md`.
Radios: `8px` campo y botón, `12px` tarjeta y panel, `16px` modal.

---

## 4. Estados, medidos en el DOM

Todos los valores siguientes se leyeron del build en ejecución.

### 4.1 Botón principal

| Estado | Fondo | Texto | Sombra |
|---|---|---|---|
| Reposo | `#2563EB` | Blanco | ninguna |
| Hover | `#1D4ED8` | Blanco | ninguna |
| Foco | `#1D4ED8` | Blanco | `0 0 0 3px rgba(37,99,235,0.18)` |
| Deshabilitado | — | — | cursor `not-allowed` |

Alto 56px en la entrada, 44px en la barra. Radio 8px. Cursor `pointer`.
Transición sólo de color, 200ms.

### 4.2 Campo de búsqueda

| Estado | Borde | Sombra |
|---|---|---|
| Reposo | `#111827` | ninguna |
| Foco | `#2563EB` | `0 0 0 3px rgba(37,99,235,0.14)` |

Alto 56px, área táctil interna 44px mínimo, cursor `text`.

### 4.3 Tarjeta de publicación

| Estado | Borde | Sombra |
|---|---|---|
| Reposo | `#E5E7EB` | `0 1px 2px rgba(17,24,39,0.04)` |
| Hover | `#BFDBFE` | `0 8px 24px rgba(17,24,39,0.08)` |
| Foco | `#BFDBFE` | `0 0 0 3px rgba(37,99,235,0.18)` |

Radio 12px, borde 1px. La fotografía escala a 1,03 en hover, 420ms. Transición
sólo de `box-shadow` y `border-color`, 200ms.

### 4.4 Fila de categoría

| Estado | Fondo |
|---|---|
| Reposo | transparente |
| Hover | `#EFF6FF` |
| Foco | `#EFF6FF` + `0 0 0 3px rgba(37,99,235,0.18)` |

Alto 64px, por encima del mínimo táctil. El cheurón se desplaza 2px y pasa a
`#2563EB`. Cursor `pointer`.

### 4.5 Control de galería

| Estado | Borde | Icono |
|---|---|---|
| Reposo | `#E5E7EB` | `#111827` |
| Hover | `#2563EB` | `#2563EB` |
| Foco | `#2563EB` | `#2563EB` + halo de 3px |

44×44px, radio 8px.

### 4.6 Botón de WhatsApp

| Estado | Fondo |
|---|---|
| Reposo | `#16A34A` |
| Hover | `#15803D` |
| Foco | `#15803D` + halo de 3px |

Blanco sobre `#15803D` da 5,02:1, que pasa AA para texto normal. Lleva el
glifo de la marca, no un icono genérico de chat.

### 4.7 Foco, regla global

El manual pide foco visible sin el contorno duro del navegador:

```css
*:focus-visible {
  outline: none;
  box-shadow: 0 0 0 3px rgba(37, 99, 235, 0.18);
  border-radius: 4px;
}
```

En campos el halo baja a `0.14` y el borde pasa a `--color-primary`.

### 4.8 Cursor

`button`, `[role="button"]`, `select` y `summary` llevan `cursor: pointer`.
Tailwind 4 los alinea con el cursor del navegador, que es la flecha, y eso
dejaba sin señal táctil 24 controles en `/buscar`. Lo deshabilitado conserva
`not-allowed`.

---

## 5. Piso de accesibilidad

| Regla | Cómo se cumple | Comprobado por |
|---|---|---|
| Objetivo táctil 44×44 | Cero incumplimientos | `design.spec.ts` |
| Funciona a 412px | Cero desborde horizontal, 412 a 1440 | `home.spec.ts`, `design.spec.ts` |
| Foco visible con teclado | Halo azul de 3px en todo elemento enfocable | `design.spec.ts` |
| Texto alternativo | Marca con `alt`, decorativo con `aria-hidden` | `design.spec.ts` |
| El color nunca va solo | Todo estado combina icono, texto y fondo | Revisión manual |
| Movimiento reducido | `prefers-reduced-motion` reduce todo a 0,01ms | `animation.spec.ts` |

---

## 6. Reglas fijas del encargo

| Regla | Cómo se cumple |
|---|---|
| Logo suministrado, sin redibujar ni recolorear | El archivo se usa tal cual, nunca con filtro. Sobre navy va sobre placa clara. La barra lleva el isotipo, que la sección 2 autoriza en tamaños reducidos; el pie, el lockup completo |
| Paleta cerrada, sin naranja | Los trece valores del manual, intactos. Los añadidos son navy y azul aclarados con blanco, documentados en 1.2 con su contraste |
| Inter | Familia única. El carácter sale de cómo se usa, no de otra tipografía |
| Área táctil 44px | Cero incumplimientos, medidos en el DOM |
| Funciona a 412px | Cero desborde, medido de 412 a 1440 |

---

## 7. Lo que queda abierto

- Los nombres de categoría y ciudad salen de la base de datos sin tilde
  (`Vehiculos`, `Bogota`, `Construccion`). Corregirlos toca el seed y las
  pruebas que los fijan, así que va aparte de un cambio de presentación.
- La escala tipográfica está declarada en tokens pero las pantallas todavía
  llevan medidas literales. Consumirla es el siguiente tramo.
- El catálogo no tiene fotografía propia. El hueco se dibuja como alzado
  técnico del equipo, que resuelve un estado que el producto va a tener
  siempre, pero no sustituye a la fotografía real.
