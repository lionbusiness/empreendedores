import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { supabase } from '@/lib/supabase'
import { useAuth } from '@/contexts/AuthContext'
import type { Application, ApplicationStatus } from '@/types/database'
import { StatusBadge } from './Dashboard'

const statusFilters: { value: ApplicationStatus | 'all'; label: string }[] = [
  { value: 'all', label: 'Todas' },
  { value: 'pending', label: 'Pendentes' },
  { value: 'in_review', label: 'Em análise' },
  { value: 'approved', label: 'Aprovadas' },
  { value: 'rejected', label: 'Rejeitadas' },
]

export function Applications() {
  const { profile } = useAuth()
  const [applications, setApplications] = useState<Application[]>([])
  const [filter, setFilter] = useState<ApplicationStatus | 'all'>('all')
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!profile) return
    let query = supabase.from('applications').select('*, category:categories(*)').eq('organization_id', profile.organization_id).order('created_at', { ascending: false })
    if (filter !== 'all') query = query.eq('status', filter)
    query.then(({ data }) => {
      setApplications((data as Application[]) ?? [])
      setLoading(false)
    })
  }, [profile, filter])

  return (
    <div>
      <h1 className="font-display text-2xl text-cream sm:text-3xl">Solicitações</h1>

      <div className="mt-6 flex flex-wrap gap-2">
        {statusFilters.map((f) => (
          <button
            key={f.value}
            onClick={() => setFilter(f.value)}
            className={`rounded-full px-4 py-1.5 text-sm transition-colors ${
              filter === f.value ? 'bg-gold-gradient text-ink-950 font-semibold' : 'border border-ink-700 text-sand hover:text-cream'
            }`}
          >
            {f.label}
          </button>
        ))}
      </div>

      <div className="mt-6 overflow-x-auto rounded-lg border border-ink-700">
        <table className="w-full text-left text-sm">
          <thead className="bg-ink-800 text-sand">
            <tr>
              <th className="px-4 py-3">Nome</th>
              <th className="px-4 py-3">Empreendimento</th>
              <th className="px-4 py-3">Categoria</th>
              <th className="px-4 py-3">Cidade</th>
              <th className="px-4 py-3">Data</th>
              <th className="px-4 py-3">Status</th>
              <th className="px-4 py-3"></th>
            </tr>
          </thead>
          <tbody>
            {applications.map((a) => (
              <tr key={a.id} className="border-t border-ink-800 text-cream">
                <td className="px-4 py-3">{a.owner_name}</td>
                <td className="px-4 py-3">{a.business_name}</td>
                <td className="px-4 py-3 text-sand">{a.category?.name ?? '—'}</td>
                <td className="px-4 py-3 text-sand">{a.city}</td>
                <td className="px-4 py-3 text-sand">{new Date(a.created_at).toLocaleDateString('pt-BR')}</td>
                <td className="px-4 py-3"><StatusBadge status={a.status} /></td>
                <td className="px-4 py-3">
                  <Link to={`/admin/solicitacoes/${a.id}`} className="text-gold-400 hover:text-gold-300">Analisar</Link>
                </td>
              </tr>
            ))}
            {!loading && applications.length === 0 && (
              <tr><td colSpan={7} className="px-4 py-6 text-center text-sand">Nenhuma solicitação encontrada.</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}
