import api from './api'
import { Carrinho } from '@/store'

export const categoriaAPI = {
  listar: () => api.get('/api/categorias'),
}

export const carrinhoAPI = {
  obter: () => api.get<Carrinho>('/api/carrinho'),
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
  finalizar: (endereco: string, telefone: string) =>
    api.post('/api/carrinho/finalizar', {
      endereco,
      telefone,
    }),
  limpar: () => api.delete('/api/carrinho/limpar'),
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

export const produtoAPI = {
  listarTodos: () => api.get('/api/produtos'),
  listar: () => api.get('/api/produtos'),
  salvar: (produto: any) => api.post('/api/produtos', produto),
  listarMeus: () => api.get('/api/produtos/usuario'),
  obterPorUsuario: () => api.get('/api/produtos/usuario'),
  deletar: (id: number) => api.delete(`/api/produtos/${id}`),
}
