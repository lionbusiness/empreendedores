import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { supabase } from '@/lib/supabase'
import { useAuth } from '@/contexts/AuthContext'
import type { Entrepreneur } from '@/types/database'
import { StatusBadge } from './Dashboard'

export function Entrepreneurs() {
  const { profile } = useAuth()
  const [list, setList] = useState<Entrepreneur[]>([])
  const [search, setSearch] = useState('')
  const [loading, setLoading] = useState(true)

  async function load() {
    if (!profile) return
    const { data } = await supabase
      .from('entrepreneurs')
      .select('*, category:categories(*)')
      .eq('organization_id', profile.organization_id)
      .order('created_at', { ascending: false })
    setList((data as Entrepreneur[]) ?? [])
    setLoading(false)
  }

  useEffect(() => { load() }, [profile])

  async function toggleStatus(e: Entrepreneur) {
    const status = e.status === 'active' ? 'inactive' : 'active'
    await supabase.from('entrepreneurs').update({ status }).eq('id', e.id)
    setList((prev) => prev.map((x) => (x.id === e.id ? { ...x, status } : x)))
  }

  async function remove(e: Entrepreneur) {
    if (!confirm(`Excluir "${e.business_name}"? Essa ação não pode ser desfeita.`)) return
    await supabase.from('entrepreneurs').delete().eq('id', e.id)
    setList((prev) => prev.filter((x) => x.id !== e.id))
  }

  const filtered = list.filter((e) => e.business_name.toLowerCase().includes(search.toLowerCase()))

  return (
    <div>
      <div className="flex items-center justify-between">
        <h1 className="font-display text-2xl text-cream sm:text-3xl">Empreendedores</h1>
        <Link to="/admin/empreendedores/novo" className="rounded-md bg-gold-gradient px-4 py-2 text-sm font-semibold text-ink-950 hover:opacity-90">
          + Novo empreendedor
        </Link>
      </div>

      <input
        type="search"
        placeholder="Pesquisar..."
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        className="mt-6 w-full max-w-xs rounded-md border border-ink-700 bg-ink-900 px-3 py-2 text-sm text-cream focus:border-gold-500"
      />

      <div className="mt-6 overflow-x-auto rounded-lg border border-ink-700">
        <table className="w-full text-left text-sm">
          <thead className="bg-ink-800 text-sand">
            <tr>
              <th className="px-4 py-3">Nome</th>
              <th className="px-4 py-3">Categoria</th>
              <th className="px-4 py-3">Cidade</th>
              <th className="px-4 py-3">Status</th>
              <th className="px-4 py-3">Destaque</th>
              <th className="px-4 py-3"></th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((e) => (
              <tr key={e.id} className="border-t border-ink-800 text-cream">
                <td className="px-4 py-3">{e.business_name}</td>
                <td className="px-4 py-3 text-sand">{e.category?.name ?? '—'}</td>
                <td className="px-4 py-3 text-sand">{e.city ?? '—'}</td>
                <td className="px-4 py-3">
                  <button onClick={() => toggleStatus(e)}><StatusBadge status={e.status} /></button>
                </td>
                <td className="px-4 py-3 text-sand">{e.featured ? 'Sim' : 'Não'}</td>
                <td className="px-4 py-3 space-x-3">
                  <Link to={`/admin/empreendedores/${e.id}`} className="text-gold-400 hover:text-gold-300">Editar</Link>
                  <button onClick={() => remove(e)} className="text-red-400 hover:text-red-300">Excluir</button>
                </td>
              </tr>
            ))}
            {!loading && filtered.length === 0 && (
              <tr><td colSpan={6} className="px-4 py-6 text-center text-sand">Nenhum empreendedor cadastrado.</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}
