import { ReactNode } from 'react'
import { Header, Footer } from './Header'

interface LayoutProps {
  children: ReactNode
}

export function Layout({ children }: LayoutProps) {
  return (
    <div className="min-h-screen flex flex-col bg-slate-50 text-slate-900">
      <Header />
      <main className="flex-1 mx-auto w-full max-w-7xl px-4 py-6 sm:py-8">
        {children}
      </main>
      <Footer />
    </div>
  )
}
