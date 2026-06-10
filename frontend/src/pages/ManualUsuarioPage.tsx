import { Layout } from '@/components/Layout'

export function ManualUsuarioPage() {
  return (
    <Layout>
      <div className="mx-auto w-full max-w-6xl rounded-[2rem] border border-slate-200 bg-white shadow-sm">
        <div className="rounded-t-[2rem] border-b border-slate-200 bg-slate-50 p-8">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="text-sm uppercase tracking-[0.22em] text-slate-500">Manual do usuário</p>
              <h1 className="mt-3 text-3xl font-bold text-slate-900">Manual do usuário</h1>
              <p className="mt-3 max-w-2xl text-base leading-7 text-slate-600">
                Esta página carrega o manual em HTML que você já possui. Ele é exibido diretamente no app para facilitar o acesso.
              </p>
            </div>
            <div className="inline-flex h-16 w-16 items-center justify-center rounded-full bg-orange-100 text-3xl text-orange-700">
              📘
            </div>
          </div>
        </div>

        <div className="h-[calc(100vh-220px)] min-h-[680px] overflow-hidden rounded-b-[2rem]">
          <iframe
            src="/manual-usuario.html"
            title="Manual do usuário"
            className="h-full w-full border-none"
          />
        </div>
      </div>
    </Layout>
  )
}
