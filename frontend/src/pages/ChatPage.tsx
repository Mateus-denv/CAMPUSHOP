import { Layout } from '@/components/Layout'

const mensagens = [
  { lado: 'direita', texto: 'Olá! Tenho interesse no livro. Ainda está disponível?', hora: '14:32' },
  { lado: 'esquerda', texto: 'Oi! Sim, ainda está disponível. É um livro em ótimo estado!', hora: '14:33' },
  { lado: 'direita', texto: 'Perfeito! Podemos combinar a entrega na UFBA mesmo?', hora: '14:35' },
  { lado: 'esquerda', texto: 'Claro! Podemos nos encontrar na biblioteca.', hora: '14:36' },
]

export function ChatPage() {
  return (
    <Layout>
      <section className="overflow-hidden rounded-[2rem] border border-slate-200 bg-white shadow-sm">
        <div className="flex items-center gap-4 border-b border-slate-200 p-4">
          <button className="font-semibold text-slate-600 transition hover:text-blue-700">← Voltar</button>
          <div className="h-10 w-10 rounded-full bg-gradient-to-br from-slate-200 to-slate-100" />
          <div>
            <p className="font-bold text-slate-900">João Silva</p>
            <p className="text-sm text-slate-500">Vendedor</p>
          </div>
        </div>

        <div className="flex items-center gap-3 border-b border-slate-200 bg-slate-50 p-4">
          <div className="h-12 w-12 rounded-2xl bg-gradient-to-br from-slate-200 to-slate-100" />
          <div>
            <p className="font-semibold text-slate-900">Livro de lógica de programação</p>
            <p className="font-bold text-blue-700">R$ 150,00</p>
          </div>
        </div>

        <div className="min-h-[460px] space-y-4 bg-slate-50 p-6">
          {mensagens.map((msg, index) => (
            <div key={index} className={`flex ${msg.lado === 'direita' ? 'justify-end' : 'justify-start'}`}>
              <div className={`${msg.lado === 'direita' ? 'bg-gradient-to-r from-blue-600 to-indigo-700 text-white' : 'bg-white text-slate-800'} max-w-md rounded-2xl px-4 py-3 shadow-sm`}>
                <p>{msg.texto}</p>
                <p className={`mt-1 text-xs ${msg.lado === 'direita' ? 'text-blue-100' : 'text-slate-500'}`}>{msg.hora}</p>
              </div>
            </div>
          ))}
        </div>

        <div className="flex gap-3 border-t border-slate-200 bg-white p-4">
          <input className="flex-1 rounded-2xl border border-slate-200 px-4 py-3 outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-100" placeholder="Digite sua mensagem..." />
          <button className="rounded-2xl bg-slate-900 px-5 font-semibold text-white">➤</button>
        </div>
      </section>
    </Layout>
  )
}
