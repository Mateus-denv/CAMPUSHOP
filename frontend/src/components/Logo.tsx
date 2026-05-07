import logoCampuShhop from '../assets/logoCampuShhop.png'

type LogoProps = {
  className?: string
}

export function Logo({ className = '' }: LogoProps) {
  return (
    <img 
      src={logoCampuShhop}
      alt="CampuShop Logo" 
      className={`h-8 w-auto ${className}`}
    />
  )
}
