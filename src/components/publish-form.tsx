'use client'

import { useState, useMemo } from 'react'
import { useRouter } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import { ImagePlus, X, AlertTriangle } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { CompletenessBar } from '@/components/ui/completeness-bar'
import { scoreCompleteness } from '@/lib/completeness'
import { parseJson } from '@/lib/utils'
import { listVariants, cardVariants, toastVariants, motionEnabled } from '@/lib/motion'

type Attribute = {
  id: string
  key: string
  label: string
  type: string
  unit: string | null
  options: string
  required: boolean
}

type Category = { id: string; slug: string; name: string; attributes: Attribute[] }
type City = { id: string; name: string }

const CONDITIONS = [
  'Nuevo',
  'Usado - como nuevo',
  'Usado - excelente estado',
  'Usado - buen estado',
  'Usado - operativo',
  'Para repuestos',
]

export function PublishForm({ categories, cities }: { categories: Category[]; cities: City[] }) {
  const router = useRouter()

  const [form, setForm] = useState({
    title: '',
    categoryId: '',
    brand: '',
    model: '',
    year: '',
    usageHours: '',
    condition: '',
    cityId: '',
    price: '',
    description: '',
  })
  const [specs, setSpecs] = useState<Record<string, string>>({})
  const [photos, setPhotos] = useState<string[]>([])
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const category = categories.find((c) => c.id === form.categoryId)

  const completeness = useMemo(
    () =>
      scoreCompleteness({
        title: form.title,
        description: form.description,
        brand: form.brand,
        model: form.model,
        year: form.year ? Number(form.year) : null,
        usageHours: form.usageHours ? Number(form.usageHours) : null,
        condition: form.condition,
        cityId: form.cityId || null,
        price: form.price ? Number(form.price) : null,
        photos,
        documents: [],
        specs: Object.fromEntries(Object.entries(specs).filter(([, v]) => v !== '')),
      }),
    [form, specs, photos],
  )

  function set(key: keyof typeof form, value: string) {
    setForm((f) => ({ ...f, [key]: value }))
  }

  function addPhoto() {
    const seed = `${form.title || 'activo'}-${photos.length + 1}-${Date.now()}`
    setPhotos((p) => [...p, `/api/placeholder/${encodeURIComponent(seed)}`])
  }

  async function submit(e: React.FormEvent) {
    e.preventDefault()
    setError(null)
    setSubmitting(true)

    try {
      const res = await fetch('/api/publications', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...form,
          year: form.year ? Number(form.year) : null,
          usageHours: form.usageHours ? Number(form.usageHours) : null,
          price: Number(form.price),
          specs: Object.fromEntries(Object.entries(specs).filter(([, v]) => v !== '')),
          photos,
        }),
      })
      const json = await res.json()

      if (!res.ok) {
        setError(json.error ?? 'No pudimos crear la publicacion')
        return
      }

      router.push(`/publicacion/${json.slug}`)
    } catch {
      setError('No pudimos crear la publicacion')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <form onSubmit={submit} className="space-y-6" data-testid="publish-form">
      <motion.aside
        className="sticky top-20 z-10 rounded-[var(--radius-card)] border border-[var(--color-border)] bg-white p-4"
        layout
      >
        <CompletenessBar score={completeness.score} hint={completeness.nextBestAction} />
      </motion.aside>

      <Section title="Informacion basica">
        <Field
          label="Nombre del activo"
          required
          value={form.title}
          onChange={(v) => set('title', v)}
          testId="field-title"
          placeholder="Torno CNC Mazak Quick Turn 250"
        />

        <div className="grid gap-4 sm:grid-cols-2">
          <Select
            label="Categoria"
            required
            value={form.categoryId}
            onChange={(v) => {
              set('categoryId', v)
              setSpecs({})
            }}
            testId="field-category"
            options={categories.map((c) => ({ value: c.id, label: c.name }))}
            placeholder="Selecciona una categoria"
          />

          <Select
            label="Condicion"
            value={form.condition}
            onChange={(v) => set('condition', v)}
            testId="field-condition"
            options={CONDITIONS.map((c) => ({ value: c, label: c }))}
            placeholder="Selecciona la condicion"
          />
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="Marca" value={form.brand} onChange={(v) => set('brand', v)} testId="field-brand" />
          <Field label="Modelo" value={form.model} onChange={(v) => set('model', v)} testId="field-model" />
        </div>

        <div className="grid gap-4 sm:grid-cols-3">
          <Field
            label="Ano"
            type="number"
            value={form.year}
            onChange={(v) => set('year', v)}
            testId="field-year"
          />
          <Field
            label="Horas de uso"
            type="number"
            value={form.usageHours}
            onChange={(v) => set('usageHours', v)}
            testId="field-usage"
          />
          <Select
            label="Ciudad"
            value={form.cityId}
            onChange={(v) => set('cityId', v)}
            testId="field-city"
            options={cities.map((c) => ({ value: c.id, label: c.name }))}
            placeholder="Selecciona"
          />
        </div>

        <Field
          label="Precio"
          type="number"
          required
          value={form.price}
          onChange={(v) => set('price', v)}
          testId="field-price"
          placeholder="185000000"
          hint="Muestra el precio final con IVA incluido"
        />
      </Section>

      <Section title="Descripcion">
        <label className="block">
          <span className="text-[13px] font-medium text-[var(--color-navy)]">
            Describe el activo, su estado y el motivo de venta
          </span>
          <textarea
            rows={6}
            value={form.description}
            onChange={(e) => set('description', e.target.value)}
            data-testid="field-description"
            placeholder="Estado general, mantenimientos realizados, que se incluye en la entrega..."
            className="mt-1 w-full rounded-[var(--radius-input)] border border-[var(--color-border)] p-3 text-[14px] outline-none transition-colors focus:border-[var(--color-primary)]"
          />
          <span className="mt-1 block text-[12px] text-[var(--color-text-muted)]">
            {form.description.length} caracteres. Con 80 o mas sube la calidad de la publicacion.
          </span>
        </label>
      </Section>

      <AnimatePresence mode="wait">
        {category && category.attributes.length ? (
          <motion.div
            key={category.id}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.25 }}
          >
            <Section title={`Ficha tecnica - ${category.name}`}>
              <motion.div
                variants={motionEnabled ? listVariants : undefined}
                initial="hidden"
                animate="show"
                className="grid gap-4 sm:grid-cols-2"
                data-testid="specs-fields"
              >
                {category.attributes.map((attr) => {
                  const options = parseJson<string[]>(attr.options, [])
                  return (
                    <motion.div key={attr.id} variants={motionEnabled ? cardVariants : undefined}>
                      {attr.type === 'select' && options.length ? (
                        <Select
                          label={attr.label}
                          required={attr.required}
                          value={specs[attr.key] ?? ''}
                          onChange={(v) => setSpecs((s) => ({ ...s, [attr.key]: v }))}
                          testId={`spec-${attr.key}`}
                          options={options.map((o) => ({ value: o, label: o }))}
                          placeholder="Selecciona"
                        />
                      ) : (
                        <Field
                          label={attr.unit ? `${attr.label} (${attr.unit})` : attr.label}
                          type={attr.type === 'number' ? 'number' : 'text'}
                          required={attr.required}
                          value={specs[attr.key] ?? ''}
                          onChange={(v) => setSpecs((s) => ({ ...s, [attr.key]: v }))}
                          testId={`spec-${attr.key}`}
                        />
                      )}
                    </motion.div>
                  )
                })}
              </motion.div>
            </Section>
          </motion.div>
        ) : null}
      </AnimatePresence>

      <Section title="Fotografias">
        <p className="text-[13px] text-[var(--color-text-muted)]">
          Sube al menos 3 fotos reales. Las publicaciones con galeria completa reciben mas contactos.
        </p>

        <motion.div
          variants={motionEnabled ? listVariants : undefined}
          initial="hidden"
          animate="show"
          className="mt-3 grid grid-cols-3 gap-3 sm:grid-cols-5"
          data-testid="photo-grid"
        >
          <AnimatePresence>
            {photos.map((photo, i) => (
              <motion.div
                key={photo}
                layout
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                transition={{ duration: 0.2 }}
                className="relative aspect-square overflow-hidden rounded-[var(--radius-input)] border border-[var(--color-border)]"
                data-testid="photo-item"
              >
                <img src={photo} alt={`Foto ${i + 1}`} className="size-full object-cover" />
                <button
                  type="button"
                  onClick={() => setPhotos((p) => p.filter((x) => x !== photo))}
                  aria-label={`Quitar foto ${i + 1}`}
                  className="absolute right-1 top-1 inline-flex size-6 items-center justify-center rounded-full bg-[var(--color-navy)]/80 text-white"
                >
                  <X className="size-3" aria-hidden />
                </button>
              </motion.div>
            ))}
          </AnimatePresence>

          <motion.button
            type="button"
            layout
            onClick={addPhoto}
            whileHover={motionEnabled ? { scale: 1.02 } : undefined}
            whileTap={motionEnabled ? { scale: 0.98 } : undefined}
            data-testid="add-photo"
            className="flex aspect-square flex-col items-center justify-center gap-1 rounded-[var(--radius-input)] border-2 border-dashed border-[var(--color-border)] text-[var(--color-text-muted)] transition-colors hover:border-[var(--color-primary)] hover:text-[var(--color-primary)]"
          >
            <ImagePlus className="size-5" aria-hidden />
            <span className="text-[11px]">Agregar</span>
          </motion.button>
        </motion.div>
      </Section>

      <AnimatePresence>
        {error ? (
          <motion.p
            variants={motionEnabled ? toastVariants : undefined}
            initial="hidden"
            animate="show"
            exit="exit"
            className="flex items-center gap-2 rounded-[var(--radius-input)] bg-red-50 p-3 text-[14px] text-[var(--color-danger)]"
            data-testid="publish-error"
          >
            <AlertTriangle className="size-4 shrink-0" aria-hidden />
            {error}
          </motion.p>
        ) : null}
      </AnimatePresence>

      <div className="flex flex-col gap-2 sm:flex-row sm:justify-end">
        <Button type="button" variant="secondary" onClick={() => router.back()}>
          Cancelar
        </Button>
        <Button type="submit" loading={submitting} data-testid="publish-submit">
          Publicar activo
        </Button>
      </div>
    </form>
  )
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="space-y-4 rounded-[var(--radius-card)] border border-[var(--color-border)] bg-white p-5">
      <h2 className="text-[20px] font-semibold text-[var(--color-navy)]">{title}</h2>
      {children}
    </section>
  )
}

function Field({
  label,
  value,
  onChange,
  type = 'text',
  required = false,
  placeholder,
  hint,
  testId,
}: {
  label: string
  value: string
  onChange: (value: string) => void
  type?: string
  required?: boolean
  placeholder?: string
  hint?: string
  testId: string
}) {
  return (
    <label className="block">
      <span className="text-[13px] font-medium text-[var(--color-navy)]">
        {label}
        {required ? <span className="text-[var(--color-danger)]"> *</span> : null}
      </span>
      <input
        type={type}
        value={value}
        required={required}
        placeholder={placeholder}
        onChange={(e) => onChange(e.target.value)}
        data-testid={testId}
        className="mt-1 h-11 w-full rounded-[var(--radius-input)] border border-[var(--color-border)] px-3 text-[14px] outline-none transition-colors focus:border-[var(--color-primary)]"
      />
      {hint ? <span className="mt-1 block text-[12px] text-[var(--color-text-muted)]">{hint}</span> : null}
    </label>
  )
}

function Select({
  label,
  value,
  onChange,
  options,
  required = false,
  placeholder,
  testId,
}: {
  label: string
  value: string
  onChange: (value: string) => void
  options: { value: string; label: string }[]
  required?: boolean
  placeholder?: string
  testId: string
}) {
  return (
    <label className="block">
      <span className="text-[13px] font-medium text-[var(--color-navy)]">
        {label}
        {required ? <span className="text-[var(--color-danger)]"> *</span> : null}
      </span>
      <select
        value={value}
        required={required}
        onChange={(e) => onChange(e.target.value)}
        data-testid={testId}
        className="mt-1 h-11 w-full rounded-[var(--radius-input)] border border-[var(--color-border)] bg-white px-3 text-[14px] outline-none transition-colors focus:border-[var(--color-primary)]"
      >
        <option value="">{placeholder ?? 'Selecciona'}</option>
        {options.map((o) => (
          <option key={o.value} value={o.value}>
            {o.label}
          </option>
        ))}
      </select>
    </label>
  )
}
