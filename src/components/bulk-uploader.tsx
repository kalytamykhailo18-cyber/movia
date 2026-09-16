'use client'

import { useState, useRef, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import { Upload, Download, FileSpreadsheet, AlertTriangle, CheckCircle2, X } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import { money } from '@/lib/format'
import { listVariants, cardVariants, toastVariants, accordionVariants, motionEnabled } from '@/lib/motion'

type Category = { id: string; slug: string; name: string }

type Issue = { row: number; column: string; message: string; severity: 'error' | 'warning' }

type Row = {
  row: number
  title: string
  categorySlug: string
  categoryName: string | null
  price: number | null
  cityName: string | null
  completeness: number
  valid: boolean
  issues: Issue[]
}

type Preview = {
  totalRows: number
  validRows: number
  invalidRows: number
  issues: Issue[]
  rows: Row[]
}

export function BulkUploader({ categories }: { categories: Category[] }) {
  const router = useRouter()
  const inputRef = useRef<HTMLInputElement>(null)

  const [template, setTemplate] = useState('')
  const [fileName, setFileName] = useState<string | null>(null)
  const [preview, setPreview] = useState<Preview | null>(null)
  const [uploading, setUploading] = useState(false)
  const [committing, setCommitting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [result, setResult] = useState<{ created: number; skipped: number } | null>(null)
  const [dragging, setDragging] = useState(false)
  const [ready, setReady] = useState(false)

  useEffect(() => setReady(true), [])

  async function upload(file: File) {
    setError(null)
    setResult(null)
    setUploading(true)
    setFileName(file.name)

    try {
      const body = new FormData()
      body.append('file', file)
      const res = await fetch('/api/bulk/preview', { method: 'POST', body })
      const json = await res.json()

      if (!res.ok) {
        setError(json.error ?? 'No pudimos leer el archivo')
        setPreview(null)
        return
      }
      setPreview(json)
    } catch {
      setError('No pudimos procesar el archivo')
    } finally {
      setUploading(false)
    }
  }

  async function commit() {
    if (!preview) return
    setCommitting(true)
    setError(null)

    try {
      const res = await fetch('/api/bulk/commit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ preview }),
      })
      const json = await res.json()

      if (!res.ok) {
        setError(json.error ?? 'No pudimos publicar las filas')
        return
      }

      setResult({ created: json.created, skipped: json.skipped })
      setPreview(null)
      setFileName(null)
      router.refresh()
    } catch {
      setError('No pudimos publicar las filas')
    } finally {
      setCommitting(false)
    }
  }

  function reset() {
    setPreview(null)
    setFileName(null)
    setError(null)
    setResult(null)
    if (inputRef.current) inputRef.current.value = ''
  }

  return (
    <div className="space-y-6">
      <section className="rounded-[var(--radius-card)] border border-[var(--color-border)] bg-white p-5">
        <h2 className="text-[18px] font-semibold text-[var(--color-navy)]">1. Descarga la plantilla</h2>
        <p className="mt-1 text-[14px] text-[var(--color-text-muted)]">
          Cada vertical tiene sus campos tecnicos. Descarga la plantilla de tu categoria.
        </p>

        <div className="mt-4 flex flex-col gap-2 sm:flex-row">
          <select
            value={template}
            onChange={(e) => setTemplate(e.target.value)}
            aria-label="Categoria de la plantilla"
            data-testid="template-category"
            className="h-11 flex-1 rounded-[var(--radius-input)] border border-[var(--color-border)] bg-white px-3 text-[14px] outline-none focus:border-[var(--color-primary)]"
          >
            <option value="">Todas las categorias</option>
            {categories.map((c) => (
              <option key={c.id} value={c.slug}>
                {c.name}
              </option>
            ))}
          </select>

          <a
            href={template ? `/api/bulk/template?categoria=${template}` : '/api/bulk/template'}
            data-testid="download-template"
            className="inline-flex min-h-[44px] items-center justify-center gap-2 rounded-[var(--radius-input)] border border-[#D1D5DB] bg-white px-4 text-[14px] font-medium text-[var(--color-navy)] transition-colors hover:border-[var(--color-primary)] hover:text-[var(--color-primary)]"
          >
            <Download className="size-4" aria-hidden />
            Descargar plantilla
          </a>
        </div>
      </section>

      <section className="rounded-[var(--radius-card)] border border-[var(--color-border)] bg-white p-5">
        <h2 className="text-[18px] font-semibold text-[var(--color-navy)]">2. Sube tu archivo</h2>

        <motion.div
          onDragOver={(e) => {
            e.preventDefault()
            setDragging(true)
          }}
          onDragLeave={() => setDragging(false)}
          onDrop={(e) => {
            e.preventDefault()
            setDragging(false)
            const file = e.dataTransfer.files?.[0]
            if (file) upload(file)
          }}
          animate={{
            borderColor: dragging ? 'var(--color-primary)' : 'var(--color-border)',
            backgroundColor: dragging ? 'var(--color-primary-soft)' : 'transparent',
          }}
          transition={{ duration: 0.15 }}
          className="mt-4 rounded-[var(--radius-card)] border-2 border-dashed p-8 text-center"
          data-testid="dropzone"
          data-ready={ready ? 'true' : 'false'}
        >
          <FileSpreadsheet className="mx-auto size-10 text-[var(--color-text-muted)]" aria-hidden />
          <p className="mt-3 text-[14px] text-[var(--color-navy)]">
            Arrastra tu CSV aqui o selecciona el archivo
          </p>

          <input
            ref={inputRef}
            type="file"
            accept=".csv,text/csv"
            data-testid="bulk-file-input"
            className="sr-only"
            onChange={(e) => {
              const file = e.target.files?.[0]
              if (file) upload(file)
            }}
          />

          <Button
            className="mt-4"
            loading={uploading}
            onClick={() => inputRef.current?.click()}
            data-testid="select-file"
          >
            <Upload className="size-4" aria-hidden />
            Seleccionar archivo
          </Button>

          {fileName ? (
            <p className="mt-3 text-[13px] text-[var(--color-text-muted)]" data-testid="file-name">
              {fileName}
            </p>
          ) : null}
        </motion.div>
      </section>

      <AnimatePresence>
        {error ? (
          <motion.div
            variants={motionEnabled ? toastVariants : undefined}
            initial="hidden"
            animate="show"
            exit="exit"
            className="flex items-start gap-2 rounded-[var(--radius-card)] border border-[var(--color-danger)] bg-red-50 p-4 text-[14px] text-[var(--color-danger)]"
            data-testid="bulk-error"
          >
            <AlertTriangle className="mt-0.5 size-4 shrink-0" aria-hidden />
            {error}
          </motion.div>
        ) : null}
      </AnimatePresence>

      <AnimatePresence>
        {result ? (
          <motion.div
            variants={motionEnabled ? toastVariants : undefined}
            initial="hidden"
            animate="show"
            exit="exit"
            className="flex items-start gap-2 rounded-[var(--radius-card)] border border-[var(--color-success)] bg-green-50 p-4 text-[14px] text-[var(--color-success)]"
            data-testid="bulk-result"
          >
            <CheckCircle2 className="mt-0.5 size-4 shrink-0" aria-hidden />
            <span>
              Publicamos {result.created} activos.
              {result.skipped ? ` ${result.skipped} filas quedaron fuera por errores.` : ''}
            </span>
          </motion.div>
        ) : null}
      </AnimatePresence>

      <AnimatePresence>
        {preview ? (
          <motion.section
            variants={motionEnabled ? accordionVariants : undefined}
            initial="collapsed"
            animate="expanded"
            exit="collapsed"
            className="overflow-hidden rounded-[var(--radius-card)] border border-[var(--color-border)] bg-white"
            data-testid="bulk-preview"
          >
            <div className="flex flex-wrap items-center justify-between gap-3 border-b border-[var(--color-border)] p-5">
              <div>
                <h2 className="text-[18px] font-semibold text-[var(--color-navy)]">
                  3. Revisa antes de publicar
                </h2>
                <p className="mt-1 text-[14px] text-[var(--color-text-muted)]">
                  <span data-testid="preview-total">{preview.totalRows}</span> filas leidas,{' '}
                  <strong className="text-[var(--color-success)]" data-testid="preview-valid">
                    {preview.validRows}
                  </strong>{' '}
                  listas para publicar,{' '}
                  <strong className="text-[var(--color-danger)]" data-testid="preview-invalid">
                    {preview.invalidRows}
                  </strong>{' '}
                  con errores.
                </p>
              </div>

              <div className="flex gap-2">
                <Button variant="secondary" size="sm" onClick={reset} data-testid="bulk-cancel">
                  <X className="size-4" aria-hidden />
                  Cancelar
                </Button>
                <Button
                  size="sm"
                  loading={committing}
                  disabled={preview.validRows === 0}
                  onClick={commit}
                  data-testid="bulk-commit"
                >
                  Publicar {preview.validRows} activos
                </Button>
              </div>
            </div>

            <div className="movia-scrollbar max-h-[480px] overflow-auto">
              <table className="w-full text-left text-[13px]">
                <thead className="sticky top-0 bg-[var(--color-background)] text-[12px] text-[var(--color-text-muted)]">
                  <tr>
                    <th className="px-4 py-2 font-medium">Fila</th>
                    <th className="px-4 py-2 font-medium">Titulo</th>
                    <th className="px-4 py-2 font-medium">Categoria</th>
                    <th className="px-4 py-2 font-medium">Precio</th>
                    <th className="px-4 py-2 font-medium">Calidad</th>
                    <th className="px-4 py-2 font-medium">Estado</th>
                  </tr>
                </thead>
                <motion.tbody
                  variants={motionEnabled ? listVariants : undefined}
                  initial="hidden"
                  animate="show"
                >
                  {preview.rows.map((row) => (
                    <motion.tr
                      key={row.row}
                      variants={motionEnabled ? cardVariants : undefined}
                      className={cn(
                        'border-t border-[var(--color-border)] align-top',
                        !row.valid && 'bg-red-50/50',
                      )}
                      data-testid={row.valid ? 'preview-row-valid' : 'preview-row-invalid'}
                    >
                      <td className="px-4 py-2.5 text-[var(--color-text-muted)]">{row.row}</td>
                      <td className="px-4 py-2.5 font-medium text-[var(--color-navy)]">{row.title}</td>
                      <td className="px-4 py-2.5">{row.categoryName ?? row.categorySlug}</td>
                      <td className="px-4 py-2.5">{row.price !== null ? money(row.price) : '-'}</td>
                      <td className="px-4 py-2.5">{row.completeness}%</td>
                      <td className="px-4 py-2.5">
                        {row.valid ? (
                          <span className="text-[var(--color-success)]">Lista</span>
                        ) : (
                          <ul className="space-y-1">
                            {row.issues
                              .filter((i) => i.severity === 'error')
                              .map((issue, i) => (
                                <li key={i} className="text-[var(--color-danger)]" data-testid="row-issue">
                                  <strong>{issue.column}:</strong> {issue.message}
                                </li>
                              ))}
                          </ul>
                        )}
                      </td>
                    </motion.tr>
                  ))}
                </motion.tbody>
              </table>
            </div>
          </motion.section>
        ) : null}
      </AnimatePresence>
    </div>
  )
}
