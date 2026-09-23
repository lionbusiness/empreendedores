import { useState, useCallback } from 'react'
import Cropper, { type Area } from 'react-easy-crop'
import { getCroppedImageFile } from '@/lib/cropImage'

interface Props {
  imageSrc: string
  fileName: string
  onCancel: () => void
  onConfirm: (file: File) => void
}

export function ImageCropModal({ imageSrc, fileName, onCancel, onConfirm }: Props) {
  const [crop, setCrop] = useState({ x: 0, y: 0 })
  const [zoom, setZoom] = useState(1)
  const [croppedAreaPixels, setCroppedAreaPixels] = useState<Area | null>(null)
  const [processing, setProcessing] = useState(false)

  const onCropComplete = useCallback((_: Area, areaPixels: Area) => {
    setCroppedAreaPixels(areaPixels)
  }, [])

  async function handleConfirm() {
    if (!croppedAreaPixels) return
    setProcessing(true)
    try {
      const file = await getCroppedImageFile(imageSrc, croppedAreaPixels, fileName)
      onConfirm(file)
    } finally {
      setProcessing(false)
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4">
      <div className="flex w-full max-w-md flex-col overflow-hidden rounded-lg border border-ink-700 bg-ink-900">
        <div className="relative h-80 w-full bg-ink-950">
          <Cropper
            image={imageSrc}
            crop={crop}
            zoom={zoom}
            aspect={1}
            cropShape="rect"
            showGrid={true}
            onCropChange={setCrop}
            onZoomChange={setZoom}
            onCropComplete={onCropComplete}
          />
        </div>

        <div className="flex flex-col gap-4 p-5">
          <div>
            <label className="mb-1.5 block text-xs text-sand">Zoom</label>
            <input
              type="range"
              min={1}
              max={3}
              step={0.05}
              value={zoom}
              onChange={(e) => setZoom(Number(e.target.value))}
              className="w-full accent-gold-500"
            />
          </div>
          <p className="text-xs text-sand">Arraste a imagem pra posicionar, e use o zoom pra ajustar o enquadramento.</p>
          <div className="flex justify-end gap-3">
            <button
              type="button"
              onClick={onCancel}
              className="rounded-md border border-ink-700 px-4 py-2 text-sm text-sand hover:text-cream"
            >
              Cancelar
            </button>
            <button
              type="button"
              onClick={handleConfirm}
              disabled={processing}
              className="rounded-md bg-gold-gradient px-4 py-2 text-sm font-semibold text-ink-950 hover:opacity-90 disabled:opacity-50"
            >
              {processing ? 'Aplicando…' : 'Usar essa foto'}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
