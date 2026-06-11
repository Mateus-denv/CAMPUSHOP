import { Layout } from '@/components/Layout'

export function TermosPage() {
  return (
    <Layout>
      <section className="mx-auto max-w-3xl rounded-[2rem] border border-slate-200 bg-white p-10 shadow-sm">
        <div className="mb-6 inline-flex h-16 w-16 items-center justify-center rounded-full bg-violet-100 text-3xl text-violet-700">
          📜
        </div>
        <h1 className="mb-4 text-3xl font-bold text-slate-900">Termos</h1>
        <p className="text-base leading-7 text-slate-600">
          Leia os termos de uso do CampuShop antes de publicar anúncios, fazer compras e usar nossos serviços.
        </p>
      </section>
    </Layout>
  )
}
