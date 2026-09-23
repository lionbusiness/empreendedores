import { useEffect, useState, type FormEvent } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { supabase } from '@/lib/supabase'
import { useAuth } from '@/contexts/AuthContext'
import type { Category, Entrepreneur } from '@/types/database'
import { slugify } from '@/lib/helpers'

const inputClass = 'w-full rounded-md border border-ink-700 bg-ink-900 px-3 py-2 text-sm text-cream focus:border-gold-500'
const labelClass = 'mb-1.5 block text-sm text-sand'

export function EntrepreneurForm() {
  const { id } = useParams()
  const isNew = !id || id === 'novo'
  const { profile } = useAuth()
  const navigate = useNavigate()

  const [categories, setCategories] = useState<Category[]>([])
  const [entrepreneur, setEntrepreneur] = useState<Partial<Entrepreneur>>({
    service_type: 'presencial',
    service_area: 'local',
    status: 'inactive',
    featured: false,
  })
  const [imageFile, setImageFile] = useState<File | null>(null)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!profile) return
    supabase.from('categories').select('*').eq('organization_id', profile.organization_id).order('name')
      .then(({ data }) => setCategories((data as Category[]) ?? []))

    if (!isNew && id) {
      supabase.from('entrepreneurs').select('*').eq('id', id).single().then(({ data }) => {
        if (data) setEntrepreneur(data as Entrepreneur)
      })
    }
  }, [profile, id, isNew])

  async function handleSubmit(e: FormEvent) {
    e.preventDefault()
    if (!profile) return
    setSaving(true)
    setError(null)
    try {
      let image_url = entrepreneur.image_url ?? null
      if (imageFile) {
        const path = `${profile.organization_id}/entrepreneurs/${id ?? crypto.randomUUID()}-${imageFile.name}`
        const { error: uploadError } = await supabase.storage.from('lion-business').upload(path, imageFile, { upsert: true })
        if (uploadError) throw uploadError
        image_url = supabase.storage.from('lion-business').getPublicUrl(path).data.publicUrl
      }

      const payload = {
        ...entrepreneur,
        organization_id: profile.organization_id,
        image_url,
        slug: entrepreneur.slug || slugify(entrepreneur.business_name ?? ''),
      }

      if (isNew) {
        const { error: insertError } = await supabase.from('entrepreneurs').insert(payload)
        if (insertError) throw insertError
      } else {
        const { error: updateError } = await supabase.from('entrepreneurs').update(payload).eq('id', id)
        if (updateError) throw updateError
      }
      navigate('/admin/empreendedores')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao salvar.')
    } finally {
      setSaving(false)
    }
  }

  function set<K extends keyof Entrepreneur>(key: K, value: Entrepreneur[K]) {
    setEntrepreneur((prev) => ({ ...prev, [key]: value }))
  }

  return (
    <div className="max-w-2xl">
      <h1 className="font-display text-2xl text-cream sm:text-3xl">
        {isNew ? 'Novo empreendedor' : 'Editar empreendedor'}
      </h1>

      <form onSubmit={handleSubmit} className="mt-8 flex flex-col gap-4">
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className={labelClass}>Nome do empreendimento *</label>
            <input required className={inputClass} value={entrepreneur.business_name ?? ''} onChange={(e) => set('business_name', e.target.value)} />
          </div>
          <div>
            <label className={labelClass}>Nome do responsável *</label>
            <input required className={inputClass} value={entrepreneur.owner_name ?? ''} onChange={(e) => set('owner_name', e.target.value)} />
          </div>
        </div>

        <div>
          <label className={labelClass}>Categoria</label>
          <select className={inputClass} value={entrepreneur.category_id ?? ''} onChange={(e) => set('category_id', e.target.value)}>
            <option value="">Sem categoria</option>
            {categories.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
          </select>
        </div>

        <div>
          <label className={labelClass}>Descrição</label>
          <textarea rows={3} className={inputClass} value={entrepreneur.description ?? ''} onChange={(e) => set('description', e.target.value)} />
        </div>

        <div className="grid gap-4 sm:grid-cols-3">
          <div>
            <label className={labelClass}>WhatsApp</label>
            <input className={inputClass} value={entrepreneur.whatsapp ?? ''} onChange={(e) => set('whatsapp', e.target.value)} />
          </div>
          <div>
            <label className={labelClass}>Telefone</label>
            <input className={inputClass} value={entrepreneur.phone ?? ''} onChange={(e) => set('phone', e.target.value)} />
          </div>
          <div>
            <label className={labelClass}>E-mail (interno)</label>
            <input className={inputClass} value={entrepreneur.email ?? ''} onChange={(e) => set('email', e.target.value)} />
          </div>
          <div>
            <label className={labelClass}>Instagram</label>
            <input className={inputClass} value={entrepreneur.instagram ?? ''} onChange={(e) => set('instagram', e.target.value)} />
          </div>
          <div>
            <label className={labelClass}>Site</label>
            <input className={inputClass} value={entrepreneur.website ?? ''} onChange={(e) => set('website', e.target.value)} />
          </div>
          <div>
            <label className={labelClass}>Horário</label>
            <input className={inputClass} value={entrepreneur.business_hours ?? ''} onChange={(e) => set('business_hours', e.target.value)} />
          </div>
        </div>

        <div className="grid gap-4 sm:grid-cols-3">
          <div>
            <label className={labelClass}>Cidade</label>
            <input className={inputClass} value={entrepreneur.city ?? ''} onChange={(e) => set('city', e.target.value)} />
          </div>
          <div>
            <label className={labelClass}>Estado</label>
            <input className={inputClass} value={entrepreneur.state ?? ''} onChange={(e) => set('state', e.target.value)} />
          </div>
          <div>
            <label className={labelClass}>Bairro</label>
            <input className={inputClass} value={entrepreneur.neighborhood ?? ''} onChange={(e) => set('neighborhood', e.target.value)} />
          </div>
          <div className="sm:col-span-3">
            <label className={labelClass}>Endereço</label>
            <input className={inputClass} value={entrepreneur.address ?? ''} onChange={(e) => set('address', e.target.value)} />
          </div>
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className={labelClass}>Tipo de atendimento</label>
            <select className={inputClass} value={entrepreneur.service_type} onChange={(e) => set('service_type', e.target.value as Entrepreneur['service_type'])}>
              <option value="online">Online</option>
              <option value="presencial">Presencial</option>
              <option value="online_presencial">Online e presencial</option>
            </select>
          </div>
          <div>
            <label className={labelClass}>Área de atendimento</label>
            <select className={inputClass} value={entrepreneur.service_area} onChange={(e) => set('service_area', e.target.value as Entrepreneur['service_area'])}>
              <option value="local">Local</option>
              <option value="regional">Regional</option>
              <option value="nacional">Nacional</option>
              <option value="internacional">Internacional</option>
            </select>
          </div>
        </div>

        <div>
          <label className={labelClass}>Foto / logo</label>
          <input type="file" accept="image/*" onChange={(e) => setImageFile(e.target.files?.[0] ?? null)}
            className="text-sm text-sand file:mr-4 file:rounded-md file:border-0 file:bg-gold-gradient file:px-4 file:py-2 file:text-sm file:font-semibold file:text-ink-950" />
          {entrepreneur.image_url && !imageFile && (
            <img src={entrepreneur.image_url} alt="" className="mt-2 h-24 w-24 rounded-md object-cover" />
          )}
        </div>

        <div className="flex items-center gap-6">
          <label className="flex items-center gap-2 text-sm text-sand">
            <input type="checkbox" checked={entrepreneur.status === 'active'} onChange={(e) => set('status', e.target.checked ? 'active' : 'inactive')} className="h-4 w-4 accent-gold-500" />
            Ativo (visível publicamente)
          </label>
          <label className="flex items-center gap-2 text-sm text-sand">
            <input type="checkbox" checked={!!entrepreneur.featured} onChange={(e) => set('featured', e.target.checked)} className="h-4 w-4 accent-gold-500" />
            Destaque
          </label>
        </div>

        {error && <p className="text-sm text-red-400">{error}</p>}

        <button type="submit" disabled={saving} className="mt-2 w-fit rounded-md bg-gold-gradient px-6 py-2.5 text-sm font-semibold text-ink-950 hover:opacity-90 disabled:opacity-50">
          {saving ? 'Salvando…' : 'Salvar'}
        </button>
      </form>
    </div>
  )
}
