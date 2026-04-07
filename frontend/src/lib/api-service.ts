import api from './api'
import { Carrinho, Produto } from '@/store'

export const produtoAPI = {
  listar: () => api.get<Produto[]>('/api/produtos'),
  obter: (id: number) => api.get<Produto>(`/api/produtos/${id}`),
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
    instituicao: string,
    cidade: string,
    perfil: string
  ) =>
    api.post('/api/auth/register', {
      nomeCompleto,
      email,
      ra,
      senha,
      instituicao,
      cidade,
      perfil,
    }),
  me: () => api.get('/api/auth/me'),
}
