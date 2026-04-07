export interface Category {
  id: string
  nome: string
  icon: string
  color: string
  quantidade: number
}

export interface Product {
  id: number
  nome: string
  preco: number
  precoOriginal?: number
  categoria: string
  condicao: 'novo' | 'seminovo' | 'usado'
  vendedor: string
  local: string
  instituicao: string
  descricao: string
}

export const categories: Category[] = [
  { id: 'livros', nome: 'Livros', icon: '📖', color: 'bg-sky-100 text-sky-600', quantidade: 2 },
  { id: 'eletronicos', nome: 'Eletrônicos', icon: '💻', color: 'bg-violet-100 text-violet-600', quantidade: 2 },
  { id: 'roupas', nome: 'Roupas', icon: '👕', color: 'bg-rose-100 text-rose-600', quantidade: 2 },
  { id: 'alimentacao', nome: 'Alimentação', icon: '🍴', color: 'bg-green-100 text-green-600', quantidade: 2 },
  { id: 'servicos', nome: 'Serviços', icon: '🛠️', color: 'bg-orange-100 text-orange-600', quantidade: 2 },
]

export const products: Product[] = [
  {
    id: 1,
    nome: 'Bolo de pote - sabores variados',
    preco: 10,
    precoOriginal: 15,
    categoria: 'Alimentação',
    condicao: 'novo',
    vendedor: 'Renata Oliveira',
    local: 'Camaçari',
    instituicao: 'UFBA',
    descricao: 'Produto artesanal, fresco e pronto para saborear.',
  },
  {
    id: 2,
    nome: 'Brinco - vários modelos',
    preco: 5,
    categoria: 'Roupa',
    condicao: 'usado',
    vendedor: 'Camila Santos',
    local: 'Camaçari',
    instituicao: 'UFBA',
    descricao: 'Peças em ótimo estado, com modelos variados.',
  },
  {
    id: 3,
    nome: 'Livro de lógica de programação',
    preco: 150,
    categoria: 'Livros',
    condicao: 'seminovo',
    vendedor: 'Caio Ramos',
    local: 'Camaçari',
    instituicao: 'UFBA',
    descricao: 'Livro de referência para iniciantes e intermediários.',
  },
]

export const condicaoLabel: Record<Product['condicao'], string> = {
  novo: 'novo',
  seminovo: 'seminovo',
  usado: 'usado',
}
