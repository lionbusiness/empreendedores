import { useEffect, useMemo, useState, Suspense, lazy } from 'react'
import { supabase } from '@/lib/supabase'
import type { Category, Entrepreneur } from '@/types/database'
import { EntrepreneurCard } from '@/components/EntrepreneurCard'
import { DirectoryFilters, type DirectoryFilterState } from '@/components/DirectoryFilters'
import { useDocumentTitle } from '@/hooks/useDocumentTitle'

const DirectoryMap = lazy(() => import('@/components/DirectoryMap').then((m) => ({ default: m.DirectoryMap })))

const emptyFilters: DirectoryFilterState = {
  search: '',
  categoryId: '',
  city: '',
  serviceType: '',
  serviceArea: '',
}

const PAGE_SIZE = 9

export function Directory() {
  useDocumentTitle('Empreendedores')
  const [entrepreneurs, setEntrepreneurs] = useState<Entrepreneur[]>([])
  const [categories, setCategories] = useState<Category[]>([])
  const [filters, setFilters] = useState(emptyFilters)
  const [loading, setLoading] = useState(true)
  const [page, setPage] = useState(1)
  const [view, setView] = useState<'lista' | 'mapa'>('lista')

  useEffect(() => {
    Promise.all([
      supabase.from('entrepreneurs').select('*, category:categories(*)').eq('status', 'active').order('featured', { ascending: false }),
      supabase.from('categories').select('*').eq('active', true).order('name'),
    ]).then(([e, c]) => {
      setEntrepreneurs((e.data as Entrepreneur[]) ?? [])
      setCategories((c.data as Category[]) ?? [])
      setLoading(false)
    })
  }, [])

  const cities = useMemo(
    () => Array.from(new Set(entrepreneurs.map((e) => e.city).filter(Boolean))) as string[],
    [entrepreneurs]
  )

  const filtered = useMemo(() => {
    return entrepreneurs.filter((e) => {
      if (filters.search && !e.business_name.toLowerCase().includes(filters.search.toLowerCase())) return false
      if (filters.categoryId && e.category_id !== filters.categoryId) return false
      if (filters.city && e.city !== filters.city) return false
      if (filters.serviceType && e.service_type !== filters.serviceType) return false
      return true
    })
  }, [entrepreneurs, filters])

  // Volta pra página 1 sempre que o filtro muda
  useEffect(() => {
    setPage(1)
  }, [filters])

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE))
  const paginated = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE)

  return (
    <div className="container-page py-12">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="font-display text-3xl font-semibold text-cream sm:text-4xl">Empreendedores</h1>
          <p className="mt-2 max-w-xl text-sand">Explore os negócios cadastrados por membros da nossa comunidade.</p>
        </div>
        <div className="flex rounded-md border border-ink-700 p-1 text-sm">
          <button
            onClick={() => setView('lista')}
            className={`rounded px-3 py-1.5 transition-colors ${view === 'lista' ? 'bg-gold-gradient text-ink-950 font-semibold' : 'text-sand'}`}
          >
            Lista
          </button>
          <button
            onClick={() => setView('mapa')}
            className={`rounded px-3 py-1.5 transition-colors ${view === 'mapa' ? 'bg-gold-gradient text-ink-950 font-semibold' : 'text-sand'}`}
          >
            Mapa
          </button>
        </div>
      </div>

      <div className="mt-8">
        <DirectoryFilters categories={categories} cities={cities} value={filters} onChange={setFilters} />
      </div>

      <div className="mt-8">
        {loading ? (
          <p className="text-sand">Carregando empreendedores…</p>
        ) : filtered.length === 0 ? (
          <div className="rounded-lg border border-dashed border-ink-700 py-16 text-center text-sand">
            Nenhum empreendedor encontrado com esses filtros.
          </div>
        ) : view === 'mapa' ? (
          <Suspense fallback={<p className="text-sand">Carregando mapa…</p>}>
            <DirectoryMap entrepreneurs={filtered} />
          </Suspense>
        ) : (
          <>
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {paginated.map((e) => (
                <EntrepreneurCard key={e.id} entrepreneur={e} />
              ))}
            </div>

            {totalPages > 1 && (
              <div className="mt-10 flex items-center justify-center gap-4">
                <button
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                  disabled={page === 1}
                  className="rounded-md border border-ink-700 px-4 py-2 text-sm text-cream disabled:opacity-40"
                >
                  ← Anterior
                </button>
                <span className="text-sm text-sand">
                  Página {page} de {totalPages}
                </span>
                <button
                  onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                  disabled={page === totalPages}
                  className="rounded-md border border-ink-700 px-4 py-2 text-sm text-cream disabled:opacity-40"
                >
                  Próxima →
                </button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  )
}
