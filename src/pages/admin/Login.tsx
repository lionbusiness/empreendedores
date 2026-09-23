import { useState, type FormEvent } from 'react'
import { Navigate, useNavigate } from 'react-router-dom'
import { useAuth } from '@/contexts/AuthContext'

export function Login() {
  const { signIn, session } = useAuth()
  const navigate = useNavigate()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  if (session) return <Navigate to="/admin" replace />

  async function handleSubmit(e: FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError(null)
    const { error } = await signIn(email, password)
    setLoading(false)
    if (error) setError('E-mail ou senha inválidos.')
    else navigate('/admin')
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-ink-950 px-4">
      <form onSubmit={handleSubmit} className="w-full max-w-sm rounded-lg border border-ink-700 bg-ink-800 p-8">
        <div className="mb-6 flex flex-col items-center gap-3">
          <img src="/logo.png" alt="Lion Business" className="h-14 w-14 object-contain" />
          <h1 className="font-display text-xl text-cream">Painel administrativo</h1>
        </div>
        <div className="flex flex-col gap-4">
          <div>
            <label className="mb-1.5 block text-sm text-sand" htmlFor="email">E-mail</label>
            <input
              required
              type="email"
              id="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full rounded-md border border-ink-700 bg-ink-900 px-3 py-2 text-sm text-cream focus:border-gold-500"
            />
          </div>
          <div>
            <label className="mb-1.5 block text-sm text-sand" htmlFor="password">Senha</label>
            <input
              required
              type="password"
              id="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full rounded-md border border-ink-700 bg-ink-900 px-3 py-2 text-sm text-cream focus:border-gold-500"
            />
          </div>
          {error && <p className="text-sm text-red-400">{error}</p>}
          <button
            type="submit"
            disabled={loading}
            className="mt-2 rounded-md bg-gold-gradient px-4 py-2.5 text-sm font-semibold text-ink-950 hover:opacity-90 disabled:opacity-50"
          >
            {loading ? 'Entrando…' : 'Entrar'}
          </button>
        </div>
      </form>
    </div>
  )
}
