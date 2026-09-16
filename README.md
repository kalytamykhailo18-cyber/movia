# MOVIA

Marketplace B2B de activos empresariales. Demo funcional sobre el alcance V1.

## Requisitos

- Node.js 20 o superior
- npm 10 o superior

## Puesta en marcha

```bash
npm install
cp .env.example .env
npx prisma db push
npm run db:seed
npm run dev
```

La aplicacion queda en `http://localhost:3100` (el puerto se define en `APP_PORT`).

## Configuracion

Toda la configuracion vive en `.env`. No hay valores fijos en el codigo.
`.env.example` documenta cada variable con su valor por defecto.

Bloques principales:

| Bloque | Controla |
|---|---|
| `APP_*` | Nombre, URL y puerto |
| `DATABASE_*` | Motor y cadena de conexion |
| `JWT_*`, `SESSION_*` | Autenticacion y sesion |
| `DEFAULT_COUNTRY_*`, `DEFAULT_CURRENCY`, `DEFAULT_LOCALE` | Pais, moneda e idioma |
| `TAX_*` | Tarifa, nombre e inclusion del impuesto en el precio |
| `PUBLICATION_*` | Vigencias, limite de fotos y umbral de calidad |
| `BULK_UPLOAD_*` | Limites de la carga masiva |
| `PAYMENT_*` | Pasarela y credenciales |
| `RUES_*` | Verificacion de empresas |
| `INVOICE_*` | Facturacion electronica |
| `UI_ANIMATION_*` | Duraciones y escalonado de las animaciones |

Cambiar de pais no requiere tocar codigo: el esquema ya modela pais, ciudad,
moneda, prefijo telefonico, idioma, zona horaria e impuesto.

### Base de datos

El demo corre sobre SQLite para arrancar sin dependencias. Para PostgreSQL:

1. `provider = "postgresql"` en `prisma/schema.prisma`
2. `DATABASE_URL` apuntando al servidor en `.env`
3. `npx prisma db push`

El modelo de datos no cambia.

## Scripts

| Comando | Efecto |
|---|---|
| `npm run dev` | Servidor de desarrollo |
| `npm run build` | Compilacion de produccion |
| `npm start` | Servidor de produccion |
| `npm run db:push` | Sincroniza el esquema |
| `npm run db:seed` | Carga datos de demostracion |
| `npm run db:studio` | Explorador de la base de datos |
| `npm run test:e2e` | Suite E2E completa |
| `npm run test:e2e:ui` | Suite E2E en modo interactivo |

## Datos de demostracion

El seed crea 8 categorias con sus campos tecnicos, 8 ciudades, 5 empresas
(4 verificadas y 1 pendiente), 24 publicaciones con ficha tecnica real,
5 planes comerciales, y el historico de visualizaciones, favoritos y
contactos que alimenta la analitica.

Accesos:

| Perfil | Correo | Clave |
|---|---|---|
| Administrador | `admin@movia.co` | `Movia2026` |
| Empresa vendedora | `empresa1@movia.co` a `empresa5@movia.co` | `Demo2026` |
| Comprador | `comprador1@movia.co` a `comprador6@movia.co` | `Demo2026` |

Las claves salen de `SEED_ADMIN_PASSWORD` y `SEED_DEMO_PASSWORD` en `.env`.

El administrador entra a `/admin`, donde edita precios, vigencias y cupos de los
planes, resuelve verificaciones de empresa y suspende cuentas. Lo que cambie en
tarifas se ve de inmediato en `/planes`.

## Pruebas

```bash
npm run test:e2e
```

La suite recorre el producto como lo haria un usuario, en escritorio y en
movil: catalogo, busqueda con filtros tecnicos, ficha con galeria, los tres
canales de contacto, alta de publicaciones, carga masiva con reporte de
errores y el panel Mi Empresa. Incluye el ciclo completo que verifica que un
contacto del comprador aparece en la analitica del vendedor.

## Estructura

```
prisma/          esquema y datos de demostracion
src/app/         rutas y endpoints
src/components/  interfaz
src/lib/         configuracion, formato, calculo de impuesto, validacion NIT
src/server/      consultas y reglas de negocio
tests/e2e/       pruebas de extremo a extremo
```

## Identidad visual

Los tokens de `src/app/globals.css` reproducen la paleta, radios y escala
tipografica del Manual de Marca. Los archivos de logo en `public/brand` son
los originales suministrados y no se modifican.
