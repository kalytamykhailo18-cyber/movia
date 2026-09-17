# MOVIA · Decisiones de diseño

Propuesta de identidad para **Inicio** y **Ficha de publicación**, a 1280 px y 412 px.

Maquetas en `design/mockups/`, tokens en `design/tokens/movia-tokens.css`.
Capturas del antes y del después en la carpeta de entrega.

---

## 1. El problema, medido

El build actual no incumple el Manual de Marca. Lo cumple casi al pie de la letra.
Valores leídos del DOM de `eduardo.ustymkushnir.com`:

| Token | Manual | Producción | |
|---|---|---|---|
| `--color-navy` | `#111827` | `#111827` | correcto |
| `--color-primary` | `#2563EB` | `#2563eb` | correcto |
| `--color-primary-hover` | `#1D4ED8` | `#1d4ed8` | correcto |
| `--radius-input` / `card` / `modal` | 8 / 12 / 16 | 8 / 12 / 16 | correcto |
| Tipografía | Inter | `Inter, Manrope, Arial` | correcto |
| Botón principal | 44 px, radio 8 | 44 px, radio 8, `#2563EB` | correcto |

La paleta no es el problema. El problema es que **la identidad está delegada
por completo a la paleta**, y una paleta de azul y gris sobre blanco es la que
trae cualquier plantilla por defecto.

Hoy la marca sólo aparece en tres sitios: la tarjeta navy del hero, la barra
azul de 3 px antes de cada título de sección, y el logo. Todo lo demás es
composición neutra.

A eso se suman tres decisiones que quitan jerarquía:

1. **El título y el precio compiten.** Ambos a 32 px / 700 en la ficha. El ojo
   no tiene por dónde entrar.
2. **Ninguna publicación está jerarquizada.** Destacados y Últimas publicaciones
   usan la misma rejilla de cuatro columnas con tarjetas idénticas. Una
   publicación destacada se paga, pero se ve igual que una gratuita con un sello
   encima.
3. **La densidad no corresponde al uso.** El comprador llega sabiendo el modelo
   que necesita y compara cifras. Las cifras no están en la tarjeta: hay que
   abrir cada publicación para ver año, horas y condición. El inicio mide
   9.040 px de alto en móvil.

---

## 2. La dirección

**La ficha técnica como lenguaje visual.**

MOVIA no es un tablón de clasificados con fotos. Es un registro de activos
industriales. El material más creíble y más propio que tiene el producto son
sus propios datos: potencia, voltaje, horas de uso, año, NIT verificado.

La referencia que dio el cliente es una app de vida nocturna: navy oscuro,
acento de neón, mucha personalidad. Se toma la intención, no la ejecución. Un
acento de neón no sobrevive a una página llena de especificaciones de par motor.
Lo que sí sobrevive, y además da carácter, es tratar la información técnica como
la trata un catálogo de maquinaria: etiquetada, tabulada, alineada, con cifras
de ancho fijo.

La identidad sale entonces de cuatro recursos, ninguno de los cuales necesita un
color nuevo:

### 2.1 El navy deja de ser una tarjeta y pasa a ser el marco

Hoy el navy es un rectángulo redondeado flotando sobre gris. Se convierte en una
banda a sangre: la página **empieza** en navy y el catálogo sale de él. Es el
mismo color del manual, usado como estructura en vez de como widget.

En la ficha, el mismo recurso: el bloque de precio en navy queda pegado a la
fila de datos clave, de modo que identidad del activo y cifras se leen como una
sola pieza.

### 2.2 La etiqueta técnica

Versalita de 11 px, peso 600, `letter-spacing: 0.14em`, en gris `#6B7280`, encima
de cada dato. Aparece en las especificaciones de la tarjeta, en los datos clave
de la ficha, en los indicadores del hero y en los títulos del pie.

Es el recurso que más trabaja. Repetido en todo el producto convierte cualquier
pantalla en una hoja de datos, que es exactamente la percepción que el manual
pide en la sección 1: profesional, ordenada, confiable.

El manual lo permite explícitamente: *"evitar mayúsculas prolongadas salvo
descriptores o etiquetas cortas"*.

### 2.3 Cifras de ancho fijo

`font-variant-numeric: tabular-nums` en todo precio, año, hora, kilómetro y
contador. Dos publicaciones abiertas en dos pestañas se comparan línea a línea
porque los dígitos caen en la misma columna.

El precio pasa a 24 px / 700 en tarjeta y 38 px / 700 en ficha, con
`letter-spacing: -0.03em`, mientras el título baja a 18 px / 600. El precio gana
por tratamiento, no sólo por tamaño.

### 2.4 El ángulo del isotipo

El isotipo está construido con un trazo a 58 grados. Es la única geometría
propia que tiene la marca. Se reutiliza tres veces por pantalla, siempre a
escala de componente:

- el indicador de sección activa en el encabezado,
- el filo de la insignia "Destacado",
- la trama del marcador de fotografía.

**Tres usos por pantalla es deliberado.** Más lo volvería decoración.

No se dibuja otra M. Se reutiliza el ángulo, no la forma, que es lo que prohíbe
la sección 2 del manual.

> Se probó también un corte diagonal en el borde inferior de la banda navy y se
> descartó: a 1.265 px de ancho, un corte de 14 px son 0,6 grados y no se
> percibe; agrandarlo lo convertía en un recurso fechado. El ángulo se queda
> donde sí se lee.

---

## 3. Cambios concretos

### Inicio

| Antes | Ahora | Por qué |
|---|---|---|
| Hero en tarjeta redondeada sobre gris | Banda navy a sangre | La marca enmarca el producto en vez de flotar sobre él |
| 8 tarjetas de categoría cuadradas, una pantalla entera | Fila densa de 8 filas con icono, nombre y conteo | Recupera una pantalla de scroll y el conteo pasa a ser dato |
| Destacados: 4 tarjetas iguales a las normales | 2 tarjetas apaisadas, el doble de superficie, con ficha visible | Destacado se paga: tiene que verse distinto, no llevar un sello |
| Tarjeta sin especificaciones | Año y horas en la tarjeta, condición como distintivo | El comprador compara cifras antes de abrir |
| Empresas: 4 tarjetas con párrafo recortado | 4 filas de directorio con la cifra a la derecha | Es un directorio, no un catálogo |
| Móvil: 9.040 px de alto | Móvil: 6.314 px de alto | 30 % menos de recorrido con más información por tarjeta |

### Ficha

| Antes | Ahora | Por qué |
|---|---|---|
| Título y precio ambos a 32 px / 700 | Título 32 px / 700, precio 38 px / 700 tabular | El precio es el dato que se compara |
| Bloque navy y datos clave separados | Una sola pieza: navy arriba, datos clave pegados debajo | Identidad del activo y cifras se leen juntas |
| Ficha técnica como lista con fondo alterno | Tabla real, etiqueta a la izquierda, valor tabular a la derecha | Es el contenido por el que existe la página |
| Documentos como texto plano | Documentos como filas accionables con tipo y peso | Un PDF de ficha técnica es una razón de compra |
| Contacto sólo en la columna lateral | Además, barra fija de contacto en móvil | En móvil el contacto queda a cuatro pantallas del precio |
| Galería 4:3 compartiendo ancho | Galería 4:3 a ancho completo de columna, contador y ampliación | El manual la define como el centro de la ficha |

---

## 4. Dónde esta propuesta contradice el manual

El encargo pide decirlo explícitamente. Son cuatro puntos.

### 4.1 La paleta del manual no cubre fondo oscuro

El manual define la paleta para fondo claro y no da ningún valor para trabajar
**sobre** navy. Pero la dirección que pide el cliente apoya la identidad
justamente ahí.

`#2563EB` sobre `#111827` da un contraste de 3,1:1 y no pasa AA para texto. Es
inutilizable como color de enlace o de acento sobre la banda navy.

Se añaden cuatro valores, todos dentro de la familia navy y azul:

| Token | Valor | Para qué | Contraste sobre `#111827` |
|---|---|---|---|
| `--color-primary-bright` | `#60A5FA` | Texto y acento sobre navy | 6,4:1 |
| `--color-navy-muted` | `#94A3B8` | Texto secundario sobre navy | 7,2:1 |
| `--color-navy-raised` | `#1B2435` | Superficie elevada sobre navy | |
| `--color-navy-line` | `#253044` | División sobre navy | |

`#60A5FA` ya está en producción hoy (el "muévelo" del hero y el epígrafe lo
usan), sólo que sin declararse como token. Esto lo formaliza.

### 4.2 Falta un color de estado en espera

El manual da verde `#16A34A` para éxito y rojo `#DC2626` para error. La sección
10 define seis estados de publicación: Activa, Vendida, Retirada, **Vencida**,
**Pendiente**, Destacada. Vencida y Pendiente no son ni éxito ni error.

Se propone `--color-warning: #B45309` sobre `--color-warning-soft: #FEF3C7`.
No es naranja de marca y no aparece en ningún elemento de identidad. Se usa sólo
en el distintivo de estado.

Si el cliente prefiere no añadirlo, la alternativa es resolver esos dos estados
sólo con gris `#E5E7EB` y texto, que funciona pero los vuelve indistinguibles de
Retirada.

### 4.3 No existe la versión clara del logo

La sección 2 del manual exige *"versión clara sobre fondos oscuros y versión
navy sobre fondos claros"*, y define el logo completo como isotipo más palabra
**más el descriptor** `MARKETPLACE DE ACTIVOS EMPRESARIALES`.

Ninguno de los dos archivos suministrados cumple eso:

- el isotipo suelto, PNG 2048 × 2048,
- el logo vertical, PNG 3000 × 2088, sin descriptor.

No hay versión clara y no hay SVG. En producción esto ya se nota: el pie es navy
y el logo es navy, así que hoy se resuelve metiendo el logo en una caja blanca.

En las maquetas se usa `filter: brightness(0) invert(1)`, que pasa la forma
exacta a blanco sin redibujar la M. Es una solución provisional aceptable, pero
**hay que pedirle al cliente el archivo claro y, si es posible, el SVG**. Un
front end gobernado por tokens quiere marcas vectoriales, y el manual prohíbe
calcar la M, así que no podemos generarla nosotros.

### 4.4 La prueba de identidad limita el uso del isotipo

`tests/e2e/design.spec.ts` exige que todo `img[src="/brand/isotipo.png"]` tenga
opacidad menor a 0,2. La propuesta respeta ese límite: la marca de agua del hero
va a 0,07 y la de la ficha a 0,06.

Queda anotado por si más adelante se quiere usar el isotipo como elemento
gráfico de mayor peso. Ese día hay que mover esa prueba a conciencia, no
saltársela.

---

## 5. Lo que esta propuesta no puede resolver todavía

**No hay fotografía.** Las 24 publicaciones del seed apuntan a
`/api/placeholder` y cuatro tarjetas del inicio muestran "Sin fotografía". El
manual es explícito en que la foto es la protagonista, en 4:3 o 1:1, y que la
galería es la pieza central de la ficha.

Las maquetas no inventan fotos. En su lugar se diseña el hueco: proporción
correcta, campo muy bajo en contraste con la trama del ángulo de marca, glifo de
la categoría y referencia de la publicación. Sirve para dos cosas a la vez,
sostener la maqueta y resolver un estado que el producto va a tener siempre,
porque siempre habrá vendedores que publiquen sin foto.

**La dirección fotográfica queda abierta hasta que existan imágenes reales.**
Las reglas propuestas, para cuando lleguen:

- relación 4:3 en tarjeta y galería, 1:1 admitido en avatar de empresa,
- la máquina completa y enfocada, sin recortes que la oculten,
- fondo comprensible: nave, taller o patio, no fondo blanco de estudio,
- sin filtros, sin viñeteado, sin marcas de agua del vendedor,
- primera foto de la galería siempre la vista general, nunca un detalle.

---

## 6. Errores de contenido detectados

No son decisiones de diseño, pero se ven en las dos pantallas del encargo y
contradicen el "serio y premium" que pide la sección 16 del manual.

**La interfaz está en español de Colombia pero corre sin tildes.** En
producción hoy: `muevelo`, `Categorias`, `Vehiculos`, `Construccion`,
`Tecnologia`, `Ultimas publicaciones`, `Descripcion`, `Ficha tecnica`,
`Ubicacion`, `Condicion`, `Camion`, `Bogota`, `Medellin`, `Logistica`,
`Metalmecanica`, `Ver mas`, `Sin fotografia`, `Publicalo`, `Respuesta rapida`,
`Camara de Comercio`, `Que activo estas buscando?`.

Dos casos pasan de cosmético a grave:

1. **`Ano`** es la etiqueta del año en la franja de datos de **todas** las
   publicaciones. Sin la tilde no significa año. Origen:
   `src/app/publicacion/[slug]/page.tsx:136`.
2. **`15 anos de trayectoria`** en el perfil de Construcciones Paisas, con el
   mismo problema.

**Registro regional equivocado.** El cierre del inicio dice `Tenes equipo
parado?`. `Tenés` es voseo rioplatense. En Colombia sería `¿Tienes equipo
parado?` o, más formal, `¿Tiene equipo parado?`. Falta además la apertura `¿`,
que no aparece en ningún sitio del producto.

**Datos de demostración duplicados.** "Activos destacados" y "Últimas
publicaciones" muestran los mismos cuatro artículos, con el mismo precio y los
mismos contadores de vistas y contactos. En la portada de un marketplace eso
hace que el catálogo parezca vacío.

**Inflación de la insignia.** Cinco de las ocho tarjetas de "Últimas
publicaciones" llevan el sello `Destacado`. Un sello que lleva la mayoría no
señala nada, y la sección 10 trata Destacada como estado contratado.

Las maquetas ya van con el español corregido, para que se vea cómo queda. La
corrección en el código es un cambio aparte y se hace cuando se apruebe la
dirección.

> Nota sobre estos documentos: la prosa va con tildes correctas, porque es
> precisamente lo que se está defendiendo. Los comentarios del CSS van sin
> tildes para no romper la convención del código existente.
