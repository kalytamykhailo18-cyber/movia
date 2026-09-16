export type CompletenessInput = {
  title?: string | null
  description?: string | null
  brand?: string | null
  model?: string | null
  year?: number | null
  usageHours?: number | null
  condition?: string | null
  cityId?: string | null
  price?: number | null
  photos?: unknown[]
  videos?: unknown[]
  documents?: unknown[]
  specs?: Record<string, unknown>
}

type Rule = {
  key: string
  label: string
  weight: number
  hint: string
  satisfied: (input: CompletenessInput) => boolean
}

const RULES: Rule[] = [
  {
    key: 'title',
    label: 'Nombre del activo',
    weight: 10,
    hint: 'Agrega un nombre claro del activo',
    satisfied: (i) => Boolean(i.title && i.title.trim().length >= 8),
  },
  {
    key: 'price',
    label: 'Precio',
    weight: 10,
    hint: 'Define un precio para recibir contactos serios',
    satisfied: (i) => typeof i.price === 'number' && i.price > 0,
  },
  {
    key: 'photos',
    label: 'Fotografias',
    weight: 20,
    hint: 'Sube al menos 3 fotos reales del activo',
    satisfied: (i) => (i.photos?.length ?? 0) >= 3,
  },
  {
    key: 'description',
    label: 'Descripcion',
    weight: 15,
    hint: 'Describe estado, uso y motivo de venta',
    satisfied: (i) => Boolean(i.description && i.description.trim().length >= 80),
  },
  {
    key: 'brandModel',
    label: 'Marca y modelo',
    weight: 10,
    hint: 'Indica marca y modelo exactos, es lo que busca el comprador',
    satisfied: (i) => Boolean(i.brand?.trim() && i.model?.trim()),
  },
  {
    key: 'year',
    label: 'Ano',
    weight: 5,
    hint: 'Agrega el ano de fabricacion',
    satisfied: (i) => typeof i.year === 'number' && i.year > 1900,
  },
  {
    key: 'condition',
    label: 'Condicion',
    weight: 5,
    hint: 'Indica la condicion del activo',
    satisfied: (i) => Boolean(i.condition?.trim()),
  },
  {
    key: 'location',
    label: 'Ubicacion',
    weight: 5,
    hint: 'Indica la ciudad donde esta el activo',
    satisfied: (i) => Boolean(i.cityId),
  },
  {
    key: 'specs',
    label: 'Ficha tecnica',
    weight: 15,
    hint: 'Agrega la ficha tecnica para aumentar la confianza y visibilidad',
    satisfied: (i) => Object.keys(i.specs ?? {}).length >= 3,
  },
  {
    key: 'documents',
    label: 'Documentos',
    weight: 5,
    hint: 'Adjunta documentos o manuales si los tienes',
    satisfied: (i) => (i.documents?.length ?? 0) >= 1,
  },
]

export type CompletenessResult = {
  score: number
  missing: { key: string; label: string; hint: string; weight: number }[]
  nextBestAction: string | null
}

export function scoreCompleteness(input: CompletenessInput): CompletenessResult {
  let score = 0
  const missing: CompletenessResult['missing'] = []

  for (const rule of RULES) {
    if (rule.satisfied(input)) {
      score += rule.weight
    } else {
      missing.push({ key: rule.key, label: rule.label, hint: rule.hint, weight: rule.weight })
    }
  }

  missing.sort((a, b) => b.weight - a.weight)

  return {
    score,
    missing,
    nextBestAction: missing[0]?.hint ?? null,
  }
}
