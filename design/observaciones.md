# Observaciones técnicas

Hallazgos que aparecieron mientras se trabajaba el diseño y que **no son
diseño**, así que esta rama no los toca. Quedan aquí para que quien corresponda
decida si entran y en qué orden.

Todo está verificado en el código o medido en el navegador. Ninguna es una
suposición. Ordenadas por impacto.

---

## 1. `sharp` puede romper un despliegue de producción

`package.json` declara `sharp` en **dependencies**, pero `package-lock.json` lo
tiene registrado bajo **devDependencies**.

```
package.json  -> sharp en dependencies    : True
lock (raiz)   -> sharp en devDependencies : True
```

`npm ci --omit=dev` instalaría todo menos `sharp`, y `src/server/storage.ts` lo
importa en cada subida de foto. En local no se nota, porque `npm install`
reconcilia la diferencia; en un despliegue que use `npm ci`, sí.

Se resuelve con un `npm install` y commiteando el lock resultante. Esta rama lo
revirtió a propósito para no mezclar un cambio de dependencias con diseño.

---

## 2. `Ano` aparece en todas las fichas

`src/app/publicacion/[slug]/page.tsx`, la etiqueta del año en la franja de datos
clave. Sin la tilde no significa año, y está en **todas** las publicaciones.

En la misma línea, la interfaz corre sin tildes aunque es español de Colombia.
Confirmado en producción: `muevelo`, `Categorias`, `Vehiculos`, `Construccion`,
`Tecnologia`, `Ultimas publicaciones`, `Descripcion`, `Ficha tecnica`,
`Ubicacion`, `Condicion`, `Camion`, `Bogota`, `Medellin`, `Logistica`,
`Metalmecanica`, `Ver mas`, `Sin fotografia`, `Publicalo`, `Respuesta rapida`,
`Camara de Comercio`, `Que activo estas buscando?`.

También `15 anos de trayectoria` en el perfil de Construcciones Paisas, con el
mismo problema.

Falta además la apertura `¿` en todas las preguntas.

**Cuidado al corregir:** `Categorias` está aserido en dos pruebas, así que
cambiarlo las rompe hasta que se actualicen:

- `tests/e2e/navigation.spec.ts:55`, encabezado `Categorias` en `/categorias`
- `tests/e2e/navigation-progress.spec.ts:46`, enlace `Categorias` en el pie

El resto de las palabras no las asierta ninguna prueba.

---

## 3. Registro regional equivocado

El cierre del inicio dice `Tenes equipo parado?`. `Tenés` es voseo rioplatense.
En Colombia sería `¿Tienes equipo parado?`, o `¿Tiene...?` con el usted.

---

## 4. El service worker sirve JS viejo en desarrollo

`public/sw.js` es cache-first para `/_next/static/`:

```js
const isAsset = url.pathname.startsWith('/_next/static/') || ...
event.respondWith(caches.match(request).then(c => c ? c : fetch(request)))
```

En producción no pasa nada, porque los nombres de fichero llevan hash. En
desarrollo los nombres son estables: tras editar un componente el servidor manda
HTML nuevo y el service worker sigue sirviendo el bundle anterior. El resultado
es un error de hidratación de React que parece un fallo del código y no lo es.

Ocurrió dos veces durante este trabajo. Se limpia desregistrando el service
worker y borrando las cachés `movia-v1-shell` y `movia-v1-runtime`. Conviene
saltarse el cache-first cuando `NODE_ENV !== 'production'`.

---

## 5. Datos de demostración duplicados

"Activos destacados" y "Últimas publicaciones" muestran los mismos cuatro
artículos, con el mismo precio y los mismos contadores de vistas y contactos. En
la portada de un marketplace hace que el catálogo parezca vacío.

Además, cinco de las ocho tarjetas de "Últimas publicaciones" llevan el sello
`Destacado`. Un sello que lleva la mayoría no señala nada, y la sección 10 del
manual trata Destacada como un estado que se contrata.

---

## 6. Detalles menores

**`tsconfig.tsbuildinfo` está commiteado** y no aparece en `.gitignore`. Son
150 KB de artefacto de compilación que cambian en cada `tsc`.

**`CARD_SELECT` está duplicado** en `src/server/publications.ts` y en
`src/app/empresa/[id]/page.tsx`. Al añadir `year` y `usageHours` a la tarjeta
hubo que tocar los dos; el segundo sólo se descubrió porque TypeScript falló.

**`.env.example` se contradice**: `APP_PORT=3200` pero
`APP_URL=http://localhost:3100`, y el README dice 3100.

---

## 7. Material pendiente del cliente

Esto ha bloqueado decisiones de diseño en cuatro ocasiones.

- **Versión clara del logo.** El manual la promete en la sección 2
  (*"versión clara sobre fondos oscuros"*) y no está entre los archivos
  suministrados. Medido: el 54 % del logo es `#0C1830`/`#182430`, que sobre el
  navy `#111827` da **1.0:1**. Más de la mitad de la marca, wordmark incluido,
  desaparece sobre fondo oscuro. Mientras no llegue, el logo va sobre placa
  clara, sin recolorear.
- **Logo con el descriptor** `MARKETPLACE DE ACTIVOS EMPRESARIALES`, que la
  sección 2 define como parte del logo completo.
- **SVG** de ambos. Un front end gobernado por tokens quiere marcas vectoriales,
  y el manual prohíbe calcar la M, así que no se puede generar.
- **Fotografía real.** Las 24 publicaciones del seed apuntan a
  `/api/placeholder` y cuatro tarjetas del inicio muestran "Sin fotografía".
  Ninguna dirección de diseño se cierra del todo sin imágenes.
