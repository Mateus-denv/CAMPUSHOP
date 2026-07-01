import api from './api'

export type ProdutoImagemAPI = {
  id: number
  nomeArquivo: string
  contentType: string
  url: string
  dataUpload?: string | null
}

export type CarrinhoBackendProduto = {
  idProduto: number
  nomeProduto: string
  descricao: string
  preco: number
  estoque: number
  status?: string
  visivelParaComprador?: boolean
  possuiVariantes?: boolean
  ehVariacao?: boolean
  produtoPaiId?: number | null
  produtoPaiNome?: string | null
  vendedor_id?: number
  nomeVendedor?: string
}

export type ProdutoVarianteAPI = {
  idProduto: number
  nomeProduto: string
  estoque: number
  preco: number
  descricaoVariacao?: string
  status?: string
  visivelParaComprador?: boolean
  ehVariacao?: boolean
  produtoPaiId?: number | null
  produtoPaiNome?: string | null
}

export type ProdutoAPI = {
  idProduto: number
  id?: number
  nomeProduto: string
  nome?: string
  descricao: string
  preco: number
  estoque: number
  status?: string
  visivelParaComprador?: boolean
  tipoProduto?: 'PRODUTO' | 'SERVICO'
  peso?: number | null
  usaDimensoes?: boolean
  dimensoes?: string | null
  dimensaoComprimento?: number | null
  dimensaoLargura?: number | null
  possuiVariantes?: boolean
  ehVariacao?: boolean
  produtoPaiId?: number | null
  produtoPaiNome?: string | null
  vendedor_id?: number
  vendedorId?: number
  nomeVendedor?: string
  categoriaId?: number
  nomeCategoria?: string
  categoria?: {
    idCategoria?: number
    id?: number
    nome_categoria?: string
    nome?: string
    descricao?: string
  }
  usuario?: {
    id?: number
    nomeCompleto?: string
    nomeCliente?: string
    instituicao?: string
    cidade?: string
  }
  instituicao?: string
  cidade?: string
  variantes?: ProdutoVarianteAPI[]
}

export type CarrinhoBackendItem = {
  id: number
  quantidade: number
  produto: CarrinhoBackendProduto
}

export type PedidoItemAPI = {
  productId: number
  productName: string
  quantidade: number
  precoUnitario: number
  vendedorId?: number
  vendedorNome: string
}

export type PedidoPessoaAPI = {
  id?: number
  nome: string
  email?: string
  perfil?: string
}

export type PedidoAPI = {
  id: number
  chaveAcesso: string | null
  status: 'em analise' | 'aceito' | 'rejeitado' | 'entregue' | 'invalido'
  motivoRejeicao?: string | null
  criadoEm: string
  aprovadoEm?: string | null
  prazoEntregaLimite?: string | null
  entregueEm?: string | null
  invalidadoEm?: string | null
  comprador: PedidoPessoaAPI
  vendedor: PedidoPessoaAPI
  itens: PedidoItemAPI[]
  total: number
}

export const categoriaAPI = {
  listar: () => api.get('/api/categorias'),
}

export const carrinhoAPI = {
  obter: () => api.get<CarrinhoBackendItem[]>('/api/carrinho'),
  adicionar: (produtoId: number, quantidade: number) =>
    api.post('/api/carrinho/adicionar', {
      produtoId,
      quantidade,
    }),
  atualizar: (itemId: number, quantidade: number) =>
    api.put(`/api/carrinho/${itemId}`, {
      quantidade,
    }),
  remover: (itemId: number) => api.delete(`/api/carrinho/${itemId}`),
  limpar: () => api.delete('/api/carrinho'),
}

export const pedidosAPI = {
  confirmar: () => api.post<PedidoAPI[]>('/api/pedidos/confirmar'),
  meus: () => api.get<PedidoAPI[]>('/api/pedidos/meus'),
  recebidos: () => api.get<PedidoAPI[]>('/api/pedidos/recebidos'),
  pendentesContagem: () => api.get<{ total: number }>('/api/pedidos/recebidos/pendentes/contagem'),
  atualizarStatus: (id: number, status: PedidoAPI['status'], codigoAcesso?: string) =>
    api.put<PedidoAPI>(`/api/pedidos/${id}/status`, {
      status,
      codigoAcesso,
    }),
}

export type ContaAtividadeAPI = {
  id: number
  tipo: 'Compra' | 'Venda'
  status: PedidoAPI['status']
  total: number
  data: string | null
  participante: string | null
}

export type ContaMetricasAPI = {
  produtosTotais: number
  produtosAtivos: number
  vendasConcluidas: number
  comprasConcluidas: number
  pedidosPendentes: number
  faturamentoVendas: number
  gastoCompras: number
  ticketMedioVendas: number
  ticketMedioCompras: number
  atividadesRecentes: ContaAtividadeAPI[]
}

export const contaAPI = {
  metricas: () => api.get<ContaMetricasAPI>('/api/conta/metricas'),
}

export const authAPI = {
  login: (email: string, senha: string) =>
    api.post('/api/auth/login', {
      email,
      senha,
    }),
  esqueciSenha: (email: string) =>
    api.post('/api/auth/esqueci-senha', {
      email,
    }),
  redefinirSenha: (token: string, novaSenha: string) =>
    api.post('/api/auth/redefinir-senha', {
      token,
      novaSenha,
    }),
  cadastro: (
    nomeCompleto: string,
    email: string,
    ra: string,
    senha: string,
    confirmarSenha: string,
    instituicao: string,
    cidade: string,
    perfil: string,
    cpfCnpj: string,
    dataNascimento: string
  ) => {
    // Garantir que dataNascimento está no formato ISO (YYYY-MM-DD)
    let dataFormatada = dataNascimento
    if (dataNascimento && typeof dataNascimento === 'string') {
      if (dataNascimento.includes('/')) {
        const [dia, mes, ano] = dataNascimento.split('/')
        dataFormatada = `${ano}-${mes}-${dia}`
      }
    }
    return api.post('/api/auth/register', {
      nomeCompleto,
      email,
      ra,
      senha,
      confirmarSenha,
      instituicao,
      cidade,
      perfil,
      cpfCnpj,
      dataNascimento: dataFormatada,
    })
  },
  me: () => api.get('/api/auth/me'),
}
// Centraliza chamadas relacionadas a produtos, como listagem, criação e exclusão.
export const produtoAPI = {
  listarTodos: () => api.get('/api/produtos'), // Mantém a função de listar produtos para uso geral, como na página inicial.
  listar: () => api.get('/api/produtos'), // Mantém a função de listar produtos para uso geral, como na página inicial.
  obterPorId: (id: number) => api.get<ProdutoAPI>(`/api/produtos/${id}`), // Busca o produto exato da rota de detalhe para evitar dados mockados.
  salvar: (produto: any) => api.post('/api/produtos', produto), // Centraliza chamada da criação de produto no backend.
  listarMeus: () => api.get('/api/produtos/usuario'), // Centraliza chamada da listagem de produtos do usuário autenticado no backend.
  obterPorUsuario: () => api.get('/api/produtos/usuario'), // Centraliza chamada da listagem de produtos do usuário autenticado no backend.
  atualizar: (id: number, produto: any) => api.put(`/api/produtos/${id}`, produto), // Reaproveita a edição completa do produto no backend.
  atualizarStatus: (id: number, status: string) => api.put(`/api/produtos/${id}/status`, { status }), // Alterna ativação do produto sem mexer nos demais campos.
  atualizarVisibilidade: (id: number, visivelParaComprador: boolean) => api.put(`/api/produtos/${id}/visibilidade`, { visivelParaComprador }), // Alterna a visibilidade para compradores de forma independente.
  listarImagens: (id: number) => api.get<ProdutoImagemAPI[]>(`/api/produtos/${id}/imagens`),
  enviarImagens: (id: number, imagens: File[]) => {
    const formData = new FormData()

    imagens.forEach((imagem) => {
      formData.append('imagens', imagem)
    })

    return api.post(`/api/produtos/${id}/imagens`, formData)
  },
  excluirImagem: (produtoId: number, imagemId: number) => api.delete(`/api/produtos/${produtoId}/imagens/${imagemId}`),
  deletar: (id: number) => api.delete(`/api/produtos/${id}`), // Centraliza chamada da exclusão de produto no backend.
}
// Centraliza chamadas relacionadas ao usuário autenticado, como atualização de perfil e exclusão de conta.
export const usuarioAPI = {
  atualizarPerfil: (nomeCompleto: string, email: string) =>
    // Centraliza chamada da edição de perfil autenticado no backend.
    api.put('/api/usuarios/me/perfil', {
      nomeCompleto,
      email,
    }),
  atualizarFotoPerfil: (imagem: File) => {
    const formData = new FormData()
    formData.append('imagem', imagem)

    return api.post('/api/usuarios/me/foto', formData)
  },
  excluir: (id: number) => api.delete(`/api/usuarios/${id}`), // Centraliza chamada da exclusão de usuário autenticado no backend.
}
