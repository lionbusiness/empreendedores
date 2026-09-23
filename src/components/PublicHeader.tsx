import { useState } from 'react'
import { Link, NavLink } from 'react-router-dom'

const links = [
  { to: '/', label: 'Início' },
  { to: '/empreendedores', label: 'Empreendedores' },
  { to: '/quero-participar', label: 'Quero participar' },
  { to: '/sobre', label: 'Sobre' },
]

export function PublicHeader() {
  const [open, setOpen] = useState(false)

  return (
    <header className="sticky top-0 z-40 border-b border-gold-700/20 bg-ink-950/90 backdrop-blur">
      <div className="container-page flex h-16 items-center justify-between">
        <Link to="/" className="flex items-center gap-2" onClick={() => setOpen(false)}>
          <img src="/logo.png" alt="Lion Business" className="h-9 w-9 object-contain" />
          <span className="font-display text-lg font-semibold tracking-wide text-cream">
            Lion <span className="text-gold-gradient">Business</span>
          </span>
        </Link>

        <nav className="hidden items-center gap-8 md:flex">
          {links.map((l) => (
            <NavLink
              key={l.to}
              to={l.to}
              end={l.to === '/'}
              className={({ isActive }) =>
                `text-sm transition-colors ${
                  isActive ? 'text-gold-400' : 'text-sand hover:text-cream'
                }`
              }
            >
              {l.label}
            </NavLink>
          ))}
        </nav>

        <button
          className="flex h-9 w-9 flex-col items-center justify-center gap-1.5 md:hidden"
          aria-label="Abrir menu"
          aria-expanded={open}
          onClick={() => setOpen((v) => !v)}
        >
          <span className={`h-px w-6 bg-gold-400 transition-transform ${open ? 'translate-y-2 rotate-45' : ''}`} />
          <span className={`h-px w-6 bg-gold-400 transition-opacity ${open ? 'opacity-0' : ''}`} />
          <span className={`h-px w-6 bg-gold-400 transition-transform ${open ? '-translate-y-2 -rotate-45' : ''}`} />
        </button>
      </div>

      {open && (
        <nav className="border-t border-gold-700/20 bg-ink-950 md:hidden">
          <div className="container-page flex flex-col py-3">
            {links.map((l) => (
              <NavLink
                key={l.to}
                to={l.to}
                end={l.to === '/'}
                onClick={() => setOpen(false)}
                className={({ isActive }) =>
                  `border-b border-ink-800 py-3 text-sm ${isActive ? 'text-gold-400' : 'text-sand'}`
                }
              >
                {l.label}
              </NavLink>
            ))}
          </div>
        </nav>
      )}
    </header>
  )
}
