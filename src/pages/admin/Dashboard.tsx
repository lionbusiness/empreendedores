import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { supabase } from '@/lib/supabase'
import { useAuth } from '@/contexts/AuthContext'
import type { Application } from '@/types/database'

interface Stats {
  total: number
  active: number
  inactive: number
  pending: number
}

export function Dashboard() {
  const { profile } = useAuth()
  const [stats, setStats] = useState<Stats>({ total: 0, active: 0, inactive: 0, pending: 0 })
  const [recent, setRecent] = useState<Application[]>([])

  useEffect(() => {
    if (!profile) return
    const orgId = profile.organization_id

    supabase.from('entrepreneurs').select('status', { count: 'exact' }).eq('organization_id', orgId).eq('status', 'active')
      .then(({ count }) => setStats((s) => ({ ...s, active: count ?? 0 })))
    supabase.from('entrepreneurs').select('status', { count: 'exact' }).eq('organization_id', orgId).eq('status', 'inactive')
      .then(({ count }) => setStats((s) => ({ ...s, inactive: count ?? 0, total: s.active + (count ?? 0) })))
    supabase.from('applications').select('status', { count: 'exact' }).eq('organization_id', orgId).eq('status', 'pending')
      .then(({ count }) => setStats((s) => ({ ...s, pending: count ?? 0 })))
    supabase.from('applications').select('*, category:categories(*)').eq('organization_id', orgId).order('created_at', { ascending: false }).limit(5)
      .then(({ data }) => setRecent((data as Application[]) ?? []))
  }, [profile])

  const cards = [
    { label: 'Total de empreendedores', value: stats.total },
    { label: 'Ativos', value: stats.active },
    { label: 'Inativos', value: stats.inactive },
    { label: 'Solicitações pendentes', value: stats.pending },
  ]

  return (
    <div>
      <h1 className="font-display text-2xl text-cream sm:text-3xl">Dashboard</h1>
      <p className="mt-1 text-sand">Bem-vindo(a) de volta, {profile?.name?.split(' ')[0]}.</p>

      <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {cards.map((c) => (
          <div key={c.label} className="rounded-lg border border-ink-700 bg-ink-800 p-5">
            <p className="text-sm text-sand">{c.label}</p>
            <p className="mt-2 font-display text-3xl text-gold-300">{c.value}</p>
          </div>
        ))}
      </div>

      <div className="mt-10">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="font-display text-xl text-cream">Solicitações recentes</h2>
          <Link to="/admin/solicitacoes" className="text-sm text-gold-400 hover:text-gold-300">Ver todas →</Link>
        </div>
        <div className="overflow-x-auto rounded-lg border border-ink-700">
          <table className="w-full text-left text-sm">
            <thead className="bg-ink-800 text-sand">
              <tr>
                <th className="px-4 py-3">Nome</th>
                <th className="px-4 py-3">Empreendimento</th>
                <th className="px-4 py-3">Categoria</th>
                <th className="px-4 py-3">Data</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3"></th>
              </tr>
            </thead>
            <tbody>
              {recent.map((a) => (
                <tr key={a.id} className="border-t border-ink-800 text-cream">
                  <td className="px-4 py-3">{a.owner_name}</td>
                  <td className="px-4 py-3">{a.business_name}</td>
                  <td className="px-4 py-3 text-sand">{a.category?.name ?? '—'}</td>
                  <td className="px-4 py-3 text-sand">{new Date(a.created_at).toLocaleDateString('pt-BR')}</td>
                  <td className="px-4 py-3"><StatusBadge status={a.status} /></td>
                  <td className="px-4 py-3">
                    <Link to={`/admin/solicitacoes/${a.id}`} className="text-gold-400 hover:text-gold-300">Analisar</Link>
                  </td>
                </tr>
              ))}
              {recent.length === 0 && (
                <tr><td colSpan={6} className="px-4 py-6 text-center text-sand">Nenhuma solicitação ainda.</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}

export function StatusBadge({ status }: { status: string }) {
  const map: Record<string, string> = {
    pending: 'bg-gold-500/15 text-gold-300',
    in_review: 'bg-blue-500/15 text-blue-300',
    approved: 'bg-green-500/15 text-green-300',
    rejected: 'bg-red-500/15 text-red-300',
    active: 'bg-green-500/15 text-green-300',
    inactive: 'bg-ink-700 text-sand',
  }
  const label: Record<string, string> = {
    pending: 'Pendente', in_review: 'Em análise', approved: 'Aprovada', rejected: 'Rejeitada',
    active: 'Ativo', inactive: 'Inativo',
  }
  return <span className={`rounded-full px-2.5 py-1 text-xs ${map[status] ?? 'bg-ink-700 text-sand'}`}>{label[status] ?? status}</span>
}
