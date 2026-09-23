import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { supabase } from '@/lib/supabase'
import type { Entrepreneur } from '@/types/database'
import { EntrepreneurCard } from '@/components/EntrepreneurCard'
import { useDocumentTitle } from '@/hooks/useDocumentTitle'

export function Home() {
  useDocumentTitle('Início')
  const [featured, setFeatured] = useState<Entrepreneur[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    supabase
      .from('entrepreneurs')
      .select('*, category:categories(*)')
      .eq('status', 'active')
      .eq('featured', true)
      .order('updated_at', { ascending: false })
      .limit(6)
      .then(({ data }) => {
        setFeatured((data as Entrepreneur[]) ?? [])
        setLoading(false)
      })
  }, [])

  return (
    <div>
      {/* Hero */}
      <section className="relative overflow-hidden border-b border-gold-700/20">
        <div className="container-page flex flex-col items-center gap-6 py-24 text-center">
          <img src="/logo.png" alt="Lion Business" className="h-24 w-24 object-contain sm:h-28 sm:w-28" />
          <h1 className="max-w-2xl font-display text-4xl font-semibold leading-tight text-cream sm:text-5xl">
            O diretório de empreendedores da <span className="text-gold-gradient">Lion Betel Church</span>
          </h1>
          <p className="max-w-xl text-balance text-sand">
            Conectando negócios, fortalecendo nossa comunidade. Encontre profissionais e serviços de irmãos
            da igreja, ou cadastre o seu.
          </p>
          <div className="flex flex-col gap-3 pt-2 sm:flex-row">
            <Link
              to="/empreendedores"
              className="rounded-md bg-gold-gradient px-6 py-3 text-sm font-semibold text-ink-950 transition-opacity hover:opacity-90"
            >
              Encontrar um empreendedor
            </Link>
            <Link
              to="/quero-participar"
              className="rounded-md border border-gold-600/50 px-6 py-3 text-sm font-semibold text-gold-300 transition-colors hover:bg-ink-800"
            >
              Cadastrar meu negócio
            </Link>
          </div>
        </div>
      </section>

      {/* Destaques */}
      {!loading && featured.length > 0 && (
        <section className="container-page py-16">
          <div className="mb-8 flex items-end justify-between">
            <h2 className="font-display text-2xl font-semibold text-cream sm:text-3xl">
              Empreendedores em <span className="text-gold-gradient">destaque</span>
            </h2>
            <Link to="/empreendedores" className="text-sm text-gold-400 hover:text-gold-300">
              Ver todos →
            </Link>
          </div>
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {featured.map((e) => (
              <EntrepreneurCard key={e.id} entrepreneur={e} />
            ))}
          </div>
        </section>
      )}
    </div>
  )
}
