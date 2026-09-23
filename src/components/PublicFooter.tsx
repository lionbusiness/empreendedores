import { Link } from 'react-router-dom'

export function PublicFooter() {
  return (
    <footer className="border-t border-gold-700/20 bg-ink-900">
      <div className="container-page flex flex-col gap-4 py-10 text-sm text-sand sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-2">
          <img src="/logo.png" alt="Lion Business" className="h-6 w-6 object-contain" />
          <span className="font-display text-cream">Lion Business</span>
        </div>
        <p className="text-center">Conectando negócios, fortalecendo nossa comunidade.</p>
        <Link to="/quero-participar" className="text-gold-400 hover:text-gold-300">
          Cadastre seu negócio →
        </Link>
      </div>
    </footer>
  )
}
