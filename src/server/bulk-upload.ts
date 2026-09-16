import { db } from '@/lib/db'
import { env } from '@/lib/env'
import { slugify } from '@/lib/utils'
import { scoreCompleteness } from '@/lib/completeness'

export const BULK_COLUMNS = [
  { key: 'titulo', label: 'titulo', required: true, hint: 'Nombre del activo' },
  { key: 'categoria', label: 'categoria', required: true, hint: 'Slug de categoria' },
  { key: 'precio', label: 'precio', required: true, hint: 'Valor numerico sin puntos' },
  { key: 'marca', label: 'marca', required: false, hint: 'Marca del fabricante' },
  { key: 'modelo', label: 'modelo', required: false, hint: 'Modelo exacto' },
  { key: 'anio', label: 'anio', required: false, hint: 'Ano de fabricacion' },
  { key: 'horas_uso', label: 'horas_uso', required: false, hint: 'Horas de uso acumuladas' },
  { key: 'condicion', label: 'condicion', required: false, hint: 'Estado del activo' },
  { key: 'ciudad', label: 'ciudad', required: false, hint: 'Ciudad donde esta el activo' },
  { key: 'descripcion', label: 'descripcion', required: false, hint: 'Descripcion detallada' },
  { key: 'specs', label: 'specs', required: false, hint: 'Pares clave=valor separados por ;' },
] as const

export type BulkIssue = {
  row: number
  column: string
  message: string
  severity: 'error' | 'warning'
}

export type BulkRowResult = {
  row: number
  title: string
  categorySlug: string
  categoryName: string | null
  price: number | null
  cityName: string | null
  completeness: number
  valid: boolean
  issues: BulkIssue[]
  normalized: Record<string, unknown> | null
}

export type BulkPreview = {
  totalRows: number
  validRows: number
  invalidRows: number
  issues: BulkIssue[]
  rows: BulkRowResult[]
}

function parseSpecs(raw: string | undefined): Record<string, string> {
  if (!raw?.trim()) return {}
  const specs: Record<string, string> = {}
  for (const pair of raw.split(';')) {
    const [key, ...rest] = pair.split('=')
    if (!key?.trim() || !rest.length) continue
    specs[key.trim()] = rest.join('=').trim()
  }
  return specs
}

function toNumber(raw: string | undefined): number | null {
  if (raw === undefined || raw.trim() === '') return null
  const cleaned = raw.replace(/[^\d.-]/g, '')
  if (!cleaned) return null
  const value = Number(cleaned)
  return Number.isFinite(value) ? value : null
}

export async function validateBulkRows(rows: Record<string, string>[]): Promise<BulkPreview> {
  const [categories, cities] = await Promise.all([
    db.category.findMany({
      where: { active: true },
      select: { id: true, slug: true, name: true, attributes: { select: { key: true, required: true, label: true } } },
    }),
    db.city.findMany({ select: { id: true, name: true } }),
  ])

  const categoryBySlug = new Map(categories.map((c) => [c.slug, c]))
  const categoryByName = new Map(categories.map((c) => [c.name.toLowerCase(), c]))
  const cityByName = new Map(cities.map((c) => [c.name.toLowerCase(), c]))

  const allIssues: BulkIssue[] = []
  const results: BulkRowResult[] = []

  if (rows.length > env.bulk.maxRows) {
    allIssues.push({
      row: 0,
      column: 'archivo',
      message: `El archivo supera el maximo de ${env.bulk.maxRows} filas`,
      severity: 'error',
    })
  }

  rows.slice(0, env.bulk.maxRows).forEach((raw, i) => {
    const rowNumber = i + 2
    const issues: BulkIssue[] = []

    const title = (raw.titulo ?? '').trim()
    const categoryRaw = (raw.categoria ?? '').trim()
    const price = toNumber(raw.precio)
    const year = toNumber(raw.anio)
    const usageHours = toNumber(raw.horas_uso)
    const cityRaw = (raw.ciudad ?? '').trim()
    const specs = parseSpecs(raw.specs)

    if (!title) {
      issues.push({ row: rowNumber, column: 'titulo', message: 'El titulo es obligatorio', severity: 'error' })
    } else if (title.length < 8) {
      issues.push({
        row: rowNumber,
        column: 'titulo',
        message: 'El titulo es muy corto, usa al menos 8 caracteres',
        severity: 'warning',
      })
    }

    const category =
      categoryBySlug.get(categoryRaw.toLowerCase()) ?? categoryByName.get(categoryRaw.toLowerCase())

    if (!categoryRaw) {
      issues.push({ row: rowNumber, column: 'categoria', message: 'La categoria es obligatoria', severity: 'error' })
    } else if (!category) {
      issues.push({
        row: rowNumber,
        column: 'categoria',
        message: `Categoria "${categoryRaw}" no existe. Validas: ${categories.map((c) => c.slug).join(', ')}`,
        severity: 'error',
      })
    }

    if (price === null) {
      issues.push({ row: rowNumber, column: 'precio', message: 'El precio es obligatorio', severity: 'error' })
    } else if (price <= 0) {
      issues.push({ row: rowNumber, column: 'precio', message: 'El precio debe ser mayor a cero', severity: 'error' })
    }

    if (year !== null && (year < 1900 || year > new Date().getFullYear() + 1)) {
      issues.push({ row: rowNumber, column: 'anio', message: 'Ano fuera de rango', severity: 'error' })
    }

    if (usageHours !== null && usageHours < 0) {
      issues.push({ row: rowNumber, column: 'horas_uso', message: 'Las horas de uso no pueden ser negativas', severity: 'error' })
    }

    const city = cityRaw ? cityByName.get(cityRaw.toLowerCase()) : undefined
    if (cityRaw && !city) {
      issues.push({
        row: rowNumber,
        column: 'ciudad',
        message: `Ciudad "${cityRaw}" no reconocida`,
        severity: 'warning',
      })
    }

    if (category) {
      for (const attr of category.attributes.filter((a) => a.required)) {
        if (!specs[attr.key]) {
          issues.push({
            row: rowNumber,
            column: 'specs',
            message: `Falta la especificacion obligatoria "${attr.label}" para ${category.name}`,
            severity: 'error',
          })
        }
      }
    }

    const completeness = scoreCompleteness({
      title,
      description: raw.descripcion,
      brand: raw.marca,
      model: raw.modelo,
      year,
      usageHours,
      condition: raw.condicion,
      cityId: city?.id ?? null,
      price,
      photos: [],
      documents: [],
      specs,
    })

    const hasError = issues.some((issue) => issue.severity === 'error')
    allIssues.push(...issues)

    results.push({
      row: rowNumber,
      title: title || '(sin titulo)',
      categorySlug: categoryRaw,
      categoryName: category?.name ?? null,
      price,
      cityName: city?.name ?? null,
      completeness: completeness.score,
      valid: !hasError,
      issues,
      normalized: hasError
        ? null
        : {
            title,
            categoryId: category!.id,
            price: price!,
            brand: raw.marca?.trim() || null,
            model: raw.modelo?.trim() || null,
            year,
            usageHours,
            condition: raw.condicion?.trim() || null,
            cityId: city?.id ?? null,
            description: raw.descripcion?.trim() || null,
            specs,
            completeness: completeness.score,
          },
    })
  })

  return {
    totalRows: results.length,
    validRows: results.filter((r) => r.valid).length,
    invalidRows: results.filter((r) => !r.valid).length,
    issues: allIssues,
    rows: results,
  }
}

export async function commitBulkRows(companyId: string, preview: BulkPreview) {
  const company = await db.company.findUnique({
    where: { id: companyId },
    select: { id: true, countryId: true },
  })
  if (!company) throw new Error('Empresa no encontrada')

  const valid = preview.rows.filter((r) => r.valid && r.normalized)
  const created: string[] = []

  for (const row of valid) {
    const data = row.normalized as Record<string, unknown>
    const base = slugify(String(data.title))
    const slug = `${base}-${Math.random().toString(36).slice(2, 8)}`

    const publication = await db.publication.create({
      data: {
        slug,
        title: String(data.title),
        description: (data.description as string | null) ?? null,
        categoryId: String(data.categoryId),
        companyId: company.id,
        brand: (data.brand as string | null) ?? null,
        model: (data.model as string | null) ?? null,
        year: (data.year as number | null) ?? null,
        usageHours: (data.usageHours as number | null) ?? null,
        condition: (data.condition as string | null) ?? null,
        price: Number(data.price),
        currency: env.locale.currency,
        countryId: company.countryId,
        cityId: (data.cityId as string | null) ?? null,
        photos: '[]',
        documents: '[]',
        specs: JSON.stringify(data.specs ?? {}),
        status: 'active',
        completeness: Number(data.completeness ?? 0),
        expiresAt: new Date(Date.now() + env.publication.durationLongDays * 86400000),
      },
      select: { id: true },
    })

    created.push(publication.id)
  }

  await db.auditLog.create({
    data: {
      action: 'bulk_upload',
      entity: 'publication',
      payload: JSON.stringify({ companyId, created: created.length, skipped: preview.invalidRows }),
    },
  })

  return { created: created.length, skipped: preview.invalidRows, ids: created }
}

export function buildTemplateCsv(categorySlug?: string): string {
  const header = BULK_COLUMNS.map((c) => c.label).join(',')

  const samples: Record<string, string[]> = {
    'maquinaria-industrial': [
      'Torno CNC Haas ST-20,maquinaria-industrial,145000000,Haas,ST-20,2018,8200,Usado - buen estado,Bogota,Torno CNC con control Haas y contrapunto hidraulico,potencia=15;voltaje=440V;control=CNC',
    ],
    vehiculos: [
      'Camion NPR furgon 2019,vehiculos,142000000,Chevrolet,NPR,2019,,Usado - buen estado,Medellin,Camion con furgon seco documentos al dia,kilometraje=180000;combustible=Diesel;capacidadCarga=4.5',
    ],
    construccion: [
      'Minicargador Bobcat S570,construccion,168000000,Bobcat,S570,2017,4300,Usado - operativo,Cali,Minicargador con balde estandar y llantas nuevas,alcance=3;capacidadIzaje=0.9;motor=Bobcat 61 HP',
    ],
  }

  const rows = categorySlug && samples[categorySlug] ? samples[categorySlug] : Object.values(samples).flat()

  return [header, ...rows].join('\n')
}
