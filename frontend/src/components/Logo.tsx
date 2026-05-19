// A logo fica ao lado deste componente, então o caminho precisa apontar para o arquivo local correto.
const logoCampuShop = new URL('./LogoCampuShop.png', import.meta.url).href

type LogoProps = {
  className?: string
}

export function Logo({ className = '' }: LogoProps) {
  return (
    <img
      src={logoCampuShop}
      alt="CampuShop Logo"
      // Ajustado conforme solicitado: aumentar altura para h-20 e manter proporção com w-auto
      className={`h-20 w-auto ${className}`}
    />
  )
}
