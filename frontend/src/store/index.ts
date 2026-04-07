import { create } from 'zustand'

export interface Produto {
  id: number
  nome: string
  descricao: string
  preco: number
  estoque: number
  vendedor_id: number
}

export interface ItemCarrinho {
  id: number
  quantidade: number
  precoUnitario: number
  subtotal: number
  produto: Produto
}

export interface Carrinho {
  id: number
  usuario_id: number
  itens: ItemCarrinho[]
  total: number
  criadoEm: string
  atualizadoEm: string
}

export interface Usuario {
  id: number
  nome: string
  email: string
  ra: string
  role: string
}

interface AuthStore {
  usuario: Usuario | null
  isAuthenticated: boolean
  setUsuario: (user: Usuario | null) => void
  logout: () => void
}

export const useAuthStore = create<AuthStore>((set) => ({
  usuario: null,
  isAuthenticated: false,
  setUsuario: (user) =>
    set({
      usuario: user,
      isAuthenticated: !!user,
    }),
  logout: () =>
    set({
      usuario: null,
      isAuthenticated: false,
    }),
}))

interface CarrinhoStore {
  carrinho: Carrinho | null
  carregando: boolean
  setCarrinho: (carrinho: Carrinho) => void
  setCarregando: (carregando: boolean) => void
  limpar: () => void
}

export const useCarrinhoStore = create<CarrinhoStore>((set) => ({
  carrinho: null,
  carregando: false,
  setCarrinho: (carrinho) => set({ carrinho }),
  setCarregando: (carregando) => set({ carregando }),
  limpar: () => set({ carrinho: null }),
}))
