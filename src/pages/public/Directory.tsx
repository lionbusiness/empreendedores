import { useEffect, useMemo, useState } from 'react'
import { supabase } from '@/lib/supabase'
import type { Category, Entrepreneur } from '@/types/database'
import { EntrepreneurCard } from '@/components/EntrepreneurCard'
import { DirectoryFilters, type DirectoryFilterState } from '@/components/DirectoryFilters'
import { useDocumentTitle } from '@/hooks/useDocumentTitle'

const emptyFilters: DirectoryFilterState = {
  search: '',
  categoryId: '',
  city: '',
  serviceType: '',
  serviceArea: '',
}

export function Directory() {
  useDocumentTitle('Empreendedores')
  const [entrepreneurs, setEntrepreneurs] = useState<Entrepreneur[]>([])
  const [categories, setCategories] = useState<Category[]>([])
  const [filters, setFilters] = useState(emptyFilters)
  const [loading, setLoading] = useState(true)

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

  return (
    <div className="container-page py-12">
      <h1 className="font-display text-3xl font-semibold text-cream sm:text-4xl">Empreendedores</h1>
      <p className="mt-2 max-w-xl text-sand">Explore os negócios cadastrados por membros da nossa comunidade.</p>

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
        ) : (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {filtered.map((e) => (
              <EntrepreneurCard key={e.id} entrepreneur={e} />
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
