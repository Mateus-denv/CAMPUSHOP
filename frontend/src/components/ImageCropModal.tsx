import { X } from 'lucide-react'
import { useEffect, useRef, useState } from 'react'

type ImageCropModalProps = {
  open: boolean
  file: File | null
  aspectRatio: number
  title: string
  helperText: string
  confirmLabel?: string
  onCancel: () => void
  onConfirm: (file: File) => void
}

const MIN_ZOOM = 1
const MAX_ZOOM = 2.5
const OUTPUT_WIDTH = 1080

export function ImageCropModal({
  open,
  file,
  aspectRatio,
  title,
  helperText,
  confirmLabel = 'Aplicar recorte',
  onCancel,
  onConfirm,
}: ImageCropModalProps) {
  const imageRef = useRef<HTMLImageElement | null>(null)
  const [imageUrl, setImageUrl] = useState('')
  const [imageLoaded, setImageLoaded] = useState(false)
  const [imageSize, setImageSize] = useState({ width: 0, height: 0 })
  const [zoom, setZoom] = useState(MIN_ZOOM)

  useEffect(() => {
    if (!open || !file) {
      setImageUrl('')
      setImageLoaded(false)
      setImageSize({ width: 0, height: 0 })
      setZoom(MIN_ZOOM)
      return
    }

    const url = URL.createObjectURL(file)
    setImageUrl(url)

    return () => URL.revokeObjectURL(url)
  }, [file, open])

  const handleImageLoad = () => {
    if (!imageRef.current) {
      return
    }

    setImageSize({
      width: imageRef.current.naturalWidth,
      height: imageRef.current.naturalHeight,
    })
    setImageLoaded(true)
  }

  const applyCrop = async () => {
    if (!file || !imageRef.current || !imageSize.width || !imageSize.height) {
      return
    }

    const sourceWidth = imageSize.width
    const sourceHeight = imageSize.height
    const targetRatio = aspectRatio

    const baseCropWidth = Math.min(sourceWidth, sourceHeight * targetRatio)
    const baseCropHeight = baseCropWidth / targetRatio

    const cropWidth = Math.min(sourceWidth, baseCropWidth / zoom)
    const cropHeight = Math.min(sourceHeight, baseCropHeight / zoom)

    const cropX = Math.max(0, (sourceWidth - cropWidth) / 2)
    const cropY = Math.max(0, (sourceHeight - cropHeight) / 2)
    const outputWidth = OUTPUT_WIDTH
    const outputHeight = Math.round(outputWidth / targetRatio)

    const canvas = document.createElement('canvas')
    canvas.width = outputWidth
    canvas.height = outputHeight

    const context = canvas.getContext('2d')
    if (!context) {
      return
    }

    context.drawImage(imageRef.current, cropX, cropY, cropWidth, cropHeight, 0, 0, outputWidth, outputHeight)

    const blob = await new Promise<Blob | null>((resolve) => canvas.toBlob(resolve, 'image/jpeg', 0.92))
    if (!blob) {
      return
    }

    const fileNameBase = file.name.replace(/\.[^.]+$/, '')
    const croppedFile = new File([blob], `${fileNameBase}-recortada.jpg`, { type: 'image/jpeg' })
    onConfirm(croppedFile)
  }

  if (!open) {
    return null
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/70 px-4 py-6 backdrop-blur-sm">
      <div className="w-full max-w-xl overflow-hidden rounded-[1.5rem] bg-white shadow-2xl max-h-[88vh]">
        <div className="flex items-start justify-between gap-4 border-b border-slate-200 p-4 sm:p-5">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-400">Recorte automático</p>
            <h2 className="text-2xl font-black tracking-tight text-slate-900">{title}</h2>
            <p className="mt-1 text-sm text-slate-500">{helperText}</p>
          </div>
          <button type="button" onClick={onCancel} className="rounded-full border border-slate-200 p-2 text-slate-500 transition hover:bg-slate-50 hover:text-slate-900" aria-label="Fechar">
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="grid gap-4 p-4 sm:p-5 lg:grid-cols-[minmax(0,1fr)_220px]">
          <div className="space-y-3">
            <div className="mx-auto w-full max-w-[340px]">
              <div className="relative overflow-hidden rounded-[1.5rem] border border-slate-200 bg-slate-950 shadow-inner" style={{ aspectRatio }}>
                {imageUrl ? (
                  <>
                    <img
                      ref={imageRef}
                      src={imageUrl}
                      alt="Imagem para recorte"
                      onLoad={handleImageLoad}
                      className="absolute left-1/2 top-1/2 h-full w-full select-none object-contain"
                      style={{ transform: `translate(-50%, -50%) scale(${zoom})` }}
                      draggable={false}
                    />
                    <div className="pointer-events-none absolute inset-0 rounded-[1.5rem] ring-[9999px] ring-black/35" />
                    <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(to_right,rgba(255,255,255,0.15)_1px,transparent_1px),linear-gradient(to_bottom,rgba(255,255,255,0.15)_1px,transparent_1px)] bg-[length:33.333%_100%,100%_33.333%]" />
                  </>
                ) : (
                  <div className="flex h-full items-center justify-center text-sm font-semibold text-slate-400">Carregando imagem...</div>
                )}
              </div>
            </div>

            <div className="rounded-[1rem] border border-slate-200 bg-slate-50 p-3 text-sm text-slate-600">
              O corte final vai pegar automaticamente o centro da imagem na proporção 4:5.
            </div>
          </div>

          <div className="rounded-[1.25rem] border border-slate-200 bg-slate-50 p-4 lg:self-start">
            <p className="text-sm font-semibold uppercase tracking-[0.14em] text-slate-500">Zoom</p>
            <input
              type="range"
              min={MIN_ZOOM}
              max={MAX_ZOOM}
              step="0.01"
              value={zoom}
              onChange={(event) => setZoom(Number(event.target.value))}
              className="mt-4 w-full accent-violet-600"
            />
            <p className="mt-2 text-sm text-slate-500">O zoom só aproxima o corte central.</p>

            <div className="mt-6 rounded-[1.25rem] border border-slate-200 bg-white p-4 text-sm text-slate-600">
              {imageLoaded ? (
                <>
                  <p><span className="font-semibold text-slate-900">Dimensão original:</span> {imageSize.width} x {imageSize.height}px</p>
                  <p className="mt-1"><span className="font-semibold text-slate-900">Proporção alvo:</span> 4:5</p>
                </>
              ) : (
                <p>Abra uma imagem para liberar os controles.</p>
              )}
            </div>

            <div className="mt-6 flex gap-3">
              <button type="button" onClick={onCancel} className="flex-1 rounded-2xl border border-slate-200 px-4 py-3 font-semibold text-slate-700 transition hover:bg-white">
                Cancelar
              </button>
              <button type="button" onClick={applyCrop} className="flex-1 rounded-2xl bg-slate-900 px-4 py-3 font-semibold text-white transition hover:bg-slate-800">
                {confirmLabel}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}