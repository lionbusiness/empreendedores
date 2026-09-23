import { useEffect, useState, type FormEvent } from 'react'
import { supabase } from '@/lib/supabase'
import { useAuth } from '@/contexts/AuthContext'
import type { Category } from '@/types/database'
import { slugify } from '@/lib/helpers'

export function Categories() {
  const { profile } = useAuth()
  const [categories, setCategories] = useState<Category[]>([])
  const [name, setName] = useState('')
  const [saving, setSaving] = useState(false)

  async function load() {
    if (!profile) return
    const { data } = await supabase.from('categories').select('*').eq('organization_id', profile.organization_id).order('name')
    setCategories((data as Category[]) ?? [])
  }

  useEffect(() => { load() }, [profile])

  async function addCategory(e: FormEvent) {
    e.preventDefault()
    if (!profile || !name.trim()) return
    setSaving(true)
    await supabase.from('categories').insert({
      organization_id: profile.organization_id,
      name: name.trim(),
      slug: slugify(name.trim()),
    })
    setName('')
    setSaving(false)
    load()
  }

  async function toggleActive(c: Category) {
    await supabase.from('categories').update({ active: !c.active }).eq('id', c.id)
    setCategories((prev) => prev.map((x) => (x.id === c.id ? { ...x, active: !x.active } : x)))
  }

  return (
    <div className="max-w-xl">
      <h1 className="font-display text-2xl text-cream sm:text-3xl">Categorias</h1>

      <form onSubmit={addCategory} className="mt-6 flex gap-3">
        <input
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Nova categoria"
          className="flex-1 rounded-md border border-ink-700 bg-ink-900 px-3 py-2 text-sm text-cream focus:border-gold-500"
        />
        <button disabled={saving} className="rounded-md bg-gold-gradient px-4 py-2 text-sm font-semibold text-ink-950 hover:opacity-90 disabled:opacity-50">
          Adicionar
        </button>
      </form>

      <ul className="mt-6 divide-y divide-ink-800 rounded-lg border border-ink-700">
        {categories.map((c) => (
          <li key={c.id} className="flex items-center justify-between px-4 py-3">
            <span className={`text-sm ${c.active ? 'text-cream' : 'text-sand line-through'}`}>{c.name}</span>
            <button onClick={() => toggleActive(c)} className="text-xs text-gold-400 hover:text-gold-300">
              {c.active ? 'Desativar' : 'Ativar'}
            </button>
          </li>
        ))}
        {categories.length === 0 && <li className="px-4 py-6 text-center text-sm text-sand">Nenhuma categoria ainda.</li>}
      </ul>
    </div>
  )
}
