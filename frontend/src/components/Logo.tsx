// Importa as logos SVG: Home, Completa, Símbolo e Escrita
const logoHome = new URL('./LogoHome.svg', import.meta.url).href
const logoCompleta = new URL('./LogoCompleta.svg', import.meta.url).href
const logoSimbolo = new URL('./Logo.svg', import.meta.url).href
const logoEscrita = new URL('./LogoEscrita.svg', import.meta.url).href

type LogoProps = {
  className?: string
  variant?: 'home' | 'completa' | 'responsive' | 'simbolo-escrita' | 'simbolo' // Defina qual versão exibir
}

export function Logo({ className = '', variant = 'home' }: LogoProps) {
  if (variant === 'completa') {
    // Logo completa para desktop - símbolo + texto em uma linha
    return (
      <img
        src={logoCompleta}
        alt="CampuShop Logo"
        className={`h-40 w-auto sm:h-48 ${className}`}
      />
    )
  }

  if (variant === 'simbolo') {
    // Apenas o símbolo para header/nav
    return (
      <img
        src={logoSimbolo}
        alt="CampuShop Símbolo"
        className={`h-12 w-12 sm:h-16 sm:w-16 ${className}`}
      />
    )
  }

  if (variant === 'escrita') {
    // Apenas a escrita para header/nav
    return (
      <img
        src={logoEscrita}
        alt="CampuShop"
        className={`h-10 w-auto sm:h-14 ${className}`}
      />
    )
  }

  if (variant === 'home') {
    // Logo Home usada no header principal
    return (
      <img
        src={logoHome}
        alt="CampuShop Logo Home"
        className={`h-20 w-auto sm:h-28 ${className}`}
      />
    )
  }

  if (variant === 'simbolo-escrita') {
    // Logo com símbolo + escrita lado a lado
    return (
      <div className="flex items-center gap-2 sm:gap-3">
        <img
          src={logoSimbolo}
          alt="CampuShop Símbolo"
          className={`h-12 w-12 sm:h-16 sm:w-16 ${className}`}
        />
        <img
          src={logoEscrita}
          alt="CampuShop Escrita"
          className={`h-12 w-auto sm:h-16 sm:w-auto ${className}`}
        />
      </div>
    )
  }

  // Logo responsiva: em desktop mostra Completa, em mobile mostra Símbolo + Escrita lado a lado
  return (
    <>
      {/* Desktop: mostra logo completa - aumentado para h-24 */}
      <img
        src={logoCompleta}
        alt="CampuShop Logo"
        className={`hidden h-24 w-auto md:block ${className}`}
      />
      {/* Mobile: mostra símbolo e escrita lado a lado - aumentado */}
      <div className="flex items-center gap-2 md:hidden">
        <img
          src={logoSimbolo}
          alt="CampuShop Símbolo"
          className={`h-16 w-16 ${className}`}
        />
        <img
          src={logoEscrita}
          alt="CampuShop Escrita"
          className={`h-12 w-auto ${className}`}
        />
      </div>
    </>
  )
}
