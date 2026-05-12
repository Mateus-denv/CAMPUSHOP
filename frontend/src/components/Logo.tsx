const logoCampuShop = new URL('../campuShopcapa.png', import.meta.url).href

type LogoProps = {
  className?: string
}

export function Logo({ className = '' }: LogoProps) {
  return (
    <img
      src={logoCampuShop}
      alt="CampuShop Logo"
      className={`h-8 w-auto ${className}`}
    />
  )
}
