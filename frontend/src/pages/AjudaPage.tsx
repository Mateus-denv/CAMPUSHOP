import { Layout } from '@/components/Layout'

export function AjudaPage() {
  return (
    <Layout>
      <section className="mx-auto max-w-3xl rounded-[2rem] border border-slate-200 bg-white p-10 shadow-sm">
        <div className="mb-6 inline-flex h-16 w-16 items-center justify-center rounded-full bg-blue-100 text-3xl text-blue-700">
          ❓
        </div>
        <h1 className="mb-4 text-3xl font-bold text-slate-900">Central de ajuda</h1>
        <p className="mb-6 text-base leading-7 text-slate-600">
          Encontre respostas rápidas sobre como comprar, vender, pagar e acompanhar seus pedidos.
        </p>
        <div className="space-y-4 text-slate-700">
          <p className="font-semibold">O que você precisa?</p>
          <ul className="list-disc space-y-2 pl-5 text-sm leading-7 text-slate-600">
            <li>Como cadastrar um produto para venda</li>
            <li>Como acompanhar o status do seu pedido</li>
            <li>Como falar com o suporte pelo WhatsApp</li>
          </ul>
        </div>
      </section>
    </Layout>
  )
}
