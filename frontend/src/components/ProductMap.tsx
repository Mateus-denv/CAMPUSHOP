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

  const searchUrl = `https://www.google.com/maps/search/?api=1&query=${q}`

  return (
    <div className="mt-4 w-full overflow-hidden rounded-lg border border-slate-200 bg-white shadow-sm">
      <a href={searchUrl} target="_blank" rel="noreferrer" className="block h-48 w-full overflow-hidden text-transparent">
        <iframe
          title="Mapa aproximado"
          width="100%"
          height="100%"
          loading="lazy"
          src={src}
          style={{ border: 0 }}
        />
      </a>
      <div className="flex flex-col gap-2 px-3 py-2 text-sm text-slate-600">
        <span>Local aproximado (cidade/região).</span>
        <a href={searchUrl} target="_blank" rel="noreferrer" className="font-semibold text-blue-700 underline-offset-2 transition hover:text-blue-900 hover:underline">
          Abrir no Google Maps
        </a>
      </div>
    </div>
  )
}
