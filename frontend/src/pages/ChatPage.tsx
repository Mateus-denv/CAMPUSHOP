import { Layout } from '@/components/Layout'

export function ChatPage() {
  return (
    <Layout>
      <section className="mx-auto max-w-3xl rounded-[2rem] border border-slate-200 bg-white p-10 text-center shadow-sm">
        <div className="mb-6 inline-flex h-16 w-16 items-center justify-center rounded-full bg-blue-100 text-3xl text-blue-700">
          💬
        </div>
        <h1 className="mb-4 text-3xl font-bold text-slate-900">Chat em desenvolvimento</h1>
        <p className="mx-auto max-w-xl text-base leading-7 text-slate-600">
          Esta página ainda está em desenvolvimento. Em breve você poderá conversar com vendedores e suporte diretamente pelo chat.
        </p>
      </section>
    </Layout>
  )
}
