import { Link } from 'react-router-dom'
import { Layout } from '@/components/Layout'

export function AnunciarPage() {
  return (
    <Layout>
      <section className="mx-auto max-w-3xl rounded-[2rem] border border-slate-200 bg-white p-10 shadow-sm">
        <div className="mb-6 inline-flex h-16 w-16 items-center justify-center rounded-full bg-sky-100 text-3xl text-sky-700">
          🏷️
        </div>
        <h1 className="mb-4 text-3xl font-bold text-slate-900">Anunciar no CampuShop</h1>
        <p className="mb-6 text-base leading-7 text-slate-600">
          Publique seu produto com fotos, descrição e preço. Comece agora mesmo clicando no botão abaixo.
        </p>
        <Link to="/cadastrar-produto" className="inline-flex rounded-full bg-slate-900 px-6 py-3 text-sm font-semibold text-white transition hover:bg-slate-800">
          Ir para anunciar
        </Link>
      </section>
    </Layout>
  )
}
