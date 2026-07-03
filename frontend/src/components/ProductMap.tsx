import React from 'react'

type Props = {
  cidade?: string | null
  estado?: string | null
}

export function ProductMap({ cidade, estado }: Props) {
  const key = import.meta.env.VITE_GOOGLE_MAPS_API_KEY

  if (!key || !cidade) return null

  const q = encodeURIComponent([cidade, estado].filter(Boolean).join(', '))
  const src = `https://www.google.com/maps/embed/v1/place?key=${key}&q=${q}&zoom=12`

  return (
    <div className="mt-4 h-48 w-full overflow-hidden rounded-lg">
      <iframe
        title="Mapa aproximado"
        width="100%"
        height="100%"
        loading="lazy"
        src={src}
        style={{ border: 0 }}
      />
      <div className="mt-2 text-xs text-slate-500">Local aproximado (cidade/região). Endereço exato não é exibido.</div>
    </div>
  )
}
