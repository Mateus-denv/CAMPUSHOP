import api from './api'
import { Carrinho, Produto } from '@/store'

// Camada de serviço da API: funções específicas para cada recurso
// Centraliza todas as chamadas HTTP e tipagem TypeScript

// API de produtos: operações de leitura (GET)
export const produtoAPI = {
  // Lista todos os produtos disponíveis no marketplace
  listar: () => api.get<Produto[]>('/api/produtos'),
  // Obtém detalhes de um produto específico por ID
  obter: (id: number) => api.get<Produto>(`/api/produtos/${id}`),
}

// API do carrinho: operações CRUD completas
export const carrinhoAPI = {
  // Obtém carrinho atual do usuário logado
  obter: () => api.get<Carrinho>('/api/carrinho'),
  // Adiciona produto ao carrinho ou incrementa quantidade
  adicionar: (produtoId: number, quantidade: number) =>
    api.post('/api/carrinho/adicionar', {
      produtoId,
      quantidade,
    }),
  // Atualiza quantidade de um item específico no carrinho
  atualizar: (itemId: number, quantidade: number) =>
    api.put(`/api/carrinho/${itemId}`, {
      quantidade,
    }),
  // Remove item completamente do carrinho
  remover: (itemId: number) => api.delete(`/api/carrinho/${itemId}`),
  // Finaliza compra com endereço e telefone de entrega
  finalizar: (endereco: string, telefone: string) =>
    api.post('/api/carrinho/finalizar', {
      endereco,
      telefone,
    }),
  // Remove todos os itens do carrinho
  limpar: () => api.delete('/api/carrinho/limpar'),
}

// API de autenticação: login, cadastro e verificação de sessão
export const authAPI = {
  // Autentica usuário e retorna token JWT + dados do usuário
  login: (email: string, senha: string) =>
    api.post('/api/auth/login', {
      email,
      senha,
    }),
  // Registra novo usuário no sistema
  cadastro: (
    nomeCompleto: string,
    email: string,
    ra: string,
    senha: string,
    confirmarSenha: string,
    instituicao: string,
    cidade: string,
    perfil: string
  ) =>
    api.post('/api/auth/register', {
      nomeCompleto,
      email,
      ra,
      senha,
      confirmarSenha,
      instituicao,
      cidade,
      perfil,
    }),
  // Verifica se o token atual é válido e retorna dados do usuário
  // Usado para restaurar sessão ao recarregar a página
  me: () => api.get('/api/auth/me'),
}
