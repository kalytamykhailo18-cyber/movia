import 'dotenv/config'
import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'
import { env } from '../src/lib/env'
import { nitCheckDigit } from '../src/lib/nit'
import { scoreCompleteness } from '../src/lib/completeness'
import { slugify } from '../src/lib/utils'

const db = new PrismaClient()

const CITIES = [
  { name: 'Bogota', region: 'Cundinamarca' },
  { name: 'Medellin', region: 'Antioquia' },
  { name: 'Cali', region: 'Valle del Cauca' },
  { name: 'Barranquilla', region: 'Atlantico' },
  { name: 'Cartagena', region: 'Bolivar' },
  { name: 'Bucaramanga', region: 'Santander' },
  { name: 'Pereira', region: 'Risaralda' },
  { name: 'Manizales', region: 'Caldas' },
]

const CATEGORIES = [
  {
    slug: 'maquinaria-industrial',
    name: 'Maquinaria industrial',
    icon: 'Factory',
    attributes: [
      { key: 'potencia', label: 'Potencia', type: 'number', unit: 'kW' },
      { key: 'voltaje', label: 'Voltaje', type: 'select', options: ['110V', '220V', '440V'] },
      { key: 'peso', label: 'Peso', type: 'number', unit: 'kg' },
      { key: 'control', label: 'Control', type: 'select', options: ['Manual', 'CNC', 'PLC'] },
    ],
  },
  {
    slug: 'equipos',
    name: 'Equipos',
    icon: 'Wrench',
    attributes: [
      { key: 'capacidad', label: 'Capacidad', type: 'number', unit: 'L' },
      { key: 'material', label: 'Material', type: 'select', options: ['Acero inoxidable', 'Acero al carbono', 'Aluminio'] },
      { key: 'presion', label: 'Presion maxima', type: 'number', unit: 'bar' },
    ],
  },
  {
    slug: 'vehiculos',
    name: 'Vehiculos',
    icon: 'Truck',
    attributes: [
      { key: 'kilometraje', label: 'Kilometraje', type: 'number', unit: 'km' },
      { key: 'combustible', label: 'Combustible', type: 'select', options: ['Diesel', 'Gasolina', 'Electrico', 'Gas'] },
      { key: 'capacidadCarga', label: 'Capacidad de carga', type: 'number', unit: 'ton' },
      { key: 'transmision', label: 'Transmision', type: 'select', options: ['Manual', 'Automatica'] },
    ],
  },
  {
    slug: 'construccion',
    name: 'Construccion',
    icon: 'HardHat',
    attributes: [
      { key: 'alcance', label: 'Alcance', type: 'number', unit: 'm' },
      { key: 'capacidadIzaje', label: 'Capacidad de izaje', type: 'number', unit: 'ton' },
      { key: 'motor', label: 'Motor', type: 'text' },
    ],
  },
  {
    slug: 'alimentos',
    name: 'Alimentos',
    icon: 'UtensilsCrossed',
    attributes: [
      { key: 'produccionHora', label: 'Produccion por hora', type: 'number', unit: 'kg/h' },
      { key: 'temperatura', label: 'Rango de temperatura', type: 'text' },
      { key: 'certificacion', label: 'Certificacion', type: 'select', options: ['INVIMA', 'HACCP', 'ISO 22000', 'Ninguna'] },
    ],
  },
  {
    slug: 'muebles',
    name: 'Muebles',
    icon: 'Armchair',
    attributes: [
      { key: 'cantidad', label: 'Cantidad', type: 'number', unit: 'unidades' },
      { key: 'material', label: 'Material', type: 'select', options: ['Madera', 'Metal', 'Melamina', 'Mixto'] },
      { key: 'dimensiones', label: 'Dimensiones', type: 'text' },
    ],
  },
  {
    slug: 'tecnologia',
    name: 'Tecnologia',
    icon: 'Cpu',
    attributes: [
      { key: 'cantidad', label: 'Cantidad', type: 'number', unit: 'unidades' },
      { key: 'procesador', label: 'Procesador', type: 'text' },
      { key: 'memoria', label: 'Memoria RAM', type: 'number', unit: 'GB' },
      { key: 'almacenamiento', label: 'Almacenamiento', type: 'text' },
    ],
  },
  {
    slug: 'otros',
    name: 'Otros',
    icon: 'Package',
    attributes: [
      { key: 'cantidad', label: 'Cantidad', type: 'number', unit: 'unidades' },
      { key: 'estadoLote', label: 'Estado del lote', type: 'select', options: ['Nuevo', 'Usado', 'Mixto'] },
    ],
  },
]

const PLANS = [
  {
    slug: 'publicacion-15',
    name: 'Publicacion 15 dias',
    kind: 'single',
    price: 39000,
    durationDays: env.publication.durationShortDays,
    publicationQuota: 1,
    featuredQuota: 0,
    features: ['1 publicacion activa', 'Vigencia 15 dias', 'Contacto WhatsApp y correo', 'Analitica basica'],
    position: 1,
  },
  {
    slug: 'publicacion-30',
    name: 'Publicacion 30 dias',
    kind: 'single',
    price: 59000,
    durationDays: env.publication.durationLongDays,
    publicationQuota: 1,
    featuredQuota: 0,
    features: ['1 publicacion activa', 'Vigencia 30 dias', 'Contacto WhatsApp y correo', 'Analitica basica'],
    position: 2,
  },
  {
    slug: 'empresa-mensual',
    name: 'Empresa mensual',
    kind: 'subscription',
    price: 249000,
    durationDays: 30,
    publicationQuota: 25,
    featuredQuota: 2,
    features: ['25 publicaciones al mes', '2 destacados incluidos', 'Carga masiva CSV', 'Analitica completa', 'Badge empresa verificada'],
    position: 3,
  },
  {
    slug: 'empresa-pro',
    name: 'Empresa Pro',
    kind: 'subscription',
    price: 599000,
    durationDays: 30,
    publicationQuota: 100,
    featuredQuota: 10,
    features: ['100 publicaciones al mes', '10 destacados incluidos', 'Carga masiva CSV', 'Analitica completa', 'Soporte prioritario'],
    position: 4,
  },
  {
    slug: 'destacado-7',
    name: 'Destacado 7 dias',
    kind: 'featured',
    price: 29000,
    durationDays: 7,
    publicationQuota: 0,
    featuredQuota: 1,
    features: ['Aparece primero en resultados', 'Badge destacado', 'Espacio en inicio'],
    position: 5,
  },
]

const COMPANIES = [
  {
    name: 'Industrias Andinas',
    legalName: 'Industrias Andinas S.A.S.',
    nit: '900123456',
    city: 'Bogota',
    verificationStatus: 'approved',
    description: 'Fabricacion y renovacion de maquinaria para la industria metalmecanica. Operamos desde 2008 con planta en Bogota.',
    badges: ['verified', 'top_seller', 'fast_response'],
    responseTimeMins: 45,
  },
  {
    name: 'Metalmecanica del Valle',
    legalName: 'Metalmecanica del Valle Ltda.',
    nit: '830456789',
    city: 'Cali',
    verificationStatus: 'approved',
    description: 'Taller de mecanizado de precision y venta de excedentes industriales del Valle del Cauca.',
    badges: ['verified', 'fast_response'],
    responseTimeMins: 90,
  },
  {
    name: 'Logistica Caribe',
    legalName: 'Logistica Caribe S.A.S.',
    nit: '901987654',
    city: 'Barranquilla',
    verificationStatus: 'approved',
    description: 'Flota de transporte de carga y equipos de bodega. Renovamos flota cada 5 anos.',
    badges: ['verified'],
    responseTimeMins: 180,
  },
  {
    name: 'Alimentos del Eje',
    legalName: 'Alimentos del Eje Cafetero S.A.S.',
    nit: '900555111',
    city: 'Pereira',
    verificationStatus: 'pending',
    description: 'Procesamiento de alimentos. Vendemos equipos por modernizacion de planta.',
    badges: [],
    responseTimeMins: null,
  },
  {
    name: 'Construcciones Paisas',
    legalName: 'Construcciones Paisas S.A.S.',
    nit: '811222333',
    city: 'Medellin',
    verificationStatus: 'approved',
    description: 'Constructora con 15 anos de trayectoria. Liquidamos equipo de obra periodicamente.',
    badges: ['verified', 'top_seller'],
    responseTimeMins: 60,
  },
]

type PubSeed = {
  title: string
  category: string
  company: string | null
  brand: string
  model: string
  year: number
  usageHours?: number
  condition: string
  price: number
  city: string
  description: string
  specs: Record<string, string | number>
  photos: number
  documents?: number
  featured?: boolean
  status?: string
}

const PUBLICATIONS: PubSeed[] = [
  {
    title: 'Compresor de piston 5 HP con tanque 300 litros',
    category: 'equipos',
    company: null,
    brand: 'Schulz',
    model: 'MSV 40 Max',
    year: 2021,
    usageHours: 900,
    condition: 'Usado - buen estado',
    price: 4200000,
    city: 'Bogota',
    description:
      'Compresor de piston de 5 HP con tanque de 300 litros, usado en taller propio de carpinteria. Poco uso, mantenimiento al dia con cambio de aceite reciente. Vendo por cierre del taller.',
    specs: { capacidad: 300, material: 'Acero al carbono', presion: 10 },
    photos: 3,
  },
  {
    title: 'Lote de herramienta electrica Bosch profesional',
    category: 'otros',
    company: null,
    brand: 'Bosch',
    model: 'Professional',
    year: 2022,
    condition: 'Usado - buen estado',
    price: 3800000,
    city: 'Medellin',
    description:
      'Lote de herramienta electrica profesional Bosch: rotomartillo, pulidora, caladora y atornillador, con sus estuches originales. Herramienta de uso personal en buen estado.',
    specs: { cantidad: 4, estadoLote: 'Usado' },
    photos: 3,
  },
  {
    title: 'Torno CNC Mazak Quick Turn 250',
    category: 'maquinaria-industrial',
    company: 'Industrias Andinas',
    brand: 'Mazak',
    model: 'Quick Turn 250',
    year: 2016,
    usageHours: 12400,
    condition: 'Usado - buen estado',
    price: 185000000,
    city: 'Bogota',
    description:
      'Torno CNC Mazak Quick Turn 250 con control Mazatrol. Mantenimiento preventivo al dia, husillo revisado en 2025. Se entrega con juego de portaherramientas, manuales originales y capacitacion basica de operacion. Motivo de venta: renovacion de linea de produccion.',
    specs: { potencia: 22, voltaje: '440V', peso: 4200, control: 'CNC' },
    photos: 6,
    documents: 2,
    featured: true,
  },
  {
    title: 'Fresadora universal Bridgeport Series I',
    category: 'maquinaria-industrial',
    company: 'Metalmecanica del Valle',
    brand: 'Bridgeport',
    model: 'Series I',
    year: 2012,
    usageHours: 18900,
    condition: 'Usado - operativo',
    price: 42000000,
    city: 'Cali',
    description:
      'Fresadora universal Bridgeport Series I, cabezal revisado, mesa 9x42 pulgadas. Incluye visualizador digital de 3 ejes y prensa de precision. Equipo en operacion continua hasta la fecha, disponible para prueba en sitio.',
    specs: { potencia: 3.7, voltaje: '220V', peso: 1100, control: 'Manual' },
    photos: 5,
    documents: 1,
  },
  {
    title: 'Prensa hidraulica 100 toneladas',
    category: 'maquinaria-industrial',
    company: 'Industrias Andinas',
    brand: 'Enerpac',
    model: 'IPE-10050',
    year: 2018,
    usageHours: 6200,
    condition: 'Usado - excelente estado',
    price: 68000000,
    city: 'Bogota',
    description:
      'Prensa hidraulica de taller de 100 toneladas, marco en H, cilindro central desplazable. Bomba electrica incluida, manometro calibrado en 2026. Ideal para montaje y desmontaje de rodamientos y enderezado de piezas.',
    specs: { potencia: 5.5, voltaje: '440V', peso: 2800, control: 'Manual' },
    photos: 4,
  },
  {
    title: 'Compresor de tornillo Atlas Copco GA 37',
    category: 'equipos',
    company: 'Industrias Andinas',
    brand: 'Atlas Copco',
    model: 'GA 37 VSD',
    year: 2019,
    usageHours: 9800,
    condition: 'Usado - buen estado',
    price: 54000000,
    city: 'Bogota',
    description:
      'Compresor de tornillo rotativo con variador de velocidad, 37 kW. Incluye secador refrigerativo y tanque pulmon de 500 litros. Historial de mantenimiento completo disponible. Consumo optimizado por VSD.',
    specs: { capacidad: 500, material: 'Acero al carbono', presion: 10 },
    photos: 5,
    documents: 1,
    featured: true,
  },
  {
    title: 'Tanque de acero inoxidable 5000 litros',
    category: 'equipos',
    company: 'Alimentos del Eje',
    brand: 'Inoxcol',
    model: 'TK-5000',
    year: 2020,
    condition: 'Usado - como nuevo',
    price: 28000000,
    city: 'Pereira',
    description:
      'Tanque de almacenamiento en acero inoxidable 304 sanitario, capacidad 5000 litros, con camisa de enfriamiento y agitador. Usado en linea de lacteos durante 3 anos. Certificado de material disponible.',
    specs: { capacidad: 5000, material: 'Acero inoxidable', presion: 3 },
    photos: 4,
    documents: 1,
  },
  {
    title: 'Generador diesel Cummins 250 kVA',
    category: 'equipos',
    company: 'Construcciones Paisas',
    brand: 'Cummins',
    model: 'C250D5',
    year: 2017,
    usageHours: 4100,
    condition: 'Usado - operativo',
    price: 95000000,
    city: 'Medellin',
    description:
      'Planta electrica diesel Cummins de 250 kVA en cabina insonorizada. Tablero de transferencia automatica incluido. Usada como respaldo en obra, bajo horometro. Se entrega con tanque de 400 litros.',
    specs: { capacidad: 400, material: 'Acero al carbono', presion: 1 },
    photos: 6,
  },
  {
    title: 'Camion Chevrolet NPR 2018 furgon seco',
    category: 'vehiculos',
    company: 'Logistica Caribe',
    brand: 'Chevrolet',
    model: 'NPR Reward',
    year: 2018,
    condition: 'Usado - buen estado',
    price: 135000000,
    city: 'Barranquilla',
    description:
      'Camion Chevrolet NPR con furgon seco de 5 metros, capacidad 4.5 toneladas. Documentos al dia, tecnomecanica vigente, un solo propietario. Mantenimiento en concesionario, facturas disponibles.',
    specs: { kilometraje: 210000, combustible: 'Diesel', capacidadCarga: 4.5, transmision: 'Manual' },
    photos: 7,
    documents: 3,
    featured: true,
  },
  {
    title: 'Montacargas Toyota 2.5 toneladas',
    category: 'vehiculos',
    company: 'Logistica Caribe',
    brand: 'Toyota',
    model: '8FGU25',
    year: 2019,
    usageHours: 5600,
    condition: 'Usado - excelente estado',
    price: 72000000,
    city: 'Barranquilla',
    description:
      'Montacargas Toyota a gas de 2.5 toneladas, torre triplex 4.7 metros, desplazador lateral. Llantas nuevas, bateria y sistema electrico revisados. Operativo en bodega climatizada.',
    specs: { kilometraje: 0, combustible: 'Gas', capacidadCarga: 2.5, transmision: 'Automatica' },
    photos: 5,
  },
  {
    title: 'Volqueta Kenworth T370 doble troque',
    category: 'vehiculos',
    company: 'Construcciones Paisas',
    brand: 'Kenworth',
    model: 'T370',
    year: 2015,
    condition: 'Usado - operativo',
    price: 210000000,
    city: 'Medellin',
    description:
      'Volqueta doble troque Kenworth T370, platon de 16 metros cubicos. Motor PACCAR revisado en 2025, caja Eaton de 10 velocidades. Trabajo en obra civil, mantenimiento programado al dia.',
    specs: { kilometraje: 380000, combustible: 'Diesel', capacidadCarga: 16, transmision: 'Manual' },
    photos: 6,
    documents: 2,
  },
  {
    title: 'Retroexcavadora Caterpillar 416F',
    category: 'construccion',
    company: 'Construcciones Paisas',
    brand: 'Caterpillar',
    model: '416F2',
    year: 2016,
    usageHours: 7800,
    condition: 'Usado - buen estado',
    price: 245000000,
    city: 'Medellin',
    description:
      'Retroexcavadora CAT 416F2 4x4, cabina cerrada con aire acondicionado. Balde frontal 1 metro cubico y balde trasero 60 cm. Horometro real, sin reparaciones mayores. Disponible para inspeccion tecnica.',
    specs: { alcance: 6.5, capacidadIzaje: 3.2, motor: 'CAT 3054C 87 HP' },
    photos: 8,
    documents: 2,
    featured: true,
  },
  {
    title: 'Andamio multidireccional 500 metros cuadrados',
    category: 'construccion',
    company: 'Construcciones Paisas',
    brand: 'Layher',
    model: 'Allround',
    year: 2019,
    condition: 'Usado - buen estado',
    price: 48000000,
    city: 'Medellin',
    description:
      'Lote de andamio multidireccional Layher Allround equivalente a 500 metros cuadrados de fachada. Incluye plataformas metalicas, barandas, diagonales y bases regulables. Almacenado bajo techo.',
    specs: { alcance: 20, capacidadIzaje: 0.5, motor: 'No aplica' },
    photos: 4,
  },
  {
    title: 'Mezcladora de concreto 1 saco',
    category: 'construccion',
    company: 'Construcciones Paisas',
    brand: 'Imcoinsa',
    model: 'MC-350',
    year: 2021,
    usageHours: 2200,
    condition: 'Usado - como nuevo',
    price: 6800000,
    city: 'Medellin',
    description:
      'Mezcladora de concreto de 1 saco con motor electrico de 2 HP. Poco uso, pintura original. Ideal para obra pequena o remodelacion. Se entregan 3 unidades disponibles.',
    specs: { alcance: 0, capacidadIzaje: 0.35, motor: 'Electrico 2 HP' },
    photos: 3,
  },
  {
    title: 'Horno rotatorio industrial 20 bandejas',
    category: 'alimentos',
    company: 'Alimentos del Eje',
    brand: 'Nova',
    model: 'Max 2000',
    year: 2019,
    usageHours: 11200,
    condition: 'Usado - buen estado',
    price: 38000000,
    city: 'Pereira',
    description:
      'Horno rotatorio a gas para panaderia industrial, capacidad 20 bandejas. Sistema de vapor funcional, control digital de temperatura y tiempo. Usado en produccion de panaderia, se vende por cambio de linea.',
    specs: { produccionHora: 180, temperatura: '50 a 300 C', certificacion: 'INVIMA' },
    photos: 5,
    documents: 1,
  },
  {
    title: 'Empacadora al vacio doble campana',
    category: 'alimentos',
    company: 'Alimentos del Eje',
    brand: 'Henkelman',
    model: 'Polar 2-95',
    year: 2021,
    condition: 'Usado - excelente estado',
    price: 24000000,
    city: 'Pereira',
    description:
      'Empacadora al vacio de doble campana en acero inoxidable, bomba Busch de 100 metros cubicos por hora. Programas configurables, sellado doble. Mantenimiento reciente con cambio de aceite y sellos.',
    specs: { produccionHora: 120, temperatura: 'Ambiente', certificacion: 'HACCP' },
    photos: 4,
  },
  {
    title: 'Cuarto frio modular 30 metros cubicos',
    category: 'alimentos',
    company: 'Alimentos del Eje',
    brand: 'Bohn',
    model: 'CF-30',
    year: 2018,
    condition: 'Usado - operativo',
    price: 45000000,
    city: 'Pereira',
    description:
      'Cuarto frio modular desarmable de 30 metros cubicos con unidad condensadora Bohn. Paneles de poliuretano de 10 cm, piso reforzado. Temperatura de operacion de 0 a 4 grados. Se desmonta y entrega en sitio.',
    specs: { produccionHora: 0, temperatura: '0 a 4 C', certificacion: 'INVIMA' },
    photos: 5,
    documents: 1,
  },
  {
    title: 'Lote 40 puestos de trabajo modulares',
    category: 'muebles',
    company: 'Industrias Andinas',
    brand: 'Ofiplan',
    model: 'Serie Open',
    year: 2021,
    condition: 'Usado - buen estado',
    price: 32000000,
    city: 'Bogota',
    description:
      'Lote de 40 puestos de trabajo modulares con divisiones acusticas, cada uno con cajonera metalica y silla ergonomica. Desmontados y embalados, listos para retirar. Se vende el lote completo.',
    specs: { cantidad: 40, material: 'Melamina', dimensiones: '140 x 70 x 75 cm' },
    photos: 4,
  },
  {
    title: 'Estanteria industrial selectiva 120 metros',
    category: 'muebles',
    company: 'Logistica Caribe',
    brand: 'Mecalux',
    model: 'M7',
    year: 2020,
    condition: 'Usado - excelente estado',
    price: 54000000,
    city: 'Barranquilla',
    description:
      'Estanteria selectiva para estiba, 120 metros lineales, altura 8 metros, 4 niveles de carga. Capacidad 2500 kg por larguero. Incluye protectores de columna y senalizacion. Desmontaje incluido.',
    specs: { cantidad: 120, material: 'Metal', dimensiones: '2.7 x 1.1 x 8 m' },
    photos: 6,
  },
  {
    title: 'Lote 25 portatiles Dell Latitude 5420',
    category: 'tecnologia',
    company: 'Industrias Andinas',
    brand: 'Dell',
    model: 'Latitude 5420',
    year: 2021,
    condition: 'Usado - buen estado',
    price: 42000000,
    city: 'Bogota',
    description:
      'Lote de 25 portatiles corporativos Dell Latitude 5420, procesador Intel i5 de 11va generacion. Baterias con salud superior al 80 por ciento, formateados y con licencia Windows 11 Pro. Renovacion de parque tecnologico.',
    specs: { cantidad: 25, procesador: 'Intel Core i5-1135G7', memoria: 16, almacenamiento: 'SSD 512 GB' },
    photos: 4,
    documents: 1,
  },
  {
    title: 'Servidor Dell PowerEdge R740',
    category: 'tecnologia',
    company: 'Metalmecanica del Valle',
    brand: 'Dell',
    model: 'PowerEdge R740',
    year: 2019,
    usageHours: 32000,
    condition: 'Usado - operativo',
    price: 28000000,
    city: 'Cali',
    description:
      'Servidor de rack 2U con doble procesador Xeon Silver 4210, 128 GB de RAM ECC y controladora PERC H740P. Incluye 8 discos SAS de 1.2 TB y doble fuente redundante. Retirado por migracion a nube.',
    specs: { cantidad: 1, procesador: '2x Intel Xeon Silver 4210', memoria: 128, almacenamiento: '8x SAS 1.2 TB' },
    photos: 5,
  },
  {
    title: 'Impresora 3D industrial Markforged X7',
    category: 'tecnologia',
    company: 'Metalmecanica del Valle',
    brand: 'Markforged',
    model: 'X7',
    year: 2022,
    usageHours: 1800,
    condition: 'Usado - como nuevo',
    price: 165000000,
    city: 'Cali',
    description:
      'Impresora 3D industrial de fibra continua Markforged X7. Escaneo laser de nivelacion, camara de impresion cerrada. Incluye material de onyx y fibra de carbono sin abrir. Bajo uso, garantia de fabrica vencida.',
    specs: { cantidad: 1, procesador: 'No aplica', memoria: 0, almacenamiento: 'Interno 32 GB' },
    photos: 6,
    documents: 2,
    featured: true,
  },
  {
    title: 'Lote de excedente de acero inoxidable 304',
    category: 'otros',
    company: 'Metalmecanica del Valle',
    brand: 'Acesco',
    model: 'Lamina 304',
    year: 2024,
    condition: 'Nuevo',
    price: 18000000,
    city: 'Cali',
    description:
      'Excedente de produccion de lamina de acero inoxidable 304, calibre 16, aproximadamente 2.4 toneladas en formatos variados. Material nuevo sin uso, almacenado bajo techo. Certificado de colada disponible.',
    specs: { cantidad: 2400, estadoLote: 'Nuevo' },
    photos: 3,
    documents: 1,
  },
  {
    title: 'Inventario de repuestos hidraulicos',
    category: 'otros',
    company: 'Industrias Andinas',
    brand: 'Parker',
    model: 'Mixto',
    year: 2023,
    condition: 'Nuevo',
    price: 22000000,
    city: 'Bogota',
    description:
      'Inventario de repuestos hidraulicos Parker: mangueras, racores, sellos y valvulas. Aproximadamente 800 referencias nuevas en empaque original. Se entrega listado detallado en Excel al interesado.',
    specs: { cantidad: 800, estadoLote: 'Nuevo' },
    photos: 3,
    documents: 1,
  },
  {
    title: 'Planta de tratamiento de agua 10 metros cubicos',
    category: 'equipos',
    company: 'Alimentos del Eje',
    brand: 'Veolia',
    model: 'PTAR-10',
    year: 2017,
    condition: 'Usado - operativo',
    price: 62000000,
    city: 'Pereira',
    description:
      'Planta compacta de tratamiento de agua residual industrial con capacidad de 10 metros cubicos por dia. Incluye tanque de aireacion, sedimentador y sistema de dosificacion. Retirada por ampliacion de capacidad.',
    specs: { capacidad: 10000, material: 'Acero inoxidable', presion: 2 },
    photos: 4,
  },
  {
    title: 'Soldadora MIG Lincoln Power MIG 360MP',
    category: 'maquinaria-industrial',
    company: 'Metalmecanica del Valle',
    brand: 'Lincoln Electric',
    model: 'Power MIG 360MP',
    year: 2020,
    usageHours: 3400,
    condition: 'Usado - excelente estado',
    price: 16000000,
    city: 'Cali',
    description:
      'Soldadora multiproceso Lincoln Power MIG 360MP, capacidad MIG, TIG, stick y flux-cored. Incluye antorcha, carro y regulador. Uso moderado en taller, sin fallas reportadas.',
    specs: { potencia: 10, voltaje: '220V', peso: 120, control: 'PLC' },
    photos: 4,
  },
]

function daysFromNow(days: number): Date {
  return new Date(Date.now() + days * 86400000)
}

function daysAgo(days: number): Date {
  return new Date(Date.now() - days * 86400000)
}

function photoSet(count: number, seed: string): string[] {
  return Array.from({ length: count }, (_, i) => `/api/placeholder/${encodeURIComponent(seed)}-${i + 1}`)
}

function docSet(count: number): { name: string; url: string }[] {
  const names = ['ficha-tecnica.pdf', 'manual-operacion.pdf', 'certificado.pdf']
  return Array.from({ length: count }, (_, i) => ({
    name: names[i] ?? `documento-${i + 1}.pdf`,
    url: `/docs/${names[i] ?? `documento-${i + 1}.pdf`}`,
  }))
}

async function main() {
  console.log('Limpiando base de datos...')
  await db.auditLog.deleteMany()
  await db.analyticsEvent.deleteMany()
  await db.lead.deleteMany()
  await db.favorite.deleteMany()
  await db.follow.deleteMany()
  await db.savedSearch.deleteMany()
  await db.review.deleteMany()
  await db.payment.deleteMany()
  await db.subscription.deleteMany()
  await db.publication.deleteMany()
  await db.categoryAttribute.deleteMany()
  await db.category.deleteMany()
  await db.plan.deleteMany()
  await db.adBanner.deleteMany()
  await db.setting.deleteMany()
  await db.user.updateMany({ data: { companyId: null } })
  await db.company.deleteMany()
  await db.user.deleteMany()
  await db.city.deleteMany()
  await db.country.deleteMany()

  console.log('Creando pais y ciudades...')
  const country = await db.country.create({
    data: {
      isoCode: env.locale.countryCode,
      name: env.locale.countryName,
      currency: env.locale.currency,
      currencySymbol: env.locale.currencySymbol,
      phonePrefix: env.locale.phonePrefix,
      locale: env.locale.locale,
      timezone: env.locale.timezone,
      taxRate: env.tax.rate,
      taxLabel: env.tax.label,
    },
  })

  const cityMap = new Map<string, string>()
  for (const city of CITIES) {
    const created = await db.city.create({ data: { ...city, countryId: country.id } })
    cityMap.set(city.name, created.id)
  }

  console.log('Creando categorias...')
  const categoryMap = new Map<string, string>()
  for (const [index, cat] of CATEGORIES.entries()) {
    const created = await db.category.create({
      data: {
        slug: cat.slug,
        name: cat.name,
        icon: cat.icon,
        position: index,
        attributes: {
          create: cat.attributes.map((attr, i) => ({
            key: attr.key,
            label: attr.label,
            type: attr.type,
            unit: 'unit' in attr ? (attr.unit as string) : null,
            options: JSON.stringify('options' in attr ? attr.options : []),
            position: i,
          })),
        },
      },
    })
    categoryMap.set(cat.slug, created.id)
  }

  console.log('Creando planes...')
  for (const plan of PLANS) {
    await db.plan.create({
      data: {
        slug: plan.slug,
        name: plan.name,
        kind: plan.kind,
        price: plan.price,
        currency: env.locale.currency,
        durationDays: plan.durationDays,
        publicationQuota: plan.publicationQuota,
        featuredQuota: plan.featuredQuota,
        features: JSON.stringify(plan.features),
        position: plan.position,
      },
    })
  }

  console.log('Creando usuarios y empresas...')
  const adminHash = await bcrypt.hash(env.seed.adminPassword, env.auth.bcryptRounds)
  const demoHash = await bcrypt.hash(env.seed.demoPassword, env.auth.bcryptRounds)

  await db.user.create({
    data: {
      email: env.seed.adminEmail,
      passwordHash: adminHash,
      fullName: 'Administrador MOVIA',
      role: 'admin',
      accountType: 'natural',
      countryId: country.id,
    },
  })

  const companyMap = new Map<string, string>()
  for (const [index, comp] of COMPANIES.entries()) {
    const owner = await db.user.create({
      data: {
        email: `empresa${index + 1}@movia.co`,
        passwordHash: demoHash,
        fullName: `Contacto ${comp.name}`,
        phone: `${env.locale.phonePrefix}30012345${index}0`,
        role: 'owner',
        accountType: 'company',
        countryId: country.id,
      },
    })

    const created = await db.company.create({
      data: {
        name: comp.name,
        legalName: comp.legalName,
        nit: comp.nit,
        nitCheckDigit: nitCheckDigit(comp.nit),
        rut: `${comp.nit}-${nitCheckDigit(comp.nit)}`,
        chamberOfCommerce: `CC-${comp.nit.slice(-6)}`,
        description: comp.description,
        phone: `${env.locale.phonePrefix}30012345${index}0`,
        email: `contacto@${comp.name.toLowerCase().replace(/\s+/g, '')}.co`,
        countryId: country.id,
        cityId: cityMap.get(comp.city) ?? null,
        verificationStatus: comp.verificationStatus,
        verifiedAt: comp.verificationStatus === 'approved' ? daysAgo(120) : null,
        verificationEvidence:
          comp.verificationStatus === 'approved'
            ? JSON.stringify({ source: 'RUES', matched: true, checkedAt: daysAgo(120).toISOString() })
            : null,
        ownerId: owner.id,
        badges: JSON.stringify(comp.badges),
        responseTimeMins: comp.responseTimeMins,
        createdAt: daysAgo(400 - index * 40),
      },
    })

    await db.user.update({ where: { id: owner.id }, data: { companyId: created.id } })
    companyMap.set(comp.name, created.id)

    if (comp.verificationStatus === 'approved') {
      const plan = await db.plan.findFirst({ where: { slug: index < 2 ? 'empresa-pro' : 'empresa-mensual' } })
      if (plan) {
        const sub = await db.subscription.create({
          data: {
            companyId: created.id,
            planId: plan.id,
            status: 'active',
            quotaUsed: 4 + index,
            startedAt: daysAgo(12),
            expiresAt: daysFromNow(18),
          },
        })
        const net = plan.price / (1 + env.tax.rate)
        await db.payment.create({
          data: {
            companyId: created.id,
            planId: plan.id,
            subscriptionId: sub.id,
            concept: `Suscripcion ${plan.name}`,
            amountNet: Math.round(net),
            taxAmount: Math.round(plan.price - net),
            amountTotal: plan.price,
            currency: env.locale.currency,
            method: index % 2 === 0 ? 'pse' : 'card',
            gateway: env.payment.gateway,
            gatewayRef: `demo-${created.id.slice(-8)}`,
            status: 'approved',
            invoiceNumber: `FE-${1000 + index}`,
            paidAt: daysAgo(12),
          },
        })
      }
    }
  }

  console.log('Creando compradores...')
  const buyers = []
  for (let i = 0; i < 6; i++) {
    buyers.push(
      await db.user.create({
        data: {
          email: `comprador${i + 1}@movia.co`,
          passwordHash: demoHash,
          fullName: `Comprador Demo ${i + 1}`,
          phone: `${env.locale.phonePrefix}31098765${i}0`,
          role: 'user',
          accountType: 'natural',
          countryId: country.id,
        },
      }),
    )
  }

  console.log('Creando publicaciones...')
  const leadSources = ['whatsapp', 'chat', 'email']
  let pubIndex = 0

  for (const pub of PUBLICATIONS) {
    const categoryId = categoryMap.get(pub.category)
    const companyId = pub.company ? companyMap.get(pub.company) : null
    if (!categoryId) continue
    if (pub.company && !companyId) continue

    const photos = photoSet(pub.photos, slugify(pub.title))
    const documents = pub.documents ? docSet(pub.documents) : []
    const specs = pub.specs

    const completeness = scoreCompleteness({
      title: pub.title,
      description: pub.description,
      brand: pub.brand,
      model: pub.model,
      year: pub.year,
      usageHours: pub.usageHours,
      condition: pub.condition,
      cityId: cityMap.get(pub.city),
      price: pub.price,
      photos,
      documents,
      specs,
    })

    const ageDays = 3 + pubIndex * 2
    const created = await db.publication.create({
      data: {
        slug: `${slugify(pub.title)}-${pubIndex + 1}`,
        title: pub.title,
        description: pub.description,
        categoryId,
        companyId: companyId ?? null,
        brand: pub.brand,
        model: pub.model,
        year: pub.year,
        usageHours: pub.usageHours ?? null,
        condition: pub.condition,
        price: pub.price,
        currency: env.locale.currency,
        negotiable: pubIndex % 3 === 0,
        countryId: country.id,
        cityId: cityMap.get(pub.city) ?? null,
        photos: JSON.stringify(photos),
        documents: JSON.stringify(documents),
        specs: JSON.stringify(specs),
        status: pub.status ?? 'active',
        featured: pub.featured ?? false,
        featuredUntil: pub.featured ? daysFromNow(7) : null,
        completeness: completeness.score,
        publishedAt: daysAgo(ageDays),
        expiresAt: daysFromNow(env.publication.durationLongDays - (ageDays % 25)),
        createdAt: daysAgo(ageDays),
      },
    })

    const viewCount = 40 + ((pubIndex * 37) % 260) + (pub.featured ? 180 : 0)
    const favoriteCount = Math.floor(viewCount * 0.06)
    const leadCount = Math.max(1, Math.floor(viewCount * 0.045))

    const events = []
    for (let d = 0; d < Math.min(ageDays, 30); d++) {
      const dayViews = Math.max(1, Math.round(viewCount / Math.min(ageDays, 30)))
      for (let v = 0; v < dayViews; v++) {
        events.push({
          publicationId: created.id,
          type: 'view',
          sessionId: `s-${pubIndex}-${d}-${v}`,
          createdAt: daysAgo(d),
        })
      }
    }
    await db.analyticsEvent.createMany({ data: events })

    let firstContactAt: Date | null = null
    for (let l = 0; l < leadCount; l++) {
      const source = leadSources[l % leadSources.length]
      const buyer = buyers[l % buyers.length]
      const at = daysAgo(Math.max(0, ageDays - 1 - l))
      if (!firstContactAt || at < firstContactAt) firstContactAt = at

      await db.lead.create({
        data: {
          publicationId: created.id,
          buyerId: buyer.id,
          source,
          name: buyer.fullName,
          email: buyer.email,
          phone: buyer.phone,
          message:
            source === 'whatsapp'
              ? null
              : `Buenos dias, estoy interesado en ${pub.title}. Esta disponible para inspeccion?`,
          readAt: l % 3 === 0 ? at : null,
          createdAt: at,
        },
      })

      await db.analyticsEvent.create({
        data: {
          publicationId: created.id,
          type: source === 'whatsapp' ? 'whatsapp_click' : source === 'email' ? 'email_click' : 'chat_start',
          createdAt: at,
        },
      })
    }

    for (let f = 0; f < Math.min(favoriteCount, buyers.length); f++) {
      await db.favorite.create({
        data: { userId: buyers[f].id, publicationId: created.id, createdAt: daysAgo(f + 1) },
      })
      await db.analyticsEvent.create({
        data: { publicationId: created.id, type: 'favorite', createdAt: daysAgo(f + 1) },
      })
    }

    await db.publication.update({
      where: { id: created.id },
      data: {
        viewCount,
        favoriteCount: Math.min(favoriteCount, buyers.length),
        leadCount,
        firstContactAt,
      },
    })

    pubIndex++
  }

  console.log('Creando seguidores y resenas...')
  for (const [name, companyId] of companyMap) {
    for (let i = 0; i < 3; i++) {
      await db.follow.create({ data: { userId: buyers[i].id, companyId } }).catch(() => null)
    }
    await db.review.create({
      data: {
        authorId: buyers[0].id,
        companyId,
        rating: 5,
        comment: `Excelente experiencia con ${name}. Respuesta rapida y equipo tal como se describia.`,
        status: 'approved',
        createdAt: daysAgo(20),
      },
    })
    await db.review.create({
      data: {
        authorId: buyers[1].id,
        companyId,
        rating: 4,
        comment: 'Buena atencion, el proceso de inspeccion fue sencillo.',
        status: 'pending',
        createdAt: daysAgo(4),
      },
    })
  }

  console.log('Creando configuracion comercial...')
  const settings = [
    { key: 'commercial.publication_short_days', value: String(env.publication.durationShortDays), group: 'commercial', label: 'Vigencia publicacion corta' },
    { key: 'commercial.publication_long_days', value: String(env.publication.durationLongDays), group: 'commercial', label: 'Vigencia publicacion larga' },
    { key: 'commercial.tax_rate', value: String(env.tax.rate), group: 'commercial', label: 'Tarifa de impuesto' },
    { key: 'commercial.tax_label', value: env.tax.label, group: 'commercial', label: 'Nombre del impuesto' },
    { key: 'commercial.featured_days', value: '7', group: 'commercial', label: 'Duracion destacado' },
    { key: 'search.page_size', value: String(env.search.pageSize), group: 'search', label: 'Resultados por pagina' },
  ]
  for (const s of settings) {
    await db.setting.create({ data: s })
  }

  const counts = {
    categorias: await db.category.count(),
    empresas: await db.company.count(),
    publicaciones: await db.publication.count(),
    leads: await db.lead.count(),
    eventos: await db.analyticsEvent.count(),
    planes: await db.plan.count(),
  }
  console.log('Listo:', counts)
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await db.$disconnect()
  })
