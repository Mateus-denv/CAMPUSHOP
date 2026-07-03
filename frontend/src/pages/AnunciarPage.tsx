import { Layout } from "@/components/Layout";
import { Link } from "react-router-dom";

export function AnunciarPage() {
  return (
    <Layout>
      <section className="mx-auto max-w-3xl rounded-[2rem] border border-slate-200 bg-white p-10 shadow-sm">
        <div className="mb-6 inline-flex h-16 w-16 items-center justify-center rounded-full bg-sky-100 text-3xl text-sky-700">
          🏷️
        </div>
        <h1 className="mb-4 text-3xl font-bold text-slate-900">
          Anunciar no CampuShop
        </h1>
        <p className="mb-6 text-base leading-7 text-slate-600">
          Publique seu produto com fotos, descrição e preço. Comece agora mesmo
          clicando no botão abaixo.
        </p>
        <div className="mb-6 rounded-3xl bg-slate-50 p-5 text-sm leading-7 text-slate-600">
          <p className="font-semibold text-slate-900">
            Como preparar seu anúncio
          </p>
          <ul className="mt-4 list-disc space-y-2 pl-5">
            <li>Escolha um título direto e objetivo.</li>
            <li>Descreva o estado do produto e as condições de retirada.</li>
            <li>Anexe pelo menos 3 fotos claras e bem iluminadas.</li>
          </ul>
        </div>
        <div className="mb-6 rounded-3xl bg-sky-50 p-5 text-sm leading-7 text-slate-700">
          <p className="font-semibold text-slate-900">
            Dicas para vender rápido
          </p>
          <p className="mt-2">
            Mantenha o preço competitivo, responda rápido às mensagens e indique
            se o produto pode ser retirado no campus. Produtos claros e bem
            apresentados recebem mais atenção.
          </p>
        </div>
        <Link
          to="/cadastrar-produto"
          className="inline-flex rounded-full bg-slate-900 px-6 py-3 text-sm font-semibold text-white transition hover:bg-slate-800"
        >
          Ir para anunciar
        </Link>
      </section>
    </Layout>
  );
}
