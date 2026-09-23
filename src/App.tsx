import { HashRouter, Routes, Route } from 'react-router-dom'
import { AuthProvider } from '@/contexts/AuthContext'
import { ProtectedRoute } from '@/components/ProtectedRoute'
import { PublicLayout } from '@/layouts/PublicLayout'
import { AdminLayout } from '@/layouts/AdminLayout'

import { Home } from '@/pages/public/Home'
import { Directory } from '@/pages/public/Directory'
import { EntrepreneurProfile } from '@/pages/public/EntrepreneurProfile'
import { JoinForm } from '@/pages/public/JoinForm'
import { About } from '@/pages/public/About'

import { Login } from '@/pages/admin/Login'
import { Dashboard } from '@/pages/admin/Dashboard'
import { Applications } from '@/pages/admin/Applications'
import { ApplicationDetail } from '@/pages/admin/ApplicationDetail'
import { Entrepreneurs } from '@/pages/admin/Entrepreneurs'
import { EntrepreneurForm } from '@/pages/admin/EntrepreneurForm'
import { Categories } from '@/pages/admin/Categories'
import { Organization } from '@/pages/admin/Organization'

export default function App() {
  return (
    <HashRouter>
      <AuthProvider>
        <Routes>
          {/* Área pública */}
          <Route element={<PublicLayout />}>
            <Route path="/" element={<Home />} />
            <Route path="/empreendedores" element={<Directory />} />
            <Route path="/empreendedores/:slug" element={<EntrepreneurProfile />} />
            <Route path="/quero-participar" element={<JoinForm />} />
            <Route path="/sobre" element={<About />} />
          </Route>

          {/* Login admin (fora do layout protegido) */}
          <Route path="/admin/login" element={<Login />} />

          {/* Área administrativa protegida */}
          <Route
            path="/admin"
            element={
              <ProtectedRoute>
                <AdminLayout />
              </ProtectedRoute>
            }
          >
            <Route index element={<Dashboard />} />
            <Route path="solicitacoes" element={<Applications />} />
            <Route path="solicitacoes/:id" element={<ApplicationDetail />} />
            <Route path="empreendedores" element={<Entrepreneurs />} />
            <Route path="empreendedores/novo" element={<EntrepreneurForm />} />
            <Route path="empreendedores/:id" element={<EntrepreneurForm />} />
            <Route path="categorias" element={<Categories />} />
            <Route path="organizacao" element={<Organization />} />
          </Route>
        </Routes>
      </AuthProvider>
    </HashRouter>
  )
}
