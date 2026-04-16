import { useSyncExternalStore } from 'react'

// Sistema de gerenciamento de estado global sem Redux
// Usa useSyncExternalStore do React 18 para estado reativo

export type Usuario = {
  nome?: string          // Nome curto para exibição na UI
  nomeCompleto?: string  // Nome completo do usuário
  email?: string         // Email para login e notificações
  ra?: string            // Registro Acadêmico da instituição
  token?: string         // JWT token para autenticação
  perfil?: string        // Tipo de usuário (comprador/vendedor)
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

// Estados globais mantidos em memória
type AuthState = {
  usuario: Usuario | null
}

type CarrinhoState = {
  carrinho: Carrinho
}

// Estado inicial da autenticação
const authState: AuthState = {
  usuario: null,
}

// Estado inicial do carrinho
const carrinhoState: CarrinhoState = {
  carrinho: { itens: [] },
}

// Conjuntos de listeners para notificar mudanças de estado
const authListeners = new Set<() => void>()
const carrinhoListeners = new Set<() => void>()

// Função utilitária para notificar todos os listeners de mudanças
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