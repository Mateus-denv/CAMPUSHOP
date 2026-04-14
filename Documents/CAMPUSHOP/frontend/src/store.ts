import { useSyncExternalStore } from 'react'

export type Usuario = {
  nome?: string
  nomeCompleto?: string
  email?: string
  ra?: string
  token?: string
  perfil?: string
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

export const useAuthStore = Object.assign(
  function useAuthStore() {
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
      setUsuario: useAuthStore.setUsuario,
    }
  },
  {
    getState: () => ({
      usuario: authState.usuario,
      setUsuario: (usuario: Usuario | null) => {
        authState.usuario = usuario
        notify(authListeners)
      },
    }),
    setUsuario(usuario: Usuario | null) {
      authState.usuario = usuario
      notify(authListeners)
    },
  }
)

export const useCarrinhoStore = Object.assign(
  function useCarrinhoStore() {
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
      setCarrinho: useCarrinhoStore.setCarrinho,
    }
  },
  {
    getState: () => ({
      carrinho: carrinhoState.carrinho,
      setCarrinho: (carrinho: Carrinho) => {
        carrinhoState.carrinho = carrinho
        notify(carrinhoListeners)
      },
    }),
    setCarrinho(carrinho: Carrinho) {
      carrinhoState.carrinho = carrinho
      notify(carrinhoListeners)
    },
  }
)