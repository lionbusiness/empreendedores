import { useDocumentTitle } from '@/hooks/useDocumentTitle'

const pillars = [
  {
    title: 'Propósito',
    description: 'Entender por que Deus colocou cada pessoa naquele ambiente de negócios.',
  },
  {
    title: 'Princípios',
    description: 'Construir empresas sem abrir mão dos valores do Reino.',
  },
  {
    title: 'Prosperidade',
    description:
      'Entender prosperidade não apenas como acúmulo, mas como capacidade de gerar, administrar e multiplicar recursos.',
  },
  {
    title: 'Influência',
    description: 'Levar os princípios do Reino para dentro das empresas, equipes, relacionamentos e mercado.',
  },
  {
    title: 'Conexão',
    description: 'Empresários ajudando empresários, compartilhando experiências, oportunidades e conhecimento.',
  },
  {
    title: 'Impacto',
    description: 'Usar aquilo que Deus colocou nas mãos de cada empreendedor para transformar pessoas e ambientes.',
  },
]

export function About() {
  useDocumentTitle('Sobre')

  return (
    <div>
      {/* Cabeçalho / manifesto */}
      <section className="border-b border-gold-700/20">
        <div className="container-page max-w-3xl py-16 text-center sm:py-20">
          <span className="text-xs uppercase tracking-[0.2em] text-gold-500">Lion Business</span>
          <h1 className="mt-3 font-display text-3xl font-semibold leading-tight text-cream sm:text-4xl">
            Negócios com propósito que <span className="text-gold-gradient">manifestam o Reino</span>
          </h1>
          <p className="mx-auto mt-6 max-w-xl text-lg italic text-sand">
            E se o seu negócio fosse mais do que uma fonte de renda?
          </p>
          <p className="mx-auto mt-6 max-w-2xl leading-relaxed text-cream/90">
            Não queremos apenas formar empresários melhores. Queremos formar empresários que entendam que
            seus negócios podem ser instrumentos de manifestação do Reino de Deus.
          </p>
        </div>
      </section>

      {/* Pilares */}
      <section className="container-page py-16">
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {pillars.map((p) => (
            <div key={p.title} className="rounded-lg border border-ink-700 bg-ink-800 p-6">
              <span className="font-display text-lg font-bold uppercase tracking-[0.1em] text-gold-400">
                {p.title}
              </span>
              <div className="mt-3 h-px w-10 bg-gold-gradient" />
              <p className="mt-4 text-sm leading-relaxed text-sand">{p.description}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Frase de fechamento */}
      <section className="border-t border-gold-700/20 bg-ink-900">
        <div className="container-page max-w-2xl py-16 text-center">
          <p className="font-display text-xl italic leading-relaxed text-cream sm:text-2xl">
            "O nosso negócio não é apenas aquilo que fazemos. É também um lugar onde podemos manifestar quem
            somos e aquilo em que acreditamos."
          </p>
        </div>
      </section>

      {/* O que é a plataforma, na prática */}
      <section className="container-page max-w-2xl py-16">
        <h2 className="font-display text-2xl font-semibold text-cream">Sobre a plataforma</h2>
        <p className="mt-4 leading-relaxed text-sand">
          O Lion Business é o diretório de empreendedores da nossa igreja: um espaço para que membros
          encontrem negócios, profissionais e serviços oferecidos por outros empreendedores da comunidade,
          e para que cada empreendedor tenha seu trabalho divulgado de forma organizada e profissional.
        </p>
        <p className="mt-4 leading-relaxed text-sand">
          Cada perfil publicado passa por uma análise da administração antes de entrar no ar, garantindo
          qualidade e confiança em quem está sendo indicado dentro da nossa comunidade.
        </p>
      </section>
    </div>
  )
}
