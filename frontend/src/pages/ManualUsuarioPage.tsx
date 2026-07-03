import { Layout } from "@/components/Layout";
import {
  AlertTriangle,
  ArrowRight,
  BadgeInfo,
  BookOpen,
  CheckCircle2,
  CircleAlert,
  Compass,
  FileText,
  HelpCircle,
  LockKeyhole,
  MessageCircle,
  PackagePlus,
  Search,
  ShieldCheck,
  ShoppingBag,
  ShoppingCart,
  Sparkles,
  Store,
  UserCircle2,
} from "lucide-react";
import { useMemo, useState } from "react";
import { Link } from "react-router-dom";

const BLOCO_DE_ACOES = [
  {
    titulo: "Comece aqui",
    itens: [
      {
        titulo: "Entrar na conta",
        descricao: "Acesse o seu perfil, pedidos e mensagens.",
        rota: "/login",
        icone: LockKeyhole,
      },
      {
        titulo: "Criar conta",
        descricao: "Abra sua conta para comprar, vender e interagir.",
        rota: "/cadastro",
        icone: UserCircle2,
      },
      {
        titulo: "Explorar produtos",
        descricao: "Descubra itens em destaque e navegue pelas categorias.",
        rota: "/produtos",
        icone: Compass,
      },
    ],
  },
  {
    titulo: "Gerenciar sua experiência",
    itens: [
      {
        titulo: "Anunciar produto",
        descricao: "Publique um novo item para venda com fotos e preço.",
        rota: "/cadastrar-produto",
        icone: PackagePlus,
      },
      {
        titulo: "Meus pedidos",
        descricao: "Acompanhe o status dos pedidos e da aprovação.",
        rota: "/pedidos",
        icone: ShoppingBag,
      },
      {
        titulo: "Carrinho",
        descricao: "Revise os itens escolhidos antes de finalizar a compra.",
        rota: "/carrinho",
        icone: ShoppingCart,
      },
      {
        titulo: "Chat",
        descricao: "Converse com compradores, vendedores ou suporte.",
        rota: "/chat",
        icone: MessageCircle,
      },
      {
        titulo: "Minha conta",
        descricao: "Atualize seus dados e veja suas informações.",
        rota: "/conta",
        icone: UserCircle2,
      },
    ],
  },
  {
    titulo: "Mais informações",
    itens: [
      {
        titulo: "Central de ajuda",
        descricao: "Encontre suporte e respostas rápidas.",
        rota: "/ajuda",
        icone: HelpCircle,
      },
      {
        titulo: "Política de privacidade",
        descricao: "Consulte como seus dados são tratados.",
        rota: "/privacidade",
        icone: FileText,
      },
      {
        titulo: "Termos de uso",
        descricao: "Veja as regras para usar a plataforma.",
        rota: "/termos",
        icone: FileText,
      },
      {
        titulo: "Anunciar",
        descricao: "Saiba como publicar um anúncio completo.",
        rota: "/anunciar",
        icone: Store,
      },
    ],
  },
];

const GUIA_DE_PASSOS = [
  {
    id: "cadastro-login",
    titulo: "Cadastro e Login",
    resumo:
      "Crie sua conta, faça login e tenha acesso ao perfil, carrinho, pedidos e chat.",
    rota: "/cadastro",
    icone: LockKeyhole,
    passos: [
      "Acesse a página de cadastro em /cadastro e preencha os dados básicos, incluindo e-mail, nome, RA ou matrícula e CPF.",
      "Confirme o e-mail informado e complete o cadastro para abrir o acesso à plataforma.",
      "Na próxima vez, entre em /login com o e-mail e a senha cadastrados para acessar seu perfil e funcionalidades.",
    ],
    erros: [
      {
        titulo: "Digite um R.A. válido",
        descricao:
          "O sistema valida o identificador acadêmico para evitar cadastros incorretos. Revise se o número foi digitado sem espaços, pontos ou letras extras.",
      },
      {
        titulo: "CPF inválido",
        descricao:
          "O CPF precisa ter 11 dígitos válidos e seguir o padrão oficial. Verifique se não há caracteres a mais ou faltando números.",
      },
      {
        titulo: "E-mail já cadastrado",
        descricao:
          "Esse e-mail já está vinculado a uma conta. Use outro endereço ou faça login na conta existente.",
      },
    ],
  },
  {
    id: "gerenciar-conta",
    titulo: "Gerenciar Conta",
    resumo:
      "Atualize seus dados pessoais, dados de contato e preferências no seu perfil.",
    rota: "/conta",
    icone: UserCircle2,
    passos: [
      "Depois de fazer login, abra a página /conta para visualizar suas informações.",
      "Use o botão de editar para alterar e-mail, telefone, dados de contato e outras informações pessoais.",
      "Salve as alterações e confira se os dados apareceram corretamente no resumo da conta.",
    ],
    erros: [
      {
        titulo: "Não foi possível salvar as alterações",
        descricao:
          "Isso geralmente acontece quando algum campo está vazio ou com formato incorreto. Revise e-mail, CPF e telefone antes de salvar.",
      },
      {
        titulo: "A conta não mostra os dados atualizados",
        descricao:
          "A atualização pode levar alguns instantes. Atualize a página e confira novamente se a alteração foi persistida.",
      },
    ],
  },
  {
    id: "cadastrar-produto",
    titulo: "Cadastrar Produto",
    resumo:
      "Publique um anúncio completo com título, categoria, preço, descrição e fotos.",
    rota: "/cadastrar-produto",
    icone: PackagePlus,
    passos: [
      "Entre na página /cadastrar-produto para criar um novo anúncio.",
      "Preencha título, categoria, descrição, preço e escolha imagens que representem bem o produto.",
      "Revise os dados, confirme o anúncio e aguarde a publicação ou o salvamento como rascunho, conforme o fluxo do sistema.",
    ],
    erros: [
      {
        titulo: "Preço inválido",
        descricao:
          "O valor precisa ser maior que zero. Confira se o número foi digitado corretamente sem vírgulas inválidas ou campos vazios.",
      },
      {
        titulo: "Categoria obrigatória",
        descricao:
          "Alguns anúncios exigem selecionar uma categoria para ficar visível para os compradores corretos.",
      },
      {
        titulo: "Imagem não carregou",
        descricao:
          "A imagem pode estar em um formato incompatível ou ter tamanho muito grande. Use um arquivo comum e tente novamente.",
      },
    ],
  },
  {
    id: "editar-produto",
    titulo: "Editar Produto",
    resumo:
      "Atualize informações de um anúncio já publicado sem precisar criar outro.",
    rota: "/conta",
    icone: ShoppingBag,
    passos: [
      "Acesse sua conta em /conta e localize a área de anúncios ou produtos cadastrados.",
      "Abra o produto desejado e edite os campos que precisam de ajuste, como preço, descrição, estoque e fotos.",
      "Salve as mudanças e confirme na lista que o anúncio foi atualizado.",
    ],
    erros: [
      {
        titulo: "O anúncio não aparece para edição",
        descricao:
          "Isso costuma acontecer quando o produto não pertence à sua conta ou quando a sessão expirou. Faça login novamente e tente outra vez.",
      },
    ],
  },
  {
    id: "desativar-produto",
    titulo: "Desativar ou Ocultar",
    resumo: "Tire um anúncio do ar sem apagá-lo permanentemente.",
    rota: "/conta",
    icone: ShieldCheck,
    passos: [
      "No painel da conta, entre na área dos seus anúncios.",
      "Escolha o produto que deve ficar invisível para os compradores e use a ação de desativar ou ocultar.",
      "Aguarde a confirmação e confira se o status mudou para inativo ou oculto.",
    ],
    erros: [
      {
        titulo: "O anúncio continua visível",
        descricao:
          "Pode ser necessário atualizar a página ou aguardar alguns segundos para que o status seja refletido no catálogo.",
      },
    ],
  },
  {
    id: "carrinho",
    titulo: "Comprar",
    resumo:
      "Adicione itens ao carrinho, revise e faça a solicitação do pedido.",
    rota: "/produtos",
    icone: ShoppingCart,
    passos: [
      "Navegue até /produtos e abra um produto de interesse.",
      "Escolha a quantidade desejada e adicione ao carrinho.",
      "Abra /carrinho para revisar os itens, confirmar a compra e iniciar o pedido.",
    ],
    erros: [
      {
        titulo: "Não foi possível adicionar ao carrinho",
        descricao:
          "Isso pode acontecer se você não estiver autenticado ou se o produto não tiver estoque disponível. Faça login e tente novamente.",
      },
    ],
  },
  {
    id: "pedidos",
    titulo: "Acompanhar Pedidos",
    resumo: "Veja o status de cada pedido e entenda os próximos passos.",
    rota: "/pedidos",
    icone: ShoppingBag,
    passos: [
      "Acesse /pedidos para acompanhar todos os pedidos feitos na plataforma.",
      "Veja se o status está aguardando aprovação, aprovado, recusado ou concluído.",
      "Se estiver aguardando aprovação, o vendedor precisará analisar a solicitação antes de liberar o chat e o acesso ao produto.",
    ],
    erros: [
      {
        titulo: "O pedido não muda de status",
        descricao:
          "O vendedor precisa tomar uma decisão. Se o pedido estiver parado por muito tempo, entre em contato pelo chat ou pela central de ajuda.",
      },
    ],
  },
  {
    id: "chat",
    titulo: "Conversar por Chat",
    resumo:
      "Aborde o vendedor, o comprador ou o suporte com clareza e segurança.",
    rota: "/chat",
    icone: MessageCircle,
    passos: [
      "Abra o chat em /chat após iniciar uma negociação ou pedido.",
      "Mantenha as mensagens objetivas e confirme detalhes do produto, valor e forma de entrega.",
      "Nunca compartilhe dados sensíveis fora da plataforma e prefira combinar a transação em local seguro.",
    ],
    erros: [
      {
        titulo: "Não consigo abrir a conversa",
        descricao:
          "Isso normalmente acontece quando não há um pedido ou negociação ativa para esse contato. Verifique se a transação foi criada corretamente.",
      },
    ],
  },
];

const FAQ = [
  {
    pergunta: "Como crio uma conta no CampuShop?",
    resposta:
      "Acesse /cadastro, preencha os dados solicitados e confirme o cadastro. Se aparecer a mensagem de R.A. ou CPF inválido, revise os números e envie novamente.",
  },
  {
    pergunta: "Por que aparece “Digite um R.A. válido”?",
    resposta:
      "Esse aviso aparece quando o identificador acadêmico não está no formato esperado. Remova espaços, pontos ou letras extras e tente novamente.",
  },
  {
    pergunta: "Por que aparece “CPF inválido”?",
    resposta:
      "O CPF precisa ter 11 dígitos válidos. Confirme se o número foi digitado corretamente e sem caracteres adicionais.",
  },
  {
    pergunta: "Como anuncio um produto?",
    resposta:
      "Entre em /cadastrar-produto, preencha título, categoria, preço, descrição e fotos, revise e confirme o anúncio.",
  },
  {
    pergunta: "Como acompanho meu pedido?",
    resposta:
      "Acesse /pedidos para ver o status do pedido. Se estiver aguardando aprovação, o vendedor precisará analisar a solicitação.",
  },
  {
    pergunta: "O que fazer se o produto não aparece para edição?",
    resposta:
      "Verifique se o anúncio pertence à sua conta e se a sessão ainda está ativa. Faça login novamente e tente mais uma vez.",
  },
];

export function ManualUsuarioPage() {
  const [busca, setBusca] = useState("");
  const [abaAtiva, setAbaAtiva] = useState("todos");

  const itensFiltrados = useMemo(() => {
    const termo = busca.toLowerCase().trim();

    const lista = BLOCO_DE_ACOES.flatMap((bloco) =>
      bloco.itens.map((item) => ({ ...item, bloco: bloco.titulo })),
    );

    if (!termo) {
      if (abaAtiva === "todos") return lista;
      return lista.filter((item) =>
        item.bloco.toLowerCase().includes(abaAtiva),
      );
    }

    return lista.filter((item) => {
      const matchAba =
        abaAtiva === "todos" || item.bloco.toLowerCase().includes(abaAtiva);
      const matchTexto = `${item.titulo} ${item.descricao}`
        .toLowerCase()
        .includes(termo);
      return matchAba && matchTexto;
    });
  }, [abaAtiva, busca]);

  return (
    <Layout>
      <div className="mx-auto w-full max-w-6xl space-y-6">
        <header className="rounded-[2rem] border border-slate-200 bg-white p-8 shadow-sm">
          <div className="flex flex-col gap-8 lg:flex-row lg:items-start lg:justify-between">
            <div className="max-w-2xl">
              <div className="inline-flex items-center gap-2 rounded-full bg-orange-50 px-3 py-1 text-sm font-medium text-orange-700">
                <BookOpen className="h-4 w-4" />
                Central de ajuda
              </div>
              <h1 className="mt-4 text-3xl font-semibold tracking-tight text-slate-900 sm:text-4xl">
                Como usar o CampuShop
              </h1>
              <p className="mt-3 text-base leading-7 text-slate-600">
                Encontre os passos completos para navegar, comprar, vender,
                acompanhar pedidos e resolver problemas comuns no marketplace.
              </p>
            </div>

            <div className="w-full max-w-md rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 shadow-sm">
              <label
                className="flex items-center gap-2 text-sm text-slate-500"
                htmlFor="buscar-manual"
              >
                <Search className="h-4 w-4" />
                Buscar no manual
              </label>
              <input
                id="buscar-manual"
                value={busca}
                onChange={(evento) => setBusca(evento.target.value)}
                placeholder="Ex.: pedidos, conta, anunciar"
                className="mt-2 w-full border-none bg-transparent text-sm text-slate-700 outline-none placeholder:text-slate-400"
              />
            </div>
          </div>
        </header>

        <section className="rounded-[2rem] border border-slate-200 bg-white p-8 shadow-sm">
          <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <p className="text-sm font-semibold uppercase tracking-[0.2em] text-slate-400">
                Guia rápido
              </p>
              <h2 className="mt-1 text-2xl font-semibold text-slate-900">
                Acesse o que você precisa
              </h2>
            </div>
            <p className="text-sm text-slate-500">
              Clique em qualquer card para ir direto para a página.
            </p>
          </div>

          <div className="mt-6 flex flex-wrap gap-2">
            {[
              { valor: "todos", rotulo: "Todos" },
              { valor: "comece", rotulo: "Comece aqui" },
              { valor: "gerenciar", rotulo: "Gerenciar" },
              { valor: "informações", rotulo: "Mais informações" },
            ].map((aba) => (
              <button
                key={aba.valor}
                onClick={() => setAbaAtiva(aba.valor)}
                className={`rounded-full px-4 py-2 text-sm font-medium transition ${abaAtiva === aba.valor ? "bg-orange-600 text-white" : "bg-slate-100 text-slate-700 hover:bg-slate-200"}`}
              >
                {aba.rotulo}
              </button>
            ))}
          </div>

          <div className="mt-6 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            {itensFiltrados.map((item) => {
              const Icone = item.icone;

              return (
                <Link
                  key={`${item.rota}-${item.titulo}`}
                  to={item.rota}
                  className="group rounded-2xl border border-slate-200 bg-slate-50 p-5 transition hover:-translate-y-1 hover:border-orange-300 hover:bg-white"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-orange-100 text-orange-700">
                      <Icone className="h-5 w-5" />
                    </div>
                    <span className="text-xs font-medium uppercase tracking-[0.2em] text-slate-400">
                      {item.bloco}
                    </span>
                  </div>
                  <h3 className="mt-4 text-lg font-semibold text-slate-900">
                    {item.titulo}
                  </h3>
                  <p className="mt-2 text-sm leading-6 text-slate-600">
                    {item.descricao}
                  </p>
                  <div className="mt-4 inline-flex items-center gap-2 text-sm font-medium text-orange-600">
                    Abrir página
                    <span className="transition group-hover:translate-x-1">
                      →
                    </span>
                  </div>
                </Link>
              );
            })}
          </div>

          {itensFiltrados.length === 0 && (
            <div className="mt-6 rounded-2xl border border-dashed border-slate-200 bg-slate-50 p-6 text-sm text-slate-500">
              Nenhum resultado encontrado para essa busca. Tente palavras como
              "pedidos", "conta" ou "anunciar".
            </div>
          )}
        </section>

        <section className="rounded-[2rem] border border-slate-200 bg-white p-8 shadow-sm">
          <div className="flex items-center gap-2">
            <HelpCircle className="h-5 w-5 text-blue-600" />
            <h2 className="text-2xl font-semibold text-slate-900">
              Perguntas frequentes
            </h2>
          </div>
          <div className="mt-5 space-y-3">
            {FAQ.map((item) => (
              <details
                key={item.pergunta}
                className="rounded-2xl border border-slate-200 bg-slate-50 p-4"
              >
                <summary className="cursor-pointer text-sm font-semibold text-slate-900">
                  {item.pergunta}
                </summary>
                <p className="mt-2 text-sm leading-6 text-slate-600">
                  {item.resposta}
                </p>
              </details>
            ))}
          </div>
        </section>

        <section className="rounded-[2rem] border border-slate-200 bg-white p-8 shadow-sm">
          <div className="flex items-center gap-2">
            <BadgeInfo className="h-5 w-5 text-blue-600" />
            <h2 className="text-2xl font-semibold text-slate-900">
              Passo a passo completo
            </h2>
          </div>
          <p className="mt-3 text-sm leading-7 text-slate-600">
            Cada bloco abaixo reúne o fluxo principal, os passos para chegar na
            tela certa e as mensagens de erro mais comuns com a explicação do
            motivo.
          </p>

          <div className="mt-8 space-y-4">
            {GUIA_DE_PASSOS.map((item) => {
              const Icone = item.icone;

              return (
                <details
                  key={item.id}
                  className="rounded-2xl border border-slate-200 bg-slate-50 p-5"
                >
                  <summary className="flex cursor-pointer list-none items-start justify-between gap-4">
                    <div className="flex items-start gap-3">
                      <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-orange-100 text-orange-700">
                        <Icone className="h-5 w-5" />
                      </div>
                      <div>
                        <h3 className="text-lg font-semibold text-slate-900">
                          {item.titulo}
                        </h3>
                        <p className="mt-1 text-sm leading-6 text-slate-600">
                          {item.resumo}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 text-sm font-medium text-orange-600">
                      Ver detalhes
                      <ArrowRight className="h-4 w-4" />
                    </div>
                  </summary>

                  <div className="mt-5 grid gap-6 lg:grid-cols-[1.1fr_0.9fr]">
                    <div>
                      <div className="flex items-center gap-2 text-sm font-semibold uppercase tracking-[0.2em] text-slate-400">
                        <CheckCircle2 className="h-4 w-4 text-emerald-600" />
                        Passos para chegar até lá
                      </div>
                      <ol className="mt-3 space-y-3">
                        {item.passos.map((passo, index) => (
                          <li
                            key={`${item.id}-${index}`}
                            className="flex gap-3 rounded-2xl border border-slate-200 bg-white p-3 text-sm leading-6 text-slate-700"
                          >
                            <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-orange-100 text-xs font-semibold text-orange-700">
                              {index + 1}
                            </span>
                            <span>{passo}</span>
                          </li>
                        ))}
                      </ol>
                    </div>

                    <div>
                      <div className="flex items-center gap-2 text-sm font-semibold uppercase tracking-[0.2em] text-slate-400">
                        <CircleAlert className="h-4 w-4 text-amber-600" />
                        Erros comuns e por que acontecem
                      </div>
                      <div className="mt-3 space-y-3">
                        {item.erros.map((erro) => (
                          <div
                            key={erro.titulo}
                            className="rounded-2xl border border-amber-200 bg-amber-50 p-3"
                          >
                            <p className="text-sm font-semibold text-slate-900">
                              {erro.titulo}
                            </p>
                            <p className="mt-1 text-sm leading-6 text-slate-600">
                              {erro.descricao}
                            </p>
                          </div>
                        ))}
                      </div>

                      <div className="mt-4 rounded-2xl border border-blue-200 bg-blue-50 p-3 text-sm text-slate-700">
                        <div className="flex items-center gap-2 font-semibold text-slate-900">
                          <ArrowRight className="h-4 w-4 text-blue-600" />
                          Acesso rápido
                        </div>
                        <p className="mt-2">
                          Abra esta função diretamente em{" "}
                          <Link
                            to={item.rota}
                            className="font-semibold text-blue-700"
                          >
                            {item.rota}
                          </Link>
                          .
                        </p>
                      </div>
                    </div>
                  </div>
                </details>
              );
            })}
          </div>
        </section>

        <div className="grid gap-6 lg:grid-cols-[1.2fr_0.8fr]">
          <section className="rounded-[2rem] border border-slate-200 bg-white p-8 shadow-sm">
            <div className="flex items-center gap-2">
              <Sparkles className="h-5 w-5 text-orange-500" />
              <h2 className="text-2xl font-semibold text-slate-900">
                Dicas importantes
              </h2>
            </div>
            <div className="mt-5 space-y-3 text-sm leading-7 text-slate-600">
              <div className="flex gap-3 rounded-2xl border border-slate-200 bg-slate-50 p-4">
                <AlertTriangle className="mt-0.5 h-5 w-5 shrink-0 text-amber-600" />
                <span>
                  Confirme sempre se o produto, o preço e a forma de entrega
                  estão corretos antes de fechar a negociação.
                </span>
              </div>
              <div className="flex gap-3 rounded-2xl border border-slate-200 bg-slate-50 p-4">
                <ShieldCheck className="mt-0.5 h-5 w-5 shrink-0 text-emerald-600" />
                <span>
                  Combine a compra em locais seguros e prefira a comunicação
                  dentro da plataforma para manter o registro das conversas.
                </span>
              </div>
              <div className="flex gap-3 rounded-2xl border border-slate-200 bg-slate-50 p-4">
                <BadgeInfo className="mt-0.5 h-5 w-5 shrink-0 text-blue-600" />
                <span>
                  O sistema usa o seu identificador acadêmico como referência
                  interna. Alterar a URL do navegador não dá acesso a outra
                  conta.
                </span>
              </div>
            </div>
          </section>

          <aside className="space-y-6">
            <div className="rounded-[2rem] border border-slate-200 bg-white p-8 shadow-sm">
              <div className="flex items-center gap-2">
                <HelpCircle className="h-5 w-5 text-blue-600" />
                <h3 className="text-xl font-semibold text-slate-900">
                  Precisa de ajuda?
                </h3>
              </div>
              <p className="mt-3 text-sm leading-6 text-slate-600">
                Use a central de ajuda para tirar dúvidas, ou abra o chat para
                falar com o suporte.
              </p>
              <div className="mt-4 space-y-3">
                <Link
                  to="/ajuda"
                  className="flex items-center justify-between rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm font-medium text-slate-700 transition hover:border-blue-300 hover:bg-white"
                >
                  Ir para a central de ajuda
                  <span className="text-blue-600">→</span>
                </Link>
                <Link
                  to="/chat"
                  className="flex items-center justify-between rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm font-medium text-slate-700 transition hover:border-blue-300 hover:bg-white"
                >
                  Abrir chat
                  <span className="text-blue-600">→</span>
                </Link>
              </div>
            </div>

            <div className="rounded-[2rem] border border-slate-200 bg-gradient-to-br from-orange-500 to-blue-600 p-8 text-white shadow-sm">
              <p className="text-sm font-semibold uppercase tracking-[0.2em] text-white/80">
                Resumo rápido
              </p>
              <h3 className="mt-2 text-xl font-semibold">
                Comece pelo catálogo
              </h3>
              <p className="mt-3 text-sm leading-6 text-white/80">
                A maior parte das ações começa em explorar produtos, fazer login
                e anunciar um item.
              </p>
              <Link
                to="/produtos"
                className="mt-5 inline-flex items-center gap-2 rounded-full bg-white px-4 py-2 text-sm font-semibold text-blue-700"
              >
                Ver produtos
                <span>→</span>
              </Link>
            </div>
          </aside>
        </div>
      </div>
    </Layout>
  );
}
