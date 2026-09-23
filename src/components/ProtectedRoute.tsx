import type { ReactNode } from 'react'
import { Navigate } from 'react-router-dom'
import { useAuth } from '@/contexts/AuthContext'

export function ProtectedRoute({ children }: { children: ReactNode }) {
  const { session, profile, loading } = useAuth()

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-ink-950 text-sand">
        Carregando…
      </div>
    )
  }

  if (!session || !profile) {
    return <Navigate to="/admin/login" replace />
  }

  return <>{children}</>
}
