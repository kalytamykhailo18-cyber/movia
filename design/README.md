# design/

Trabajo de identidad visual para **Inicio** y **Ficha de publicación**, a
1280 px y 412 px. Encargo de diseño: el producto ya funciona, lo que se pide es
que deje de parecer una plantilla.

---

## Qué toca esta rama y qué no

**Toca:** presentación. Tokens en `src/app/globals.css` y los componentes de
interfaz de esas dos pantallas.

**No toca:** lógica de negocio, consultas, autenticación, esquema de base de
datos, endpoints, ni el flujo de publicación. Tampoco corrige los hallazgos de
`observaciones.md`, que quedan documentados pero sin tocar para no mezclar
asuntos en una rama de diseño.

Los únicos cambios fuera de presentación son dos, y los dos son mecánicos:

| Archivo | Cambio | Motivo |
|---|---|---|
| `src/server/publications.ts` | Añade `year` y `usageHours` al `select` de tarjeta | La tarjeta muestra año y horas, así que la consulta tiene que traerlos |
| `src/app/empresa/[id]/page.tsx` | El mismo `select`, duplicado en ese archivo | Sin el mismo cambio, TypeScript falla |

Ni `package.json` ni `package-lock.json` se modifican.

---

## Contenido

```
placa/           Direccion vigente, "La Placa". Maquetas, tokens y estados.
mockups/         Direccion anterior, conservada como alternativa.
spec/            Especificacion de la direccion anterior.
tokens/          Tokens de la direccion anterior.
observaciones.md Hallazgos tecnicos ajenos al diseno. No se tocan aqui.
```

La dirección vigente es **`placa/`**. Empezar por `placa/README.md`.

`mockups/`, `spec/` y `tokens/` son la primera propuesta. Se conservan porque
sirven de comparación y porque la decisión entre las dos es del cliente. Si se
confirma `placa/`, se pueden borrar.

---

## Cómo ver las maquetas

Cargan el logo desde `public/brand/`, así que hay que servirlas desde la raíz
del repositorio:

```bash
python3 -m http.server 8899
```

- http://127.0.0.1:8899/design/placa/inicio.html
- http://127.0.0.1:8899/design/placa/ficha.html

Son un archivo responsive por pantalla, no uno por tamaño: el corte entre
escritorio y teléfono es el mismo que tendrá el producto. Conviene abrirlas en
el navegador en vez de mirar capturas, porque los estados de hover y de foco no
se ven en una imagen.

---

## Reglas fijas del encargo

Ninguna se ha movido.

| Regla | Cómo se cumple |
|---|---|
| Logo suministrado, sin redibujar ni recolorear la M | Se usa el archivo tal cual. Sobre navy va en placa clara, nunca con filtro |
| Paleta cerrada, sin naranja | Los nueve valores del encargo, intactos. Los añadidos son navy aclarado con blanco, documentados uno a uno |
| Inter | Única familia. El carácter sale de cómo se usa |
| Área táctil 44 px | Cero incumplimientos, medidos en el DOM |
| Funciona a 412 px | Cero desbordamiento horizontal |

La escala tipográfica respeta los rangos de la sección 5 del manual: título
principal 32-40, título de sección 24-28, subtítulo 18-20. La única desviación
es el **peso 800** en los dos titulares y en las cifras de precio, donde el
manual pide 700. Está señalada a propósito y es discutible.

---

## Pruebas

La dirección vigente obliga a mover **dos** aserciones de
`tests/e2e/design.spec.ts`, ambas a conciencia y documentadas en el commit
correspondiente:

1. `el encabezado fijo es opaco` espera fondo blanco. El encabezado pasa a navy,
   que es lo que la sección 4 del manual asigna a *"estructura, encabezados,
   navegación y footer"*.
2. `el titulo principal usa 32 a 40 px con peso 700` espera peso exacto `700`.
   El titular mantiene el tamaño dentro de rango y sube a `800`.

El resto de la suite debe seguir en verde sin tocarla.
