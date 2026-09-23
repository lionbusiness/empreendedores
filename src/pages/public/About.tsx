import { useDocumentTitle } from '@/hooks/useDocumentTitle'

export function About() {
  useDocumentTitle('Sobre')
  return (
    <div className="container-page max-w-2xl py-16">
      <h1 className="font-display text-3xl font-semibold text-cream sm:text-4xl">Sobre o Lion Business</h1>
      <p className="mt-6 leading-relaxed text-sand">
        O Lion Business é o diretório de empreendedores da nossa igreja: um espaço para que membros
        encontrem negócios, profissionais e serviços oferecidos por outros empreendedores da comunidade,
        e para que cada empreendedor tenha seu trabalho divulgado de forma organizada e profissional.
      </p>
      <p className="mt-4 leading-relaxed text-sand">
        Cada perfil publicado passa por uma análise da administração antes de entrar no ar, garantindo
        qualidade e confiança em quem está sendo indicado dentro da nossa comunidade.
      </p>
    </div>
  )
}
