import { Link } from 'react-router-dom'
import type { Entrepreneur } from '@/types/database'
import { serviceTypeLabel } from '@/lib/helpers'

export function EntrepreneurCard({ entrepreneur }: { entrepreneur: Entrepreneur }) {
  return (
    <Link
      to={`/empreendedores/${entrepreneur.slug}`}
      className="group flex flex-col overflow-hidden rounded-lg border border-ink-700 bg-ink-800 transition-all hover:border-gold-600/50 hover:shadow-gold"
    >
      <div className="aspect-[4/3] w-full overflow-hidden bg-ink-900">
        {entrepreneur.image_url ? (
          <img
            src={entrepreneur.image_url}
            alt={entrepreneur.business_name}
            className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
            loading="lazy"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center font-display text-4xl text-gold-700">
            {entrepreneur.business_name.charAt(0)}
          </div>
        )}
      </div>
      <div className="flex flex-1 flex-col gap-2 p-5">
        <div className="flex items-start justify-between gap-2">
          <h3 className="font-display text-xl font-semibold text-cream">{entrepreneur.business_name}</h3>
          {entrepreneur.featured && (
            <span className="shrink-0 rounded-full bg-gold-500/15 px-2 py-0.5 text-xs text-gold-300">Destaque</span>
          )}
        </div>
        {entrepreneur.category && (
          <span className="text-xs uppercase tracking-wide text-gold-500">{entrepreneur.category.name}</span>
        )}
        {entrepreneur.description && (
          <p className="line-clamp-2 text-sm text-sand">{entrepreneur.description}</p>
        )}
        <div className="mt-auto flex items-center justify-between pt-3 text-xs text-sand">
          <span>{entrepreneur.city ?? 'Localização não informada'}</span>
          <span>{serviceTypeLabel[entrepreneur.service_type]}</span>
        </div>
      </div>
    </Link>
  )
}
