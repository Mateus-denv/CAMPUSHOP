import { Layout } from "@/components/Layout";

export function TermosPage() {
  return (
    <Layout>
      <section className="mx-auto max-w-3xl rounded-[2rem] border border-slate-200 bg-white p-10 shadow-sm">
        <div className="mb-6 inline-flex h-16 w-16 items-center justify-center rounded-full bg-violet-100 text-3xl text-violet-700">
          📜
        </div>
        <h1 className="mb-4 text-3xl font-bold text-slate-900">Termos</h1>
        <p className="mb-6 text-base leading-7 text-slate-600">
          Leia os termos de uso do CampuShop antes de publicar anúncios, fazer
          compras e usar nossos serviços.
        </p>
        <div className="space-y-6 text-slate-700">
          <div>
            <p className="font-semibold">Uso da plataforma</p>
            <p className="mt-2 text-sm leading-7 text-slate-600">
              O CampuShop é uma plataforma de marketplace estudantil. Usuários
              devem agir de forma responsável, fornecer informações verdadeiras
              e cumprir o combinado nas transações.
            </p>
          </div>
          <div>
            <p className="font-semibold">Responsabilidades</p>
            <p className="mt-2 text-sm leading-7 text-slate-600">
              O CampuShop não é responsável pela qualidade dos produtos
              anunciados nem pelo cumprimento de acordos entre compradores e
              vendedores. O suporte atua como canal para esclarecer dúvidas e
              mediar conflitos.
            </p>
          </div>
          <div>
            <p className="font-semibold">Conduta proibida</p>
            <ul className="mt-2 list-disc space-y-2 pl-5 text-sm leading-7 text-slate-600">
              <li>Anunciar itens proibidos ou falsos</li>
              <li>Compartilhar dados pessoais fora dos canais do app</li>
              <li>Praticar discriminação ou assédio</li>
            </ul>
          </div>
          <div>
            <p className="font-semibold">Direitos do serviço</p>
            <p className="mt-2 text-sm leading-7 text-slate-600">
              Reservamos o direito de suspender contas, remover anúncios e
              atualizar estes termos sempre que necessário para manter a
              comunidade segura.
            </p>
          </div>
        </div>
      </section>
    </Layout>
  );
}
