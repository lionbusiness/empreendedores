import { useEffect, useState, type FormEvent } from 'react'
import { supabase } from '@/lib/supabase'
import { useAuth } from '@/contexts/AuthContext'
import type { Organization as OrganizationType } from '@/types/database'

const inputClass = 'w-full rounded-md border border-ink-700 bg-ink-900 px-3 py-2 text-sm text-cream focus:border-gold-500'
const labelClass = 'mb-1.5 block text-sm text-sand'

export function Organization() {
  const { profile } = useAuth()
  const [org, setOrg] = useState<OrganizationType | null>(null)
  const [logoFile, setLogoFile] = useState<File | null>(null)
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!profile) return
    supabase.from('organizations').select('*').eq('id', profile.organization_id).single()
      .then(({ data }) => setOrg(data as OrganizationType))
  }, [profile])

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault()
    if (!org) return
    setSaving(true)
    setSaved(false)
    setError(null)
    try {
      let logo_url = org.logo_url
      if (logoFile) {
        const path = `${org.id}/organization/logo-${Date.now()}-${logoFile.name}`
        const { error: uploadError } = await supabase.storage.from('lion-business').upload(path, logoFile, { upsert: true })
        if (uploadError) throw uploadError
        logo_url = supabase.storage.from('lion-business').getPublicUrl(path).data.publicUrl
      }
      const { error: updateError } = await supabase
        .from('organizations')
        .update({ name: org.name, logo_url })
        .eq('id', org.id)
      if (updateError) throw updateError
      setOrg({ ...org, logo_url })
      setSaved(true)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao salvar.')
    } finally {
      setSaving(false)
    }
  }

  if (!org) return <p className="text-sand">Carregando…</p>

  return (
    <div className="max-w-lg">
      <h1 className="font-display text-2xl text-cream sm:text-3xl">Organização</h1>
      <p className="mt-1 text-sand">
        Dados da igreja/organização usada nesta instância do Lion Business.
      </p>

      <form onSubmit={handleSubmit} className="mt-8 flex flex-col gap-5">
        <div>
          <label className={labelClass}>Nome</label>
          <input className={inputClass} value={org.name} onChange={(e) => setOrg({ ...org, name: e.target.value })} />
        </div>

        <div>
          <label className={labelClass}>Slug (identificador único, não editável)</label>
          <input className={`${inputClass} opacity-60`} value={org.slug} disabled />
        </div>

        <div>
          <label className={labelClass}>Logo</label>
          {org.logo_url && !logoFile && (
            <img src={org.logo_url} alt={org.name} className="mb-2 h-16 w-16 rounded-md object-contain bg-ink-900 p-1" />
          )}
          <input
            type="file"
            accept="image/*"
            onChange={(e) => setLogoFile(e.target.files?.[0] ?? null)}
            className="text-sm text-sand file:mr-4 file:rounded-md file:border-0 file:bg-gold-gradient file:px-4 file:py-2 file:text-sm file:font-semibold file:text-ink-950"
          />
          <p className="mt-1 text-xs text-sand">
            Este logo é usado nesta seção futuramente. O logo exibido no site (header, PWA) continua sendo
            o arquivo em <code>public/logo.png</code> do código-fonte.
          </p>
        </div>

        {error && <p className="text-sm text-red-400">{error}</p>}
        {saved && <p className="text-sm text-green-400">Alterações salvas.</p>}

        <button
          type="submit"
          disabled={saving}
          className="w-fit rounded-md bg-gold-gradient px-6 py-2.5 text-sm font-semibold text-ink-950 hover:opacity-90 disabled:opacity-50"
        >
          {saving ? 'Salvando…' : 'Salvar alterações'}
        </button>
      </form>
    </div>
  )
}
