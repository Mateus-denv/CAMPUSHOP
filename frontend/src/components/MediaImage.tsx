import { buildApiImageUrl } from '@/lib/image-utils'
import { useEffect, useState } from 'react'

type MediaImageProps = {
  src?: string
  alt: string
  fallbackLabel: string
  className?: string
  imageClassName?: string
}

export function MediaImage({ src, alt, fallbackLabel, className = '', imageClassName = '' }: MediaImageProps) {
  const [erro, setErro] = useState(false)

  useEffect(() => {
    setErro(false)
  }, [src])

  if (!src || erro) {
    return (
      <div className={`flex items-center justify-center rounded-[inherit] bg-gradient-to-br from-slate-100 to-slate-200 text-sm font-semibold text-slate-400 ${className}`}>
        {fallbackLabel}
      </div>
    )
  }

  return (
    <div className={`overflow-hidden rounded-[inherit] ${className}`}>
      <img
        src={buildApiImageUrl(src)}
        alt={alt}
        loading="lazy"
        onError={() => setErro(true)}
        className={`h-full w-full object-cover ${imageClassName}`}
      />
    </div>
  )
}