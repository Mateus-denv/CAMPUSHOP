import { useSyncExternalStore } from 'react'

export type Usuario = {
  id?: number
  nome?: string
  nomeCompleto?: string
  email?: string
  ra?: string
  token?: string
  perfil?: string
  // Flag que indica se o usuário ativou o modo vendedor
  vendedorAtivo?: boolean
}

export type Produto = {
  id: number
  nome: string
  descricao: string
  preco: number
  estoque: number
  vendedor_id: number
}

export type CarrinhoItem = {
  id: number
  produtoId: number
  quantidade: number
}

export type Carrinho = {
  itens: CarrinhoItem[]
}

type AuthState = {
  usuario: Usuario | null
}

type CarrinhoState = {
  carrinho: Carrinho
}

const authState: AuthState = {
  usuario: null,
}

const carrinhoState: CarrinhoState = {
  carrinho: { itens: [] },
}

const authListeners = new Set<() => void>()
const carrinhoListeners = new Set<() => void>()

function notify(listeners: Set<() => void>) {
  listeners.forEach((listener) => listener())
}

// Auth Store
function setAuthUsuario(usuario: Usuario | null) {
  authState.usuario = usuario
  notify(authListeners)
}

export function useAuthStore() {
  const snapshot = useSyncExternalStore(
    (listener) => {
      authListeners.add(listener)
      return () => authListeners.delete(listener)
    },
    () => authState,
    () => authState
  )

  return {
    usuario: snapshot.usuario,
    setUsuario: setAuthUsuario,
  }
}

useAuthStore.getState = () => ({
  usuario: authState.usuario,
  setUsuario: setAuthUsuario,
})

useAuthStore.setUsuario = setAuthUsuario

// Carrinho Store
function setCarrinhoState(carrinho: Carrinho) {
  carrinhoState.carrinho = carrinho
  notify(carrinhoListeners)
}

export function useCarrinhoStore() {
  const snapshot = useSyncExternalStore(
    (listener) => {
      carrinhoListeners.add(listener)
      return () => carrinhoListeners.delete(listener)
    },
    () => carrinhoState,
    () => carrinhoState
  )

  return {
    carrinho: snapshot.carrinho,
    setCarrinho: setCarrinhoState,
  }
}

useCarrinhoStore.getState = () => ({
  carrinho: carrinhoState.carrinho,
  setCarrinho: setCarrinhoState,
})

useCarrinhoStore.setCarrinho = setCarrinhoState