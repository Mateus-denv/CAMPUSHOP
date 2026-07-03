import { Layout } from "@/components/Layout";
import { MediaImage } from "@/components/MediaImage";
import { PlanBadge } from "@/components/PlanBadge";
import { contaAPI, pedidosAPI, produtoAPI, subscriptionAPI, usuarioAPI, type ContaMetricasAPI, type PedidoAPI, type SubscriptionAPI } from "@/lib/api-service";
import { buildUserPhotoUrl } from "@/lib/image-utils";
import { getFavoriteProducts, toggleFavorite } from "@/lib/shop-storage";
import { useAuthStore } from "@/store";
import { Crown, Lock, Sparkles } from "lucide-react";
import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";

type UsuarioProduto = {
  idProduto: number;
  nomeProduto: string;
  descricao: string;
  estoque: number;
  preco?: number;
  status?: string;
  visivelParaComprador?: boolean;
  categoria?: {
    idCategoria: number;
    nome_categoria: string;
  };
};

type FavoritoProduto = {
  id: number;
  nome: string;
  descricao: string;
  preco: number;
  estoque: number;
  categoria?: string;
};

const tabs = [
  "Visão Geral",
  "Meus Produtos",
  "Compras",
  "Pedidos recebidos",
  "Favoritos",
  "Editar Perfil",
  "Configurações",
];

function statusBadgeClasses(status: PedidoAPI['status']) {
  if (status === 'em analise') {
    return 'bg-orange-100 text-orange-700 border-orange-200';
  }

  if (status === 'aceito') {
    return 'bg-emerald-100 text-emerald-700 border-emerald-200';
  }

  if (status === 'rejeitado' || status === 'invalido') {
    return 'bg-red-100 text-red-700 border-red-200';
  }

  if (status === 'entregue') {
    return 'bg-blue-100 text-blue-700 border-blue-200';
  }

  return 'bg-orange-100 text-orange-700 border-orange-200';
}

function statusProdutoClasses(status?: string) {
  const valor = (status || 'ATIVO').toUpperCase();

  if (valor === 'ATIVO') {
    return 'border-emerald-200 bg-emerald-100 text-emerald-700';
  }

  if (valor === 'INATIVO') {
    return 'border-slate-200 bg-slate-100 text-slate-600';
  }

  if (valor === 'FORA_DE_ESTOQUE') {
    return 'border-orange-200 bg-orange-100 text-orange-700';
  }

  return 'border-blue-200 bg-blue-100 text-blue-700';
}

function montarAvisoPrazo(pedido: PedidoAPI) {
  if (pedido.status !== 'aceito' || !pedido.prazoEntregaLimite) {
    return null;
  }

  const prazo = new Date(pedido.prazoEntregaLimite);
  const agora = new Date();
  const diferencaMs = prazo.getTime() - agora.getTime();
  const diasRestantes = Math.ceil(diferencaMs / (1000 * 60 * 60 * 24));

  if (diferencaMs < 0) {
    return `Prazo expirado em ${prazo.toLocaleDateString('pt-BR')}. Pedido será invalidado.`;
  }

  if (diasRestantes <= 1) {
    return `Entrega vence hoje (${prazo.toLocaleDateString('pt-BR')}).`;
  }

  if (diasRestantes <= 2) {
    return `Faltam ${diasRestantes} dias para o prazo de entrega (${prazo.toLocaleDateString('pt-BR')}).`;
  }

  return null;
}

function formatarMoeda(valor: number) {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  }).format(valor)
}

function formatarDataHora(data?: string | null) {
  if (!data) {
    return 'Sem data'
  }

  return new Date(data).toLocaleString('pt-BR', {
    dateStyle: 'short',
    timeStyle: 'short',
  })
}

export function ContaPage() {
  const navigate = useNavigate();
  const [aba, setAba] = useState("Visão Geral");
  const [produtos, setProdutos] = useState<UsuarioProduto[]>([]);
  const [favoritos, setFavoritos] = useState<FavoritoProduto[]>([]);
  const [pedidosCompras, setPedidosCompras] = useState<PedidoAPI[]>([]);
  const [pedidosRecebidos, setPedidosRecebidos] = useState<PedidoAPI[]>([]);
  const [metricas, setMetricas] = useState<ContaMetricasAPI | null>(null);
  const [pedidoEmProcesso, setPedidoEmProcesso] = useState<number | null>(null);
  const { usuario, setUsuario } = useAuthStore();
  const [mensagemConfig, setMensagemConfig] = useState("");
  const [erroConfig, setErroConfig] = useState("");
  const [excluindoConta, setExcluindoConta] = useState(false);
  const [produtoEmProcesso, setProdutoEmProcesso] = useState<number | null>(null);
  const [mensagemProdutos, setMensagemProdutos] = useState("");
  const [erroProdutos, setErroProdutos] = useState("");
  const [assinatura, setAssinatura] = useState<SubscriptionAPI | null>(null);
  const [acaoPlano, setAcaoPlano] = useState(false);

  useEffect(() => {
    if (aba === "Meus Produtos") {
      carregarMeusProdutos();
    }

    if (aba === "Favoritos") {
      setFavoritos(getFavoriteProducts());
    }
  }, [aba]);

  useEffect(() => {
    const carregarPedidos = async () => {
      try {
        const [metricasResponse, comprasResponse, recebidosResponse] = await Promise.all([
          contaAPI.metricas(),
          pedidosAPI.meus(),
          pedidosAPI.recebidos(),
        ]);

        setMetricas(metricasResponse.data ?? null);
        setPedidosCompras(comprasResponse.data ?? []);
        setPedidosRecebidos(recebidosResponse.data ?? []);
      } catch (error) {
        console.error("Erro ao carregar pedidos:", error);
      }
    };

    carregarPedidos();
  }, [usuario]);

  useEffect(() => {
    const carregarAssinatura = async () => {
      if (!usuario) {
        setAssinatura(null);
        return;
      }

      try {
        const response = await subscriptionAPI.current();
        setAssinatura(response.data ?? null);
      } catch (error) {
        console.error("Erro ao carregar assinatura:", error);
        setAssinatura({ plan: 'ESSENTIAL', planName: 'Essencial', badgeText: 'ESSENCIAL' });
      }
    };

    carregarAssinatura();
  }, [usuario]);

  const carregarMeusProdutos = async () => {
    try {
      const response = await produtoAPI.listarMeus();
      setProdutos(response.data);
    } catch (error) {
      console.error("Erro ao carregar produtos:", error);
    }
  };

  const abrirEdicaoProduto = (produtoId: number) => {
    navigate(`/cadastrar-produto?produtoId=${produtoId}`);
  };

  // Remove um produto dos favoritos usando a função compartilhada de toggle
  // A lógica reutiliza `toggleFavorite` que já trata de adicionar/remover
  // do storage local; após a operação atualizamos o estado local.
  const removerFavorito = (produtoId: number) => {
    try {
      // Encontramos o snapshot do produto nos favoritos atuais
      const produtoSnapshot = favoritos.find((f) => f.id === produtoId);
      if (!produtoSnapshot) return;

      // toggleFavorite retorna false quando removeu, true quando adicionou
      toggleFavorite({
        id: produtoSnapshot.id,
        nome: produtoSnapshot.nome,
        descricao: produtoSnapshot.descricao,
        preco: produtoSnapshot.preco,
        estoque: produtoSnapshot.estoque,
        categoria: produtoSnapshot.categoria,
      });

      // Recarrega os favoritos do storage para manter consistência
      setFavoritos(getFavoriteProducts());
    } catch (err) {
      console.error('Erro ao remover favorito:', err);
    }
  };

  const alternarStatusProduto = async (produto: UsuarioProduto) => {
    setProdutoEmProcesso(produto.idProduto);
    setErroProdutos("");
    setMensagemProdutos("");

    const novoStatus = (produto.status || 'ATIVO').toUpperCase() === 'ATIVO' ? 'INATIVO' : 'ATIVO';

    try {
      await produtoAPI.atualizarStatus(produto.idProduto, novoStatus);
      await carregarMeusProdutos();
      setMensagemProdutos(novoStatus === 'ATIVO' ? 'Produto reativado com sucesso.' : 'Produto desativado com sucesso.');
    } catch (error: any) {
      setErroProdutos(error?.response?.data?.message || 'Não foi possível atualizar o status do produto.');
    } finally {
      setProdutoEmProcesso(null);
    }
  };

  const alternarVisibilidadeProduto = async (produto: UsuarioProduto) => {
    setProdutoEmProcesso(produto.idProduto);
    setErroProdutos("");
    setMensagemProdutos("");

    const novoValor = !produto.visivelParaComprador;

    try {
      await produtoAPI.atualizarVisibilidade(produto.idProduto, novoValor);
      await carregarMeusProdutos();
      setMensagemProdutos(novoValor ? 'Produto exibido novamente para compradores.' : 'Produto ocultado dos compradores.');
    } catch (error: any) {
      setErroProdutos(error?.response?.data?.message || 'Não foi possível atualizar a visibilidade do produto.');
    } finally {
      setProdutoEmProcesso(null);
    }
  };

  const atualizarStatusPedido = async (pedidoId: number, novoStatus: PedidoAPI['status'], codigoAcesso?: string) => {
    setPedidoEmProcesso(pedidoId);

    try {
      await pedidosAPI.atualizarStatus(pedidoId, novoStatus, codigoAcesso);

      const [comprasResponse, recebidosResponse] = await Promise.all([
        pedidosAPI.meus(),
        pedidosAPI.recebidos(),
      ]);

      setPedidosCompras(comprasResponse.data ?? []);
      setPedidosRecebidos(recebidosResponse.data ?? []);

      setMensagemConfig(
        novoStatus === 'aceito'
          ? 'Pedido aceito com sucesso.'
          : novoStatus === 'entregue'
            ? 'Entrega confirmada com sucesso.'
          : 'Pedido rejeitado com sucesso.'
      );
      window.dispatchEvent(new Event('campushop-orders-changed'));

      if (aba !== 'Pedidos recebidos') {
        setAba('Pedidos recebidos');
      }
    } catch (error: any) {
      setErroConfig(
        error?.response?.data?.message || 'Não foi possível atualizar o status do pedido.'
      );
    } finally {
      setPedidoEmProcesso(null);
    }
  };

  const solicitarEntregaPedido = async (pedidoId: number) => {
    // O código é pedido só no momento da entrega para validar a compra aprovada.
    const codigoAcesso = window.prompt('Informe o código de acesso do comprador para confirmar a entrega:');

    if (!codigoAcesso || !codigoAcesso.trim()) {
      setErroConfig('O código de acesso é obrigatório para concluir a entrega.');
      return;
    }

    await atualizarStatusPedido(pedidoId, 'entregue', codigoAcesso.trim());
  };

  const excluirConta = async () => {
    setErroConfig("");
    setMensagemConfig("");

    const confirmado = window.confirm(
      "Tem certeza que deseja excluir sua conta? Esta ação não pode ser desfeita.",
    );
    if (!confirmado) {
      return;
    }

    try {
      setExcluindoConta(true);
      const userId = Number((usuario as any)?.id);

      if (!userId || Number.isNaN(userId)) {
        throw new Error(
          "Não foi possível identificar o usuário logado para exclusão.",
        );
      }

      await usuarioAPI.excluir(userId);

      localStorage.removeItem("token");
      localStorage.removeItem("user");
      setUsuario(null);
      navigate("/login", { replace: true });
    } catch (error: any) {
      setErroConfig(
        error?.response?.data?.message ||
          error?.message ||
          "Erro ao excluir conta",
      );
    } finally {
      setExcluindoConta(false);
    }
  };

  const nome = usuario?.nomeCompleto || usuario?.nome || "Minha conta";
  const email = usuario?.email || "Email não informado";
  const ra = usuario?.ra ? `R.A ${usuario.ra}` : "R.A não informado";
  const pedidosPendentes = metricas?.pedidosPendentes ?? 0;
  const produtosAtivos = metricas?.produtosAtivos ?? 0;
  const produtosTotais = metricas?.produtosTotais ?? produtos.length;
  const vendasConcluidas = metricas?.vendasConcluidas ?? 0;
  const comprasConcluidas = metricas?.comprasConcluidas ?? 0;
  const faturamentoVendas = metricas?.faturamentoVendas ?? 0;
  const gastoCompras = metricas?.gastoCompras ?? 0;
  const ticketMedioVendas = metricas?.ticketMedioVendas ?? 0;
  const ticketMedioCompras = metricas?.ticketMedioCompras ?? 0;
  const atividadesRecentes = metricas?.atividadesRecentes ?? [];
  const planoAtual = assinatura?.plan ?? 'ESSENTIAL';
  const ehPlusOuPremium = planoAtual === 'PLUS' || planoAtual === 'PREMIUM';
  const ehPremium = planoAtual === 'PREMIUM';
  const favoritosTotais = favoritos.length;
  const avaliacoesRecebidas = metricas?.avaliacoesRecebidas ?? 0;
  const notaMediaRecebida = metricas?.notaMediaRecebida ?? 0;
  const avaliacoesPorPedido = vendasConcluidas > 0 ? (avaliacoesRecebidas / vendasConcluidas).toFixed(2) : '0.00';

  const atualizarPlano = async (acao: 'upgrade' | 'downgrade' | 'cancel' | 'renew', plan?: SubscriptionAPI['plan']) => {
    try {
      setAcaoPlano(true);
      if (acao === 'upgrade' && plan) {
        await subscriptionAPI.upgrade(plan);
      } else if (acao === 'downgrade') {
        await subscriptionAPI.downgrade();
      } else if (acao === 'cancel') {
        await subscriptionAPI.cancel();
      } else if (acao === 'renew') {
        await subscriptionAPI.renew();
      }

      const response = await subscriptionAPI.current();
      setAssinatura(response.data ?? null);
    } catch (error: any) {
      setMensagemConfig(error?.response?.data?.message || 'Não foi possível atualizar seu plano.');
    } finally {
      setAcaoPlano(false);
    }
  };

  const MetricCard = ({
    title,
    value,
    description,
    locked = false,
  }: {
    title: string;
    value: string | number;
    description: string;
    locked?: boolean;
  }) => (
    <div className={`relative overflow-hidden rounded-2xl border p-4 ${locked ? 'border-slate-200 bg-slate-100' : 'border-slate-200 bg-slate-50'}`}>
      {locked ? (
        <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 bg-white/75 p-4 text-center backdrop-blur-sm">
          <Lock className="h-6 w-6 text-slate-500" />
          <p className="text-sm font-semibold text-slate-700">Disponível apenas no Plano Plus.</p>
          <button
            type="button"
            onClick={() => atualizarPlano('upgrade', 'PLUS')}
            className="rounded-full bg-slate-900 px-4 py-2 text-xs font-semibold text-white"
            disabled={acaoPlano}
          >
            Fazer Upgrade
          </button>
        </div>
      ) : null}
      <p className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-400">{title}</p>
      <p className="mt-2 text-3xl font-black text-slate-900">{value}</p>
      <p className="mt-1 text-sm text-slate-500">{description}</p>
    </div>
  );

  return (
    <Layout>
      <section className="rounded-[2rem] border border-slate-200 bg-white p-4 shadow-sm sm:p-6">
        <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
          <aside className="rounded-[1.75rem] border border-blue-100 bg-gradient-to-br from-blue-50 to-white p-5 shadow-sm">
            <div className="mx-auto h-20 w-20 overflow-hidden rounded-full border border-slate-200 bg-slate-50">
              <MediaImage
                src={buildUserPhotoUrl(usuario?.id)}
                alt={nome}
                fallbackLabel="Sem foto"
                className="h-20 w-20 rounded-full"
                imageClassName="h-20 w-20 rounded-full"
              />
            </div>
            <h2 className="mt-4 text-center text-2xl font-black tracking-tight text-slate-900">
              {nome}
            </h2>
            <p className="mt-2 text-center text-sm text-slate-500">{email}</p>
            <p className="text-center text-sm text-slate-500">{ra}</p>
            {/* Removemos indicadores sem regra de negócio consolidada para evitar dados fictícios no painel. */}
            <div className="mt-3 flex justify-center">
              <PlanBadge
                text={assinatura?.badgeText || assinatura?.planName || 'ESSENCIAL'}
                color={assinatura?.badgeColor}
                icon={assinatura?.badgeIcon}
              />
            </div>
            <div className="mt-5 rounded-2xl border border-blue-100 bg-white p-4 text-sm text-slate-600">
              Os indicadores de desempenho serão exibidos quando as métricas reais estiverem disponíveis.
            <div className="mt-4 rounded-2xl border border-slate-200 bg-white p-4">
              <p className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-400">Seu plano</p>
              <div className="mt-2 flex items-center gap-2 text-sm font-semibold text-slate-700">
                <Crown className="h-4 w-4 text-amber-500" />
                <span>{assinatura?.planName || 'Essencial'}</span>
              </div>
              <p className="mt-2 text-sm text-slate-500">
                {ehPremium
                  ? 'Você tem acesso ao painel completo e ao selo Premium.'
                  : ehPlusOuPremium
                    ? 'Você já liberou as métricas básicas e os destaques da busca.'
                    : 'Faça upgrade para liberar mais métricas e aumentar sua visibilidade.'}
              </p>
              <div className="mt-4 flex flex-col gap-2">
                {planoAtual === 'ESSENTIAL' ? (
                  <>
                    <button
                      type="button"
                      onClick={() => atualizarPlano('upgrade', 'PLUS')}
                      className="rounded-2xl bg-slate-900 px-4 py-3 text-sm font-semibold text-white transition hover:bg-slate-800 disabled:opacity-70"
                      disabled={acaoPlano}
                    >
                      Fazer upgrade para Plus
                    </button>
                    <button
                      type="button"
                      onClick={() => atualizarPlano('upgrade', 'PREMIUM')}
                      className="rounded-2xl bg-amber-500 px-4 py-3 text-sm font-semibold text-white transition hover:bg-amber-600 disabled:opacity-70"
                      disabled={acaoPlano}
                    >
                      Evoluir direto para Premium
                    </button>
                  </>
                ) : null}
                {planoAtual === 'PLUS' ? (
                  <button
                    type="button"
                    onClick={() => atualizarPlano('upgrade', 'PREMIUM')}
                    className="rounded-2xl bg-amber-500 px-4 py-3 text-sm font-semibold text-white transition hover:bg-amber-600 disabled:opacity-70"
                    disabled={acaoPlano}
                  >
                    Evoluir para Premium
                  </button>
                ) : null}
                {planoAtual === 'PREMIUM' ? (
                  <button
                    type="button"
                    onClick={() => atualizarPlano('downgrade')}
                    className="rounded-2xl bg-blue-600 px-4 py-3 text-sm font-semibold text-white transition hover:bg-blue-700 disabled:opacity-70"
                    disabled={acaoPlano}
                  >
                    Voltar para Plus
                  </button>
                ) : null}
                <button
                  type="button"
                  onClick={() => atualizarPlano('cancel')}
                  className="rounded-2xl border border-slate-200 px-4 py-3 text-sm font-semibold text-slate-700 transition hover:bg-slate-50 disabled:opacity-70"
                  disabled={acaoPlano || planoAtual === 'ESSENTIAL'}
                >
                  Cancelar assinatura
                </button>
              </div>
            </div>
            </div>
            <a
              href="/cadastrar-produto"
              className="mt-5 block w-full rounded-2xl bg-gradient-to-r from-blue-600 to-indigo-700 py-3 text-center font-semibold text-white shadow-lg shadow-blue-600/20"
            >
              + Anunciar produto
            </a>
            <button
              onClick={() => navigate("/conta/editar")}
              className="mt-3 w-full rounded-2xl border border-slate-200 py-3 font-semibold text-slate-700 transition hover:bg-slate-50"
            >
              Editar conta
            </button>
            <button
              onClick={() => setAba("Configurações")}
              className="mt-3 w-full rounded-2xl border border-slate-200 py-3 font-semibold text-slate-700 transition hover:bg-slate-50"
            >
              Configurações da conta
            </button>
          </aside>

          <main className="lg:col-span-2">
            <div className="flex flex-wrap gap-2 rounded-[1.5rem] border border-slate-200 bg-slate-50 p-2 text-sm font-semibold">
              {tabs.map((item) => (
                <button
                  key={item}
                  onClick={() => setAba(item)}
                  className={`rounded-2xl px-4 py-2.5 transition ${aba === item ? "bg-slate-900 text-white" : "text-slate-500 hover:bg-white hover:text-slate-900"}`}
                >
                  <span className="inline-flex items-center gap-2">
                    {item}
                    {item === 'Pedidos recebidos' && pedidosPendentes > 0 ? (
                      <span className="rounded-full bg-orange-100 px-2 py-0.5 text-[11px] font-bold text-orange-700">
                        {pedidosPendentes}
                      </span>
                    ) : null}
                  </span>
                </button>
              ))}
            </div>

            {aba === "Visão Geral" ? (
              <div className="mt-3 space-y-4 rounded-[1.5rem] border border-slate-200 bg-white p-4 shadow-sm sm:p-5">
                <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-[0.22em] text-slate-400">Visão geral</p>
                    <h3 className="mt-2 text-2xl font-black tracking-tight text-slate-900 sm:text-3xl">
                      {ehPlusOuPremium ? 'Métricas da sua conta' : 'Métricas essenciais da sua conta'}
                    </h3>
                    <p className="mt-2 max-w-2xl text-sm text-slate-500">
                      {ehPlusOuPremium
                        ? 'Resumo liberado pelo seu plano com métricas do negócio e atividade recente.'
                        : 'Mostramos apenas o que o seu plano Essencial libera no momento.'}
                    </p>
                  </div>
                </div>

                <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
                  <MetricCard title="Produtos ativos" value={produtosAtivos} description={`${produtosTotais} anúncios no total`} />
                  <MetricCard title="Compras concluídas" value={comprasConcluidas} description={`${favoritosTotais} favoritos salvos`} />
                  <MetricCard title="Pedidos recebidos" value={pedidosRecebidos.length} description={`${pedidosPendentes} em andamento`} />
                  <MetricCard title="Pedidos em andamento" value={pedidosPendentes} description="Aguardando sua ação" />
                </div>

                <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
                  <MetricCard title="Vendas concluídas" value={vendasConcluidas} description={formatarMoeda(faturamentoVendas)} locked={!ehPlusOuPremium} />
                  <MetricCard title="Ticket médio vendas" value={formatarMoeda(ticketMedioVendas)} description="Baseado nas vendas entregues" locked={!ehPlusOuPremium} />
                  <MetricCard title="Média de avaliações" value={notaMediaRecebida.toFixed(1)} description="Recebidas pelos seus produtos" locked={!ehPlusOuPremium} />
                  <MetricCard title="Avaliações recebidas" value={avaliacoesRecebidas} description={`${avaliacoesPorPedido} por pedido`} locked={!ehPlusOuPremium} />
                </div>

                <div className="grid gap-3 lg:grid-cols-2">
                  <MetricCard title="Atividade recente" value={atividadesRecentes.length} description="Últimos pedidos e movimentações" locked={!ehPlusOuPremium} />
                  <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
                    <p className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-400">Seu acesso</p>
                    <p className="mt-2 text-2xl font-black text-slate-900">{assinatura?.planName || 'Essencial'}</p>
                    <p className="mt-1 text-sm text-slate-500">
                      {ehPremium
                        ? 'Selo Premium e acesso total à experiência visual.'
                        : ehPlusOuPremium
                          ? 'Métricas básicas e destaque na interface liberados.'
                          : 'Cards bloqueados permanecem visíveis para incentivar o upgrade.'}
                    </p>
                    <div className="mt-4 flex flex-wrap gap-2">
                      <span className="inline-flex items-center gap-2 rounded-full bg-slate-900 px-3 py-1 text-xs font-semibold text-white">
                        <Sparkles className="h-3.5 w-3.5" />
                        {ehPremium ? 'Premium' : ehPlusOuPremium ? 'Plus' : 'Essencial'}
                      </span>
                      <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-600">
                        {assinatura?.remainingListings === -1 ? 'Anúncios ilimitados' : `${assinatura?.remainingListings ?? 0} anúncios restantes`}
                      </span>
                    </div>
                    <div className="mt-4 rounded-2xl border border-slate-200 bg-slate-50 p-4 text-sm text-slate-700">
                      <p className="font-semibold text-slate-900">Selo de vendedor</p>
                      <p className="mt-2 text-sm text-slate-600">{avaliacoesRecebidas} avaliação{avaliacoesRecebidas === 1 ? '' : 'ões'} recebida{avaliacoesRecebidas === 1 ? '' : 's'}</p>
                      <p className="mt-1 text-lg font-black text-slate-900">{notaMediaRecebida.toFixed(1)} / 10</p>
                      <p className="mt-1 text-xs text-slate-500">Média geral do perfil</p>
                    </div>
                  </div>
                </div>

                <div className="rounded-2xl border border-slate-200 bg-white p-4">
                  <div className="flex items-center justify-between gap-3">
                    <div>
                      <p className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-400">Atividade recente</p>
                      <p className="mt-1 text-sm text-slate-500">Últimos pedidos e movimentações na conta.</p>
                    </div>
                  </div>

                  {atividadesRecentes.length === 0 ? (
                    <div className="mt-4 rounded-2xl border border-dashed border-slate-300 bg-slate-50 p-5 text-sm text-slate-500">
                      Ainda não há atividades suficientes para exibir aqui.
                    </div>
                  ) : (
                    <div className="mt-4 space-y-3">
                      {atividadesRecentes.map((pedido) => (
                        <div key={pedido.id} className="flex flex-col gap-2 rounded-2xl border border-slate-200 p-4 sm:flex-row sm:items-center sm:justify-between">
                          <div>
                            <p className="font-semibold text-slate-900">Pedido #{pedido.id} • {pedido.tipo}</p>
                            <p className="text-sm text-slate-500">
                              {pedido.participante || 'Movimentação da conta'}
                            </p>
                          </div>
                          <div className="text-left sm:text-right">
                            <p className="text-sm font-semibold text-slate-900">{formatarMoeda(Number(pedido.total || 0))}</p>
                            <p className="text-xs text-slate-500">{pedido.status} • {formatarDataHora(pedido.data)}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            ) : aba === "Meus Produtos" ? (
              <div className="mt-3 rounded-[1.5rem] border border-slate-200 p-5 shadow-sm">
                <h3 className="text-2xl font-black tracking-tight text-slate-900 sm:text-3xl">
                  Meus produtos
                </h3>
                <p className="mt-1 text-slate-500">
                  Gerencie os produtos que você anunciou.
                </p>
                {mensagemProdutos ? (
                  <div className="mt-4 rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm font-medium text-emerald-700">
                    {mensagemProdutos}
                  </div>
                ) : null}
                {erroProdutos ? (
                  <div className="mt-4 rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-medium text-red-700">
                    {erroProdutos}
                  </div>
                ) : null}
                {produtos.length === 0 ? (
                  <div className="mt-4 text-center">
                    <p className="text-slate-500">
                      Você ainda não anunciou nenhum produto.
                    </p>
                    <Link
                      to="/cadastrar-produto"
                      className="mt-4 inline-block rounded-2xl bg-blue-600 px-6 py-3 font-semibold text-white"
                    >
                      Anunciar primeiro produto
                    </Link>
                  </div>
                ) : (
                  <div className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-2">
                    {/* Ajuste: mostrar 2 produtos por linha na listagem de "Meus produtos" */}
                    {produtos.map((produto) => (
                      <div
                        key={produto.idProduto}
                        className="flex h-full flex-col rounded-2xl border border-slate-200 p-4 shadow-sm"
                      >
                        <div className="flex items-start justify-between gap-3">
                          <h4 className="font-bold text-slate-900">
                            {produto.nomeProduto}
                          </h4>
                          <span className={`inline-flex rounded-full border px-2.5 py-1 text-[11px] font-semibold uppercase tracking-[0.12em] ${statusProdutoClasses(produto.status)}`}>
                            {(produto.status || 'ATIVO').replace('_', ' ')}
                          </span>
                        </div>
                        <p className="mt-2 text-sm text-slate-600">
                          {produto.descricao}
                        </p>
                        <p className="mt-2 font-semibold text-blue-600">
                          R$ {produto.preco?.toFixed(2)}
                        </p>
                        <div className="mt-2 flex flex-wrap gap-2 text-xs font-semibold">
                          <span className={`rounded-full border px-2.5 py-1 ${produto.visivelParaComprador === false ? 'border-amber-200 bg-amber-50 text-amber-700' : 'border-emerald-200 bg-emerald-50 text-emerald-700'}`}>
                            {produto.visivelParaComprador === false ? 'Oculto dos compradores' : 'Visível para compradores'}
                          </span>
                          <span className="rounded-full border border-slate-200 bg-slate-50 px-2.5 py-1 text-slate-600">
                            Estoque: {produto.estoque}
                          </span>
                        </div>
                        <div className="mt-4 grid gap-2">
                          <button
                            type="button"
                            onClick={() => abrirEdicaoProduto(produto.idProduto)}
                            className="rounded-2xl border border-slate-200 px-4 py-3 font-semibold text-slate-700 transition hover:bg-slate-50"
                          >
                            Editar produto
                          </button>
                          <button
                            type="button"
                            disabled={produtoEmProcesso === produto.idProduto}
                            onClick={() => alternarStatusProduto(produto)}
                            className="rounded-2xl bg-slate-900 px-4 py-3 font-semibold text-white transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-60"
                          >
                            {produtoEmProcesso === produto.idProduto
                              ? 'Atualizando...'
                              : (produto.status || 'ATIVO').toUpperCase() === 'ATIVO'
                                ? 'Desativar produto'
                                : 'Ativar produto'}
                          </button>
                          <button
                            type="button"
                            disabled={produtoEmProcesso === produto.idProduto}
                            onClick={() => alternarVisibilidadeProduto(produto)}
                            className="rounded-2xl border border-blue-200 px-4 py-3 font-semibold text-blue-700 transition hover:bg-blue-50 disabled:cursor-not-allowed disabled:opacity-60"
                          >
                            {produtoEmProcesso === produto.idProduto
                              ? 'Aguarde...'
                              : produto.visivelParaComprador === false
                                ? 'Desocultar para compradores'
                                : 'Ocultar dos compradores'}
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            ) : aba === "Compras" ? (
              <div className="mt-3 rounded-[1.5rem] border border-slate-200 p-5 shadow-sm">
                <h3 className="text-2xl font-black tracking-tight text-slate-900 sm:text-3xl">
                  Minhas compras
                </h3>
                <p className="mt-1 text-slate-500">
                  Acompanhe os pedidos que você realizou.
                </p>
                {pedidosCompras.length === 0 ? (
                  <div className="mt-4 rounded-2xl border border-dashed border-slate-300 bg-slate-50 p-5 text-center text-slate-500">
                    Você ainda não possui pedidos registrados.
                  </div>
                ) : (
                  <div className="mt-4 space-y-3">
                    {pedidosCompras.map((pedido) => (
                      <div
                        key={pedido.id}
                        className="rounded-2xl border border-slate-200 p-4"
                      >
                        <p className="font-semibold text-slate-900">
                          Pedido {pedido.id}
                        </p>
                        <p className="text-sm text-slate-500">
                          {pedido.itens.length} itens • {pedido.chaveAcesso || 'Aguardando aprovação'}
                        </p>
                        <p className="mt-1 font-bold text-blue-700">
                          R$ {pedido.total.toFixed(2)}
                        </p>
                        <div className="mt-3 grid gap-2 text-sm text-slate-500 sm:grid-cols-3">
                          <p>Aprovado em: {pedido.aprovadoEm ? new Date(pedido.aprovadoEm).toLocaleString('pt-BR') : 'Aguardando'}</p>
                          <p>Prazo limite: {pedido.prazoEntregaLimite ? new Date(pedido.prazoEntregaLimite).toLocaleDateString('pt-BR') : 'Aguardando'}</p>
                          <p>Entregue em: {pedido.entregueEm ? new Date(pedido.entregueEm).toLocaleDateString('pt-BR') : 'Aguardando'}</p>
                        </div>
                        {pedido.status === 'aceito' && montarAvisoPrazo(pedido) ? (
                          <div className="mt-3 rounded-2xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm font-medium text-amber-700">
                            {montarAvisoPrazo(pedido)}
                          </div>
                        ) : null}
                        {pedido.status === 'invalido' ? (
                          <div className="mt-3 rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-medium text-red-700">
                            Pedido invalidado: {pedido.motivoRejeicao || 'Prazo de entrega expirado'}.
                          </div>
                        ) : null}
                        <p className={`mt-2 inline-flex rounded-full border px-2.5 py-1 text-xs font-semibold ${statusBadgeClasses(pedido.status)}`}>
                          {pedido.status}
                        </p>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            ) : aba === "Pedidos recebidos" ? (
              <div className="mt-3 rounded-[1.5rem] border border-slate-200 p-5 shadow-sm">
                <h3 className="text-2xl font-black tracking-tight text-slate-900 sm:text-3xl">
                  Pedidos recebidos
                </h3>
                <p className="mt-1 text-slate-500">
                  Analise os pedidos abertos para liberar a negociação com o comprador.
                </p>

                <div className="mt-6 grid gap-3 sm:grid-cols-2">
                  <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
                    <p className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-400">Selo do vendedor</p>
                    <p className="mt-2 text-2xl font-black text-slate-900">{notaMediaRecebida.toFixed(1)} / 10</p>
                    <p className="mt-1 text-sm text-slate-500">{avaliacoesRecebidas} avaliação{avaliacoesRecebidas === 1 ? '' : 'ões'} recebida{avaliacoesRecebidas === 1 ? '' : 's'}</p>
                    <p className="mt-3 text-sm text-slate-500">Média geral do perfil do vendedor.</p>
                  </div>
                  <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
                    <p className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-400">Avaliações por pedido</p>
                    <p className="mt-2 text-2xl font-black text-slate-900">{avaliacoesPorPedido}</p>
                    <p className="mt-1 text-sm text-slate-500">Avaliações recebidas por pedido entregue.</p>
                  </div>
                </div>

                {pedidosRecebidos.length === 0 ? (
                  <div className="mt-4 rounded-2xl border border-dashed border-slate-300 bg-slate-50 p-5 text-center text-slate-500">
                    Nenhum pedido recebido no momento.
                  </div>
                ) : (
                  <div className="mt-4 space-y-4">
                    {pedidosRecebidos.map((pedido) => (
                      <article key={pedido.id} className="rounded-2xl border border-slate-200 p-4 shadow-sm">
                        <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                          <div>
                            <p className="text-sm text-slate-500">Pedido {pedido.id}</p>
                            <h4 className="text-lg font-bold text-slate-900">{pedido.comprador.nome}</h4>
                            <p className="text-sm text-slate-500">{new Date(pedido.criadoEm).toLocaleString('pt-BR')}</p>
                          </div>
                          <span className={`inline-flex w-fit rounded-full border px-3 py-1 text-xs font-semibold uppercase tracking-[0.14em] ${statusBadgeClasses(pedido.status)}`}>
                            {pedido.status}
                          </span>
                        </div>

                        <div className="mt-4 grid gap-3 rounded-[1.25rem] bg-slate-50 p-4 text-sm text-slate-600 sm:grid-cols-3">
                          <div>
                            <p className="font-semibold text-slate-900">Aprovado em</p>
                            <p>{pedido.aprovadoEm ? new Date(pedido.aprovadoEm).toLocaleString('pt-BR') : 'Aguardando'}</p>
                          </div>
                          <div>
                            <p className="font-semibold text-slate-900">Prazo limite</p>
                            <p>{pedido.prazoEntregaLimite ? new Date(pedido.prazoEntregaLimite).toLocaleString('pt-BR') : 'Aguardando'}</p>
                          </div>
                          <div>
                            <p className="font-semibold text-slate-900">Entregue em</p>
                            <p>{pedido.entregueEm ? new Date(pedido.entregueEm).toLocaleString('pt-BR') : 'Aguardando'}</p>
                          </div>
                        </div>

                        <div className="mt-4 grid gap-3 rounded-[1.25rem] border border-slate-200 p-4 text-sm text-slate-600 sm:grid-cols-2">
                          <div>
                            <p className="font-semibold text-slate-900">Total</p>
                            <p>R$ {pedido.total.toFixed(2)}</p>
                          </div>
                          <div>
                            <p className="font-semibold text-slate-900">Itens</p>
                            <p>{pedido.itens.length}</p>
                          </div>
                        </div>

                        <div className="mt-4 space-y-2">
                          {pedido.itens.map((item) => (
                            <div key={`${pedido.id}-${item.productId}`} className="flex items-center justify-between rounded-xl bg-slate-50 px-4 py-3 text-sm">
                              <span className="font-medium text-slate-700">{item.productName}</span>
                              <span className="text-slate-600">{item.quantidade}x • R$ {item.precoUnitario.toFixed(2)}</span>
                            </div>
                          ))}
                        </div>
                        {pedido.status === 'aceito' && montarAvisoPrazo(pedido) ? (
                          <div className="mt-4 rounded-2xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm font-medium text-amber-700">
                            {montarAvisoPrazo(pedido)}
                          </div>
                        ) : null}
                        {pedido.status === 'invalido' ? (
                          <div className="mt-4 rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-medium text-red-700">
                            Pedido invalidado: {pedido.motivoRejeicao || 'Prazo de entrega expirado'}.
                          </div>
                        ) : null}

                        {pedido.status === 'em analise' ? (
                          <div className="mt-4 flex flex-col gap-3 sm:flex-row">
                            <button
                              type="button"
                              disabled={pedidoEmProcesso === pedido.id}
                              onClick={() => atualizarStatusPedido(pedido.id, 'aceito')}
                              className="rounded-2xl bg-emerald-600 px-4 py-3 font-semibold text-white transition hover:bg-emerald-700 disabled:cursor-not-allowed disabled:opacity-60"
                            >
                              {pedidoEmProcesso === pedido.id ? 'Atualizando...' : 'Aceitar pedido'}
                            </button>
                            <button
                              type="button"
                              disabled={pedidoEmProcesso === pedido.id}
                              onClick={() => atualizarStatusPedido(pedido.id, 'rejeitado')}
                              className="rounded-2xl border border-red-200 px-4 py-3 font-semibold text-red-700 transition hover:bg-red-50 disabled:cursor-not-allowed disabled:opacity-60"
                            >
                              Rejeitar pedido
                            </button>
                            <button
                              type="button"
                              onClick={() => navigate('/chat')}
                              className="rounded-2xl border border-slate-200 px-4 py-3 font-semibold text-slate-700 transition hover:bg-slate-50"
                            >
                              Abrir chat
                            </button>
                          </div>
                        ) : pedido.status === 'aceito' ? (
                          <div className="mt-4 flex flex-col gap-3 sm:flex-row">
                            <button
                              type="button"
                              disabled={pedidoEmProcesso === pedido.id}
                              onClick={() => solicitarEntregaPedido(pedido.id)}
                              className="rounded-2xl bg-blue-600 px-4 py-3 font-semibold text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-60"
                            >
                              {pedidoEmProcesso === pedido.id ? 'Confirmando...' : 'Entregar produto'}
                            </button>
                            <button
                              type="button"
                              onClick={() => navigate('/chat')}
                              className="rounded-2xl border border-slate-200 px-4 py-3 font-semibold text-slate-700 transition hover:bg-slate-50"
                            >
                              Abrir chat
                            </button>
                          </div>
                        ) : pedido.status === 'entregue' ? (
                          <div className="mt-4 rounded-2xl border border-blue-200 bg-blue-50 px-4 py-3 text-sm font-medium text-blue-700">
                            Entrega confirmada com o código informado. O histórico ficou salvo para métricas.
                          </div>
                        ) : pedido.status === 'rejeitado' && pedido.motivoRejeicao ? (
                          <div className="mt-4 rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-medium text-red-700">
                            Pedido rejeitado automaticamente: {pedido.motivoRejeicao}.
                          </div>
                        ) : (
                          <div className="mt-4 rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-600">
                            Pedido já foi tratado. Quando a negociação ficar pronta, o chat poderá ser usado para concluir os detalhes.
                          </div>
                        )}
                      </article>
                    ))}
                  </div>
                )}
              </div>
            ) : aba === "Favoritos" ? (
              <div className="mt-3 rounded-[1.5rem] border border-slate-200 p-5 shadow-sm">
                <h3 className="text-2xl font-black tracking-tight text-slate-900 sm:text-3xl">
                  Favoritos
                </h3>
                <p className="mt-1 text-slate-500">
                  Produtos que você marcou para ver depois.
                </p>

                {favoritos.length === 0 ? (
                  <div className="mt-4 rounded-2xl border border-dashed border-slate-300 bg-slate-50 p-5 text-center">
                    <p className="text-slate-500">
                      Você ainda não favoritou nenhum produto.
                    </p>
                    <Link
                      to="/produtos"
                      className="mt-3 inline-flex rounded-xl bg-slate-900 px-4 py-2 text-sm font-semibold text-white"
                    >
                      Explorar produtos
                    </Link>
                  </div>
                ) : (
                  <div className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-2">
                    {/* Ajuste: mostrar 2 produtos por linha na listagem de "Favoritos" */}
                    {favoritos.map((produto) => (
                      <div
                        key={produto.id}
                        className="rounded-2xl border border-slate-200 p-4 shadow-sm"
                      >
                        <h4 className="font-bold text-slate-900">
                          {produto.nome}
                        </h4>
                        <p className="line-clamp-2 text-sm text-slate-600">
                          {produto.descricao}
                        </p>
                        <p className="mt-2 font-semibold text-blue-600">
                          R$ {produto.preco.toFixed(2)}
                        </p>
                        <p className="text-sm text-slate-500">
                          Estoque: {produto.estoque}
                        </p>

                        {/* Botões de ação para cada favorito: ver produto e remover dos favoritos */}
                        <div className="mt-4 flex gap-2">
                          <Link
                            to={`/produto/${produto.id}`}
                            className="rounded-2xl border border-slate-200 px-4 py-2 font-semibold text-slate-700 transition hover:bg-slate-50"
                          >
                            Ver produto
                          </Link>
                          <button
                            type="button"
                            onClick={() => removerFavorito(produto.id)}
                            className="rounded-2xl border border-red-200 bg-red-50 px-4 py-2 font-semibold text-red-700 transition hover:bg-red-100"
                          >
                            Remover
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            ) : aba === "Editar Perfil" ? (
              <div className="mt-3 rounded-[1.5rem] border border-slate-200 p-5 shadow-sm">
                <h3 className="text-2xl font-black tracking-tight text-slate-900 sm:text-3xl">
                  Editar conta
                </h3>
                <p className="mt-1 text-slate-500">
                  A edição de conta agora fica em uma página dedicada.
                </p>

                <div className="mt-4 rounded-2xl border border-blue-100 bg-blue-50 px-4 py-3 text-sm text-blue-800">
                  Use a tela de edição para alterar nome, email e foto de perfil sem misturar isso ao painel.
                </div>

                <Link
                  to="/conta/editar"
                  className="mt-4 inline-flex rounded-2xl bg-slate-900 px-5 py-3 font-semibold text-white transition hover:bg-slate-800"
                >
                  Ir para edição da conta
                </Link>
              </div>
            ) : aba === "Configurações" ? (
              <div className="mt-3 rounded-[1.5rem] border border-slate-200 p-5 shadow-sm">
                <h3 className="text-2xl font-black tracking-tight text-slate-900 sm:text-3xl">
                  Configurações da conta
                </h3>
                <p className="mt-1 text-slate-500">
                  Atualize seu código de entrega para confirmar pedidos com
                  segurança.
                </p>

                {erroConfig && (
                  <div className="mt-4 rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-medium text-red-700">
                    {erroConfig}
                  </div>
                )}

                {mensagemConfig && (
                  <div className="mt-4 rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm font-medium text-emerald-700">
                    {mensagemConfig}
                  </div>
                )}

                <div className="mt-4 rounded-2xl bg-blue-50 p-6 text-center">
                  <p className="text-sm text-slate-600">Seu código atual</p>
                  <p className="mt-2 text-4xl font-black tracking-[0.3em] text-blue-700">
                    _ _ _ _
                  </p>
                </div>
                <input
                  className="mt-4 w-full rounded-2xl border border-slate-200 px-4 py-3 outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-100"
                  placeholder="Novo código de entrega"
                />
                <button className="mt-3 w-full rounded-2xl bg-slate-900 py-3 font-semibold text-white">
                  Atualizar código
                </button>

                <div className="mt-6 rounded-2xl border border-red-200 bg-red-50 p-4">
                  <p className="text-sm font-semibold text-red-700">
                    Zona de perigo
                  </p>
                  <p className="mt-1 text-sm text-red-600">
                    Excluir sua conta remove seu acesso e desativa seu cadastro.
                  </p>
                  <button
                    type="button"
                    onClick={excluirConta}
                    disabled={excluindoConta}
                    className="mt-3 w-full rounded-2xl bg-red-600 py-3 font-semibold text-white transition hover:bg-red-700 disabled:cursor-not-allowed disabled:opacity-60"
                  >
                    {excluindoConta ? "Excluindo conta..." : "Excluir conta"}
                  </button>
                </div>

                <div className="mt-4 rounded-2xl border border-slate-200 p-4 text-sm">
                  <p className="mb-2 font-semibold text-slate-900">
                    Importante:
                  </p>
                  <ul className="list-inside list-disc text-slate-600">
                    <li>Pode ser solicitado por quem vai fazer a entrega</li>
                    <li>Não deve ser compartilhado no chat</li>
                    <li>
                      Não pode ser igual aos 4 últimos dígitos do telefone
                    </li>
                  </ul>
                </div>
              </div>
            ) : (
              <div className="mt-3 rounded-[1.5rem] border border-slate-200 p-5 shadow-sm text-slate-500">
                Selecione uma aba.
              </div>
            )}
          </main>
        </div>
      </section>
    </Layout>
  );
}
