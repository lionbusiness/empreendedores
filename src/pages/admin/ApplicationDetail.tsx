import { useEffect, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { supabase } from '@/lib/supabase'
import type { Application } from '@/types/database'
import { StatusBadge } from './Dashboard'
import { slugify } from '@/lib/helpers'

export function ApplicationDetail() {
  const { id } = useParams()
  const navigate = useNavigate()
  const [application, setApplication] = useState<Application | null>(null)
  const [notes, setNotes] = useState('')
  const [working, setWorking] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!id) return
    supabase.from('applications').select('*, category:categories(*)').eq('id', id).single().then(({ data }) => {
      const app = data as Application
      setApplication(app)
      setNotes(app?.admin_notes ?? '')
    })
  }, [id])

  async function updateStatus(status: 'in_review' | 'rejected') {
    if (!application) return
    setWorking(true)
    await supabase.from('applications').update({ status, admin_notes: notes }).eq('id', application.id)
    setApplication({ ...application, status, admin_notes: notes })
    setWorking(false)
  }

  async function approve() {
    if (!application) return
    setWorking(true)
    setError(null)
    try {
      const baseSlug = slugify(application.business_name)
      const { data: entrepreneur, error: insertError } = await supabase
        .from('entrepreneurs')
        .insert({
          organization_id: application.organization_id,
          owner_name: application.owner_name,
          business_name: application.business_name,
          slug: `${baseSlug}-${application.id.slice(0, 6)}`,
          category_id: application.category_id,
          description: application.description,
          phone: application.phone,
          whatsapp: application.whatsapp,
          email: application.email,
          instagram: application.instagram,
          website: application.website,
          city: application.city,
          state: application.state,
          neighborhood: application.neighborhood,
          address: application.address,
          service_type: application.service_type,
          service_area: application.service_area,
          image_url: application.image_url,
          status: 'active',
        })
        .select()
        .single()
      if (insertError) throw insertError

      await supabase
        .from('applications')
        .update({ status: 'approved', admin_notes: notes, created_entrepreneur_id: entrepreneur.id })
        .eq('id', application.id)

      navigate('/admin/empreendedores')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao aprovar solicitação.')
    } finally {
      setWorking(false)
    }
  }

  if (!application) return <p className="text-sand">Carregando…</p>

  const a = application
  const fieldClass = 'text-sm'

  return (
    <div className="max-w-3xl">
      <Link to="/admin/solicitacoes" className="text-sm text-gold-400 hover:text-gold-300">← Voltar</Link>

      <div className="mt-4 flex items-center justify-between">
        <h1 className="font-display text-2xl text-cream">{a.business_name}</h1>
        <StatusBadge status={a.status} />
      </div>

      <div className="mt-6 grid gap-4 rounded-lg border border-ink-700 bg-ink-800 p-6 sm:grid-cols-2">
        {a.image_url && (
          <img src={a.image_url} alt={a.business_name} className="col-span-2 h-40 w-40 rounded-md object-cover" />
        )}
        <Info label="Responsável" value={a.owner_name} />
        <Info label="Categoria" value={a.category?.name ?? '—'} />
        <Info label="WhatsApp" value={a.whatsapp} />
        <Info label="E-mail" value={a.email} />
        <Info label="Telefone" value={a.phone ?? '—'} />
        <Info label="Instagram" value={a.instagram ?? '—'} />
        <Info label="Site" value={a.website ?? '—'} />
        <Info label="Localização" value={[a.neighborhood, a.city, a.state].filter(Boolean).join(', ')} />
        <Info label="Endereço" value={a.address ?? '—'} />
        <Info label="Atendimento" value={a.service_type} />
        <Info label="Área de atendimento" value={a.service_area} />
        <div className="col-span-2">
          <p className={`${fieldClass} text-sand`}>Descrição</p>
          <p className="mt-1 text-cream">{a.description}</p>
        </div>
      </div>

      <div className="mt-6">
        <label className="mb-1.5 block text-sm text-sand" htmlFor="notes">Observação interna</label>
        <textarea
          id="notes"
          rows={3}
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          className="w-full rounded-md border border-ink-700 bg-ink-900 px-3 py-2 text-sm text-cream focus:border-gold-500"
        />
      </div>

      {error && <p className="mt-3 text-sm text-red-400">{error}</p>}

      {a.status !== 'approved' && (
        <div className="mt-6 flex flex-wrap gap-3">
          <button onClick={approve} disabled={working} className="rounded-md bg-gold-gradient px-5 py-2.5 text-sm font-semibold text-ink-950 hover:opacity-90 disabled:opacity-50">
            Aprovar e publicar
          </button>
          <button onClick={() => updateStatus('in_review')} disabled={working} className="rounded-md border border-ink-700 px-5 py-2.5 text-sm text-cream hover:border-gold-600/50">
            Marcar em análise
          </button>
          <button onClick={() => updateStatus('rejected')} disabled={working} className="rounded-md border border-red-500/40 px-5 py-2.5 text-sm text-red-400 hover:bg-red-500/10">
            Rejeitar
          </button>
        </div>
      )}
    </div>
  )
}

function Info({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <p className="text-sm text-sand">{label}</p>
      <p className="mt-1 text-cream">{value}</p>
    </div>
  )
}
