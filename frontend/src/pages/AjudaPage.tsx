import { Layout } from "@/components/Layout";
import { useState } from "react";

const TIPOS_DE_SOLICITACAO = [
  "Ajuda",
  "Sugestão",
  "Pedido",
  "Dúvida",
  "Ajuste",
  "Outro",
];

const SOLICITACOES_ULTIMOS_3_MESES = [
  {
    data: "20/06/2026",
    tipo: "Dúvida",
    descricao: "Consulta sobre o status de um pedido",
  },
  {
    data: "14/05/2026",
    tipo: "Ajuste",
    descricao: "Solicitação para editar um anúncio publicado",
  },
  {
    data: "02/04/2026",
    tipo: "Sugestão",
    descricao: "Sugestão para melhorar os filtros de busca",
  },
];

export function AjudaPage() {
  const [tipo, setTipo] = useState("Ajuda");
  const [descricao, setDescricao] = useState("");
  const [enviado, setEnviado] = useState(false);

  function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!descricao.trim()) {
      return;
    }

    setEnviado(true);
    setDescricao("");
  }

  return (
    <Layout>
      <section className="mx-auto w-full max-w-4xl rounded-[2rem] border border-slate-200 bg-white p-8 shadow-sm sm:p-10">
        <div className="mb-6 inline-flex h-16 w-16 items-center justify-center rounded-full bg-blue-100 text-3xl text-blue-700">
          ❓
        </div>
        <h1 className="mb-3 text-3xl font-bold text-slate-900">
          Central de ajuda
        </h1>
        <p className="mb-8 text-base leading-7 text-slate-600">
          Envie sua solicitação diretamente para a equipe. Selecione o tipo de
          pedido, descreva o problema ou a sugestão e envie.
        </p>

        <form
          onSubmit={handleSubmit}
          className="space-y-6 rounded-[1.5rem] border border-slate-200 bg-slate-50 p-6"
        >
          <div>
            <label
              className="mb-2 block text-sm font-semibold text-slate-700"
              htmlFor="tipo-solicitacao"
            >
              Tipo de solicitação
            </label>
            <select
              id="tipo-solicitacao"
              value={tipo}
              onChange={(event) => setTipo(event.target.value)}
              className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-700 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
            >
              {TIPOS_DE_SOLICITACAO.map((item) => (
                <option key={item} value={item}>
                  {item}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label
              className="mb-2 block text-sm font-semibold text-slate-700"
              htmlFor="descricao-solicitacao"
            >
              Descreva sua solicitação
            </label>
            <textarea
              id="descricao-solicitacao"
              rows={6}
              value={descricao}
              onChange={(event) => setDescricao(event.target.value)}
              placeholder="Ex.: Tenho uma dúvida sobre pedidos, preciso ajustar um anúncio, ou quero sugerir uma melhoria..."
              className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-700 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
            />
          </div>

          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <p className="text-sm text-slate-500">
              Sua mensagem será enviada para o time de suporte do CampuShop.
            </p>
            <button
              type="submit"
              className="rounded-full bg-blue-600 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-blue-700"
            >
              Enviar solicitação
            </button>
          </div>

          {enviado && (
            <div className="rounded-2xl border border-emerald-200 bg-emerald-50 p-4 text-sm text-emerald-700">
              Solicitação enviada com sucesso. Nossa equipe receberá sua
              mensagem e entrará em contato pelo e-mail cadastrado em sua conta.
            </div>
          )}
        </form>

        <div className="mt-8 rounded-[1.5rem] border border-slate-200 bg-white p-6">
          <h2 className="mb-4 text-xl font-semibold text-slate-900">
            Solicitações nos últimos 3 meses
          </h2>
          <p className="mb-4 text-sm leading-7 text-slate-600">
            Abaixo estão as solicitações de contato registradas com o e-mail
            cadastrado na sua conta.
          </p>

          <div className="space-y-3">
            {SOLICITACOES_ULTIMOS_3_MESES.map((item) => (
              <div
                key={`${item.data}-${item.tipo}`}
                className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3"
              >
                <div className="flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between">
                  <span className="text-sm font-semibold text-slate-800">
                    {item.tipo}
                  </span>
                  <span className="text-sm text-slate-500">{item.data}</span>
                </div>
                <p className="mt-2 text-sm text-slate-600">{item.descricao}</p>
              </div>
            ))}
          </div>
        </div>
      </section>
    </Layout>
  );
}
