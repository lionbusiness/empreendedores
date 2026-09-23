// ============================================================
// Gera, dentro de dist/, uma página estática por empreendedor
// ativo (dist/empreendedores/<slug>/index.html) só com as meta
// tags certas (Open Graph) pra prévias de WhatsApp/redes sociais
// funcionarem — já que o site em si é uma SPA (não dá pra ter
// meta tags dinâmicas por rota sem isso, pois o GitHub Pages é
// 100% estático e o WhatsApp não executa JavaScript).
//
// Cada página gerada tem um redirect automático (via JS) pro
// app de verdade (rota com #), então humanos que clicarem no
// link caem no site interativo normalmente.
//
// Roda automaticamente no GitHub Actions, depois do "npm run build"
// e antes de publicar (veja .github/workflows/deploy.yml).
// ============================================================

import { createClient } from '@supabase/supabase-js'
import { mkdir, writeFile } from 'node:fs/promises'
import path from 'node:path'

const SITE_ORIGIN = 'https://lionbusiness.github.io/empreendedores'
const DIST_DIR = path.resolve(process.cwd(), 'dist')

const supabaseUrl = process.env.VITE_SUPABASE_URL
const supabaseAnonKey = process.env.VITE_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseAnonKey) {
  console.warn('[prerender-og] VITE_SUPABASE_URL/VITE_SUPABASE_ANON_KEY não definidos — pulando geração de páginas OG.')
  process.exit(0)
}

function escapeHtml(str) {
  return String(str ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
}

function truncate(str, max) {
  if (!str) return ''
  return str.length > max ? str.slice(0, max - 1).trimEnd() + '…' : str
}

function pageHtml({ title, description, image, canonicalUrl, redirectTo }) {
  return `<!DOCTYPE html>
<html lang="pt-BR">
  <head>
    <meta charset="UTF-8" />
    <title>${escapeHtml(title)} · Lion Business</title>
    <meta name="description" content="${escapeHtml(description)}" />
    <link rel="canonical" href="${canonicalUrl}" />
    <meta property="og:type" content="profile" />
    <meta property="og:title" content="${escapeHtml(title)} · Lion Business" />
    <meta property="og:description" content="${escapeHtml(description)}" />
    <meta property="og:image" content="${image}" />
    <meta property="og:url" content="${canonicalUrl}" />
    <meta name="twitter:card" content="summary_large_image" />
    <meta http-equiv="refresh" content="0; url=${redirectTo}" />
    <script>window.location.replace(${JSON.stringify(redirectTo)});</script>
  </head>
  <body>
    <p>Redirecionando para <a href="${redirectTo}">${escapeHtml(title)}</a>…</p>
  </body>
</html>
`
}

async function main() {
  const supabase = createClient(supabaseUrl, supabaseAnonKey)
  const { data: entrepreneurs, error } = await supabase
    .from('entrepreneurs')
    .select('slug, business_name, description, image_url')
    .eq('status', 'active')

  if (error) {
    console.error('[prerender-og] Erro ao buscar empreendedores:', error.message)
    process.exit(0) // não quebra o deploy por causa disso
  }

  if (!entrepreneurs || entrepreneurs.length === 0) {
    console.log('[prerender-og] Nenhum empreendedor ativo encontrado, nada a gerar.')
    return
  }

  for (const e of entrepreneurs) {
    const dir = path.join(DIST_DIR, 'empreendedores', e.slug)
    await mkdir(dir, { recursive: true })
    const html = pageHtml({
      title: e.business_name,
      description: truncate(e.description || 'Confira este empreendedor no Lion Business.', 160),
      image: e.image_url || `${SITE_ORIGIN}/logo.png`,
      canonicalUrl: `${SITE_ORIGIN}/empreendedores/${e.slug}/`,
      redirectTo: `/empreendedores/#/empreendedores/${e.slug}`,
    })
    await writeFile(path.join(dir, 'index.html'), html, 'utf-8')
  }

  console.log(`[prerender-og] ${entrepreneurs.length} página(s) gerada(s) em dist/empreendedores/<slug>/`)
}

main()
