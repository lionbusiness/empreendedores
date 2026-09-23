import type { Entrepreneur } from '@/types/database'

// Caminho do logo já considerando o "base" configurado no vite.config.ts
// (necessário porque o site pode ser publicado numa subpasta, ex: /empreendedores/)
export const logoSrc = `${import.meta.env.BASE_URL}logo.png`

export const serviceTypeLabel: Record<string, string> = {
  online: 'Online',
  presencial: 'Presencial',
  online_presencial: 'Online e presencial',
}

export const serviceAreaLabel: Record<string, string> = {
  local: 'Local',
  regional: 'Regional',
  nacional: 'Nacional',
  internacional: 'Internacional',
}

export function whatsappLink(number: string, message?: string) {
  const digits = number.replace(/\D/g, '')
  const text = message ? `?text=${encodeURIComponent(message)}` : ''
  return `https://wa.me/${digits}${text}`
}

export function instagramLink(handle: string) {
  const clean = handle.replace('@', '').replace(/^https?:\/\/(www\.)?instagram\.com\//, '').replace(/\/$/, '')
  return `https://instagram.com/${clean}`
}

export function mapsLink(entrepreneur: Pick<Entrepreneur, 'address' | 'city' | 'state'>) {
  const query = [entrepreneur.address, entrepreneur.city, entrepreneur.state].filter(Boolean).join(', ')
  return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(query)}`
}

// URL "de compartilhamento": aponta pra página estática pré-gerada (com
// as meta tags certas pro WhatsApp/redes sociais), que redireciona pro
// app de verdade. Diferente do link interno usado pela navegação em si
// (que usa a rota com # do HashRouter).
const SITE_ORIGIN = 'https://lionbusiness.github.io/empreendedores'
export function shareUrl(entrepreneur: Pick<Entrepreneur, 'slug'>) {
  return `${SITE_ORIGIN}/empreendedores/${entrepreneur.slug}/`
}

export function slugify(value: string) {
  return value
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '')
}
