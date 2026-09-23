import { useEffect, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { supabase } from '@/lib/supabase'
import type { Entrepreneur } from '@/types/database'
import { serviceAreaLabel, serviceTypeLabel, whatsappLink, instagramLink, mapsLink } from '@/lib/helpers'
import { useDocumentTitle } from '@/hooks/useDocumentTitle'

export function EntrepreneurProfile() {
  const { slug } = useParams()
  const [entrepreneur, setEntrepreneur] = useState<Entrepreneur | null>(null)
  const [notFound, setNotFound] = useState(false)
  useDocumentTitle(entrepreneur?.business_name ?? 'Empreendedor')

  useEffect(() => {
    if (!slug) return
    supabase
      .from('entrepreneurs')
      .select('*, category:categories(*)')
      .eq('slug', slug)
      .eq('status', 'active')
      .single()
      .then(({ data, error }) => {
        if (error || !data) setNotFound(true)
        else setEntrepreneur(data as Entrepreneur)
      })
  }, [slug])

  if (notFound) {
    return (
      <div className="container-page py-24 text-center">
        <p className="text-sand">Empreendedor não encontrado ou não está mais ativo.</p>
        <Link to="/empreendedores" className="mt-4 inline-block text-gold-400 hover:text-gold-300">
          ← Voltar ao diretório
        </Link>
      </div>
    )
  }

  if (!entrepreneur) {
    return <div className="container-page py-24 text-center text-sand">Carregando…</div>
  }

  const e = entrepreneur

  return (
    <div className="container-page py-12">
      <Link to="/empreendedores" className="text-sm text-gold-400 hover:text-gold-300">
        ← Voltar ao diretório
      </Link>

      <div className="mt-6 grid gap-10 lg:grid-cols-[320px_1fr]">
        <div>
          <div className="aspect-square w-full overflow-hidden rounded-lg border border-ink-700 bg-ink-800">
            {e.image_url ? (
              <img src={e.image_url} alt={e.business_name} className="h-full w-full object-cover" />
            ) : (
              <div className="flex h-full w-full items-center justify-center font-display text-6xl text-gold-700">
                {e.business_name.charAt(0)}
              </div>
            )}
          </div>

          <div className="mt-6 flex flex-col gap-3">
            {e.whatsapp && (
              <a
                href={whatsappLink(e.whatsapp, `Olá! Vi seu perfil no Lion Business e gostaria de saber mais sobre ${e.business_name}.`)}
                target="_blank"
                rel="noreferrer"
                className="rounded-md bg-gold-gradient px-4 py-3 text-center text-sm font-semibold text-ink-950 hover:opacity-90"
              >
                Falar no WhatsApp
              </a>
            )}
            {e.instagram && (
              <a
                href={instagramLink(e.instagram)}
                target="_blank"
                rel="noreferrer"
                className="rounded-md border border-ink-700 px-4 py-3 text-center text-sm text-cream hover:border-gold-600/50"
              >
                Ver Instagram
              </a>
            )}
            {e.website && (
              <a
                href={e.website.startsWith('http') ? e.website : `https://${e.website}`}
                target="_blank"
                rel="noreferrer"
                className="rounded-md border border-ink-700 px-4 py-3 text-center text-sm text-cream hover:border-gold-600/50"
              >
                Visitar site
              </a>
            )}
            {e.address && (
              <a
                href={mapsLink(e)}
                target="_blank"
                rel="noreferrer"
                className="rounded-md border border-ink-700 px-4 py-3 text-center text-sm text-cream hover:border-gold-600/50"
              >
                Como chegar
              </a>
            )}
            {e.phone && (
              <a
                href={`tel:${e.phone.replace(/\D/g, '')}`}
                className="rounded-md border border-ink-700 px-4 py-3 text-center text-sm text-cream hover:border-gold-600/50"
              >
                Ligar: {e.phone}
              </a>
            )}
          </div>
        </div>

        <div>
          {e.category && (
            <span className="text-xs uppercase tracking-wide text-gold-500">{e.category.name}</span>
          )}
          <h1 className="mt-1 font-display text-3xl font-semibold text-cream sm:text-4xl">{e.business_name}</h1>
          <p className="mt-1 text-sand">por {e.owner_name}</p>

          {e.description && <p className="mt-6 max-w-2xl leading-relaxed text-cream/90">{e.description}</p>}

          <dl className="mt-8 grid gap-4 border-t border-ink-800 pt-6 sm:grid-cols-2">
            <div>
              <dt className="text-xs uppercase tracking-wide text-sand">Localização</dt>
              <dd className="mt-1 text-cream">
                {[e.neighborhood, e.city, e.state].filter(Boolean).join(', ') || 'Não informado'}
              </dd>
            </div>
            <div>
              <dt className="text-xs uppercase tracking-wide text-sand">Atendimento</dt>
              <dd className="mt-1 text-cream">{serviceTypeLabel[e.service_type]}</dd>
            </div>
            <div>
              <dt className="text-xs uppercase tracking-wide text-sand">Área de atendimento</dt>
              <dd className="mt-1 text-cream">{serviceAreaLabel[e.service_area]}</dd>
            </div>
            {e.business_hours && (
              <div>
                <dt className="text-xs uppercase tracking-wide text-sand">Horário</dt>
                <dd className="mt-1 text-cream">{e.business_hours}</dd>
              </div>
            )}
          </dl>
        </div>
      </div>
    </div>
  )
}
