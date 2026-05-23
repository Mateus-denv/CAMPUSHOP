import api from './api'

export type CarrinhoBackendProduto = {
  idProduto: number
  nomeProduto: string
  descricao: string
  preco: number
  estoque: number
  vendedor_id?: number
  nomeVendedor?: string
}

export type CarrinhoBackendItem = {
  id: number
  quantidade: number
  produto: CarrinhoBackendProduto
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

export const authAPI = {
  login: (email: string, senha: string) =>
    api.post('/api/auth/login', {
      email,
      senha,
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
  obterPorId: (id: number) => api.get(`/api/produtos/${id}`), // Busca o produto exato da rota de detalhe para evitar dados mockados.
  salvar: (produto: any) => api.post('/api/produtos', produto), // Centraliza chamada da criação de produto no backend.
  listarMeus: () => api.get('/api/produtos/usuario'), // Centraliza chamada da listagem de produtos do usuário autenticado no backend.
  obterPorUsuario: () => api.get('/api/produtos/usuario'), // Centraliza chamada da listagem de produtos do usuário autenticado no backend.
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
  excluir: (id: number) => api.delete(`/api/usuarios/${id}`), // Centraliza chamada da exclusão de usuário autenticado no backend.
}
