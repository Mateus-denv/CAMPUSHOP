type Props = {
  cidade?: string | null
  estado?: string | null
}

export function ProductMap({ cidade, estado }: Props) {
  const key = import.meta.env.VITE_GOOGLE_MAPS_API_KEY

  if (!key || !cidade) return null

  // Cria query segura para os parâmetros de cidade/estado.
  const query = [cidade, estado].filter(Boolean).join(', ')
  const encodedQuery = encodeURIComponent(query)
  const src = `https://www.google.com/maps/embed/v1/place?key=${key}&q=${encodedQuery}&zoom=12`
  const searchUrl = `https://www.google.com/maps/search/?api=1&query=${encodedQuery}`

  return (
    <div className="mt-4 w-full overflow-hidden rounded-lg border border-slate-200 bg-white shadow-sm">
      <div className="relative h-48 w-full overflow-hidden bg-slate-100">
        <iframe
          title="Mapa aproximado"
          width="100%"
          height="100%"
          loading="lazy"
          src={src}
          style={{ border: 0 }}
        />
        <a
          href={searchUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="absolute inset-0 z-10 bg-transparent"
          aria-label="Abrir mapa aproximado no Google Maps"
        />
      </div>
      <div className="flex flex-col gap-2 px-3 py-2 text-sm text-slate-600">
        <span>Local aproximado (cidade/região). Endereço exato não é exibido.</span>
        <a href={searchUrl} target="_blank" rel="noopener noreferrer" className="font-semibold text-blue-700 underline-offset-2 transition hover:text-blue-900 hover:underline">
          Abrir no Google Maps
        </a>
      </div>
    </div>
  )
}
