import type { Category } from '@/types/database'

export interface DirectoryFilterState {
  search: string
  categoryId: string
  city: string
  serviceType: string
  serviceArea: string
}

interface Props {
  categories: Category[]
  cities: string[]
  value: DirectoryFilterState
  onChange: (value: DirectoryFilterState) => void
}

export function DirectoryFilters({ categories, cities, value, onChange }: Props) {
  function update<K extends keyof DirectoryFilterState>(key: K, v: DirectoryFilterState[K]) {
    onChange({ ...value, [key]: v })
  }

  const inputClass =
    'w-full rounded-md border border-ink-700 bg-ink-900 px-3 py-2 text-sm text-cream placeholder:text-sand/60 focus:border-gold-500'

  return (
    <div className="grid gap-3 rounded-lg border border-ink-700 bg-ink-800 p-4 sm:grid-cols-2 lg:grid-cols-5">
      <input
        type="search"
        placeholder="Buscar por nome do negócio..."
        className={`${inputClass} lg:col-span-2`}
        value={value.search}
        onChange={(e) => update('search', e.target.value)}
        aria-label="Buscar empreendedor"
      />
      <select className={inputClass} value={value.categoryId} onChange={(e) => update('categoryId', e.target.value)} aria-label="Filtrar por categoria">
        <option value="">Todas as categorias</option>
        {categories.map((c) => (
          <option key={c.id} value={c.id}>{c.name}</option>
        ))}
      </select>
      <select className={inputClass} value={value.city} onChange={(e) => update('city', e.target.value)} aria-label="Filtrar por cidade">
        <option value="">Todas as cidades</option>
        {cities.map((c) => (
          <option key={c} value={c}>{c}</option>
        ))}
      </select>
      <select className={inputClass} value={value.serviceType} onChange={(e) => update('serviceType', e.target.value)} aria-label="Filtrar por tipo de atendimento">
        <option value="">Qualquer atendimento</option>
        <option value="online">Online</option>
        <option value="presencial">Presencial</option>
        <option value="online_presencial">Online e presencial</option>
      </select>
    </div>
  )
}
