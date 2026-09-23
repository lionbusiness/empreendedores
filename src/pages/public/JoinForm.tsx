import { useEffect, useState, type FormEvent } from 'react'
import { supabase } from '@/lib/supabase'
import type { Category } from '@/types/database'
import { useDocumentTitle } from '@/hooks/useDocumentTitle'
import { ImageCropModal } from '@/components/ImageCropModal'

const inputClass =
  'w-full rounded-md border border-ink-700 bg-ink-900 px-3 py-2 text-sm text-cream placeholder:text-sand/60 focus:border-gold-500'
const labelClass = 'mb-1.5 block text-sm text-sand'

export function JoinForm() {
  useDocumentTitle('Quero participar')
  const [categories, setCategories] = useState<Category[]>([])
  const [description, setDescription] = useState('')
  const [imageFile, setImageFile] = useState<File | null>(null)
  const [imagePreview, setImagePreview] = useState<string | null>(null)
  const [imageToCrop, setImageToCrop] = useState<{ src: string; name: string } | null>(null)
  const [submitting, setSubmitting] = useState(false)
  const [done, setDone] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [captchaAnswer, setCaptchaAnswer] = useState('')
  const [captchaNums] = useState(() => ({
    a: Math.floor(Math.random() * 8) + 1,
    b: Math.floor(Math.random() * 8) + 1,
  }))

  useEffect(() => {
    supabase.from('categories').select('*').eq('active', true).order('name').then(({ data }) => {
      setCategories((data as Category[]) ?? [])
    })
  }, [])

  function handleImage(file: File | null) {
    if (!file) return
    setImageToCrop({ src: URL.createObjectURL(file), name: file.name })
  }

  function handleCropConfirm(cropped: File) {
    setImageFile(cropped)
    setImagePreview(URL.createObjectURL(cropped))
    if (imageToCrop) URL.revokeObjectURL(imageToCrop.src)
    setImageToCrop(null)
  }

  function handleCropCancel() {
    if (imageToCrop) URL.revokeObjectURL(imageToCrop.src)
    setImageToCrop(null)
  }

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setError(null)

    const form = new FormData(e.currentTarget)

    // Campo-armadilha: invisível pra humanos, bots que preenchem tudo caem aqui
    if (String(form.get('website_url') || '').trim() !== '') {
      // finge sucesso pro bot, sem enviar nada de verdade
      setDone(true)
      return
    }

    if (parseInt(captchaAnswer, 10) !== captchaNums.a + captchaNums.b) {
      setError('Resposta da verificação incorreta. Tente novamente.')
      return
    }

    const consent = form.get('consent') === 'on'
    if (!consent) {
      setError('É necessário autorizar o uso das informações para prosseguir.')
      return
    }

    setSubmitting(true)
    try {
      // Precisamos do organization_id: em produção, injete-o via variável de
      // ambiente ou busque a organização pelo slug único do tenant.
      const { data: org } = await supabase.from('organizations').select('id').eq('active', true).limit(1).single()
      if (!org) throw new Error('Organização não encontrada.')

      let image_url: string | null = null
      if (imageFile) {
        const path = `${org.id}/applications/${crypto.randomUUID()}-${imageFile.name}`
        const { error: uploadError } = await supabase.storage.from('lion-business').upload(path, imageFile)
        if (uploadError) throw uploadError
        image_url = supabase.storage.from('lion-business').getPublicUrl(path).data.publicUrl
      }

      const { error: insertError } = await supabase.from('applications').insert({
        organization_id: org.id,
        owner_name: String(form.get('owner_name')),
        email: String(form.get('email')),
        phone: String(form.get('phone') || ''),
        whatsapp: String(form.get('whatsapp')),
        business_name: String(form.get('business_name')),
        category_id: String(form.get('category_id') || '') || null,
        description,
        instagram: String(form.get('instagram') || ''),
        website: String(form.get('website') || ''),
        city: String(form.get('city')),
        state: String(form.get('state')),
        neighborhood: String(form.get('neighborhood') || ''),
        address: String(form.get('address') || ''),
        service_type: String(form.get('service_type')),
        service_area: String(form.get('service_area')),
        image_url,
        consent,
      })
      if (insertError) throw insertError

      setDone(true)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Não foi possível enviar sua solicitação. Tente novamente.')
    } finally {
      setSubmitting(false)
    }
  }

  if (done) {
    return (
      <div className="container-page flex flex-col items-center gap-3 py-24 text-center">
        <h1 className="font-display text-3xl text-cream">Solicitação enviada!</h1>
        <p className="max-w-md text-sand">
          Obrigado pelo interesse. Nossa equipe vai analisar suas informações e você será avisado quando o seu
          perfil for publicado.
        </p>
      </div>
    )
  }

  return (
    <div className="container-page max-w-3xl py-12">
      <h1 className="font-display text-3xl font-semibold text-cream sm:text-4xl">Quero participar</h1>
      <p className="mt-3 text-sand">
        Preencha o formulário abaixo para solicitar o cadastro do seu negócio no Lion Business. Sua solicitação
        será analisada pela administração antes de ser publicada.
      </p>

      <form onSubmit={handleSubmit} className="mt-10 flex flex-col gap-8">
        <fieldset className="flex flex-col gap-4">
          <legend className="mb-2 font-display text-xl text-gold-300">Dados pessoais</legend>
          <div>
            <label className={labelClass} htmlFor="owner_name">Nome completo *</label>
            <input required id="owner_name" name="owner_name" className={inputClass} />
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label className={labelClass} htmlFor="whatsapp">WhatsApp *</label>
              <input required id="whatsapp" name="whatsapp" placeholder="(24) 99999-9999" className={inputClass} />
            </div>
            <div>
              <label className={labelClass} htmlFor="email">E-mail *</label>
              <input required type="email" id="email" name="email" className={inputClass} />
            </div>
          </div>
        </fieldset>

        <fieldset className="flex flex-col gap-4">
          <legend className="mb-2 font-display text-xl text-gold-300">Dados do empreendimento</legend>
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label className={labelClass} htmlFor="business_name">Nome do empreendimento *</label>
              <input required id="business_name" name="business_name" className={inputClass} />
            </div>
            <div>
              <label className={labelClass} htmlFor="category_id">Categoria/segmento</label>
              <select id="category_id" name="category_id" className={inputClass}>
                <option value="">Selecione</option>
                {categories.map((c) => (
                  <option key={c.id} value={c.id}>{c.name}</option>
                ))}
              </select>
            </div>
          </div>
          <div>
            <label className={labelClass} htmlFor="description">
              Descrição do negócio * <span className="text-xs text-sand">({description.length}/500)</span>
            </label>
            <textarea
              required
              id="description"
              maxLength={500}
              rows={4}
              className={inputClass}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
            />
          </div>
          <div className="grid gap-4 sm:grid-cols-3">
            <div>
              <label className={labelClass} htmlFor="instagram">Instagram</label>
              <input id="instagram" name="instagram" placeholder="@seuinsta" className={inputClass} />
            </div>
            <div>
              <label className={labelClass} htmlFor="website">Site</label>
              <input id="website" name="website" className={inputClass} />
            </div>
            <div>
              <label className={labelClass} htmlFor="phone">Telefone</label>
              <input id="phone" name="phone" className={inputClass} />
            </div>
          </div>
        </fieldset>

        <fieldset className="flex flex-col gap-4">
          <legend className="mb-2 font-display text-xl text-gold-300">Localização</legend>
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label className={labelClass} htmlFor="city">Cidade *</label>
              <input required id="city" name="city" className={inputClass} />
            </div>
            <div>
              <label className={labelClass} htmlFor="state">Estado *</label>
              <input required id="state" name="state" className={inputClass} />
            </div>
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label className={labelClass} htmlFor="neighborhood">Bairro</label>
              <input id="neighborhood" name="neighborhood" className={inputClass} />
            </div>
            <div>
              <label className={labelClass} htmlFor="address">Endereço</label>
              <input id="address" name="address" className={inputClass} />
            </div>
          </div>
        </fieldset>

        <fieldset className="flex flex-col gap-4">
          <legend className="mb-2 font-display text-xl text-gold-300">Atendimento</legend>
          <div>
            <label className={labelClass} htmlFor="service_type">Como você atende seus clientes? *</label>
            <select required id="service_type" name="service_type" className={inputClass} defaultValue="">
              <option value="" disabled>Selecione</option>
              <option value="online">Online</option>
              <option value="presencial">Presencial</option>
              <option value="online_presencial">Online e presencial</option>
            </select>
          </div>
          <div>
            <label className={labelClass} htmlFor="service_area">Qual é a sua área de atendimento? *</label>
            <select required id="service_area" name="service_area" className={inputClass} defaultValue="">
              <option value="" disabled>Selecione</option>
              <option value="local">Local</option>
              <option value="regional">Regional</option>
              <option value="nacional">Nacional</option>
              <option value="internacional">Internacional</option>
            </select>
          </div>
        </fieldset>

        <fieldset className="flex flex-col gap-3">
          <legend className="mb-2 font-display text-xl text-gold-300">Identidade</legend>
          <label className={labelClass} htmlFor="image">Foto do empreendedor ou logo do empreendimento</label>
          <input
            id="image"
            type="file"
            accept="image/png,image/jpeg,image/webp"
            onChange={(e) => handleImage(e.target.files?.[0] ?? null)}
            className="text-sm text-sand file:mr-4 file:rounded-md file:border-0 file:bg-gold-gradient file:px-4 file:py-2 file:text-sm file:font-semibold file:text-ink-950"
          />
          {imagePreview && (
            <img src={imagePreview} alt="Pré-visualização" className="mt-2 h-32 w-32 rounded-md object-cover" />
          )}
        </fieldset>

        {/* Campo-armadilha anti-bot: fica invisível e fora da navegação por teclado pra humanos */}
        <input
          type="text"
          name="website_url"
          tabIndex={-1}
          autoComplete="off"
          className="absolute left-[-9999px] h-0 w-0 opacity-0"
          aria-hidden="true"
        />

        <div>
          <label className={labelClass} htmlFor="captcha">
            Verificação: quanto é {captchaNums.a} + {captchaNums.b}? *
          </label>
          <input
            required
            id="captcha"
            inputMode="numeric"
            className={`${inputClass} max-w-[120px]`}
            value={captchaAnswer}
            onChange={(e) => setCaptchaAnswer(e.target.value)}
          />
        </div>

        <label className="flex items-start gap-3 text-sm text-sand">
          <input type="checkbox" name="consent" className="mt-1 h-4 w-4 accent-gold-500" />
          Autorizo a utilização das informações fornecidas para divulgação do meu empreendimento na plataforma
          Lion Business.
        </label>

        {error && <p className="text-sm text-red-400">{error}</p>}

        <button
          type="submit"
          disabled={submitting}
          className="rounded-md bg-gold-gradient px-6 py-3 text-sm font-semibold text-ink-950 hover:opacity-90 disabled:opacity-50"
        >
          {submitting ? 'Enviando…' : 'Enviar solicitação'}
        </button>
      </form>

      {imageToCrop && (
        <ImageCropModal
          imageSrc={imageToCrop.src}
          fileName={imageToCrop.name}
          onCancel={handleCropCancel}
          onConfirm={handleCropConfirm}
        />
      )}
    </div>
  )
}
