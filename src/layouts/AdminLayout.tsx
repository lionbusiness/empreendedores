import { useState } from 'react'
import { NavLink, Outlet } from 'react-router-dom'
import { useAuth } from '@/contexts/AuthContext'
import { logoSrc } from '@/lib/helpers'

const links = [
  { to: '/admin', label: 'Dashboard', end: true },
  { to: '/admin/solicitacoes', label: 'Solicitações' },
  { to: '/admin/empreendedores', label: 'Empreendedores' },
  { to: '/admin/categorias', label: 'Categorias' },
  { to: '/admin/organizacao', label: 'Organização' },
]

export function AdminLayout() {
  const { profile, signOut } = useAuth()
  const [open, setOpen] = useState(false)

  const navClass = ({ isActive }: { isActive: boolean }) =>
    `rounded-md px-3 py-2 text-sm transition-colors ${
      isActive ? 'bg-gold-500/10 text-gold-300' : 'text-sand hover:bg-ink-800 hover:text-cream'
    }`

  return (
    <div className="min-h-screen bg-ink-950 md:flex">
      {/* Sidebar desktop */}
      <aside className="hidden w-60 shrink-0 border-r border-ink-800 bg-ink-900 p-4 md:flex md:flex-col">
        <div className="mb-6 flex items-center gap-2 px-2">
          <img src={logoSrc} alt="Lion Business" className="h-8 w-8 object-contain" />
          <span className="font-display text-lg font-bold uppercase tracking-[0.12em] text-cream">Lion Business</span>
        </div>
        <nav className="flex flex-1 flex-col gap-1">
          {links.map((l) => (
            <NavLink key={l.to} to={l.to} end={l.end} className={navClass}>{l.label}</NavLink>
          ))}
        </nav>
        <div className="border-t border-ink-800 pt-4 text-sm text-sand">
          <p className="truncate">{profile?.name}</p>
          <button onClick={signOut} className="mt-2 text-gold-400 hover:text-gold-300">Sair</button>
        </div>
      </aside>

      {/* Header mobile */}
      <div className="flex items-center justify-between border-b border-ink-800 bg-ink-900 p-4 md:hidden">
        <div className="flex items-center gap-2">
          <img src={logoSrc} alt="Lion Business" className="h-7 w-7 object-contain" />
          <span className="font-display text-base font-bold uppercase tracking-[0.12em] text-cream">Lion Business</span>
        </div>
        <button onClick={() => setOpen((v) => !v)} className="text-sand" aria-label="Menu">☰</button>
      </div>
      {open && (
        <nav className="flex flex-col gap-1 border-b border-ink-800 bg-ink-900 p-4 md:hidden">
          {links.map((l) => (
            <NavLink key={l.to} to={l.to} end={l.end} className={navClass} onClick={() => setOpen(false)}>
              {l.label}
            </NavLink>
          ))}
          <button onClick={signOut} className="mt-2 text-left text-gold-400">Sair</button>
        </nav>
      )}

      <main className="flex-1 p-5 sm:p-8">
        <Outlet />
      </main>
    </div>
  )
}
