export type Category = {
  id: number
  nome: string
  quantidade: number
  icon: string
  color: string
}

export type MockProduct = {
  id: number
  nome: string
  descricao: string
  categoria: string
  condicao: string
  preco: number
  precoOriginal?: number
  vendedor: string
  local: string
}

export const categories: Category[] = [
  { id: 1, nome: 'Livros', quantidade: 18, icon: '📚', color: 'bg-blue-50 text-blue-700' },
  { id: 2, nome: 'Eletrônicos', quantidade: 12, icon: '💻', color: 'bg-indigo-50 text-indigo-700' },
  { id: 3, nome: 'Vestuário', quantidade: 9, icon: '👕', color: 'bg-pink-50 text-pink-700' },
  { id: 4, nome: 'Serviços', quantidade: 6, icon: '🛠️', color: 'bg-emerald-50 text-emerald-700' },
  { id: 5, nome: 'Alimentação', quantidade: 8, icon: '🍱', color: 'bg-orange-50 text-orange-700' },
]

export const products: MockProduct[] = [
  {
    id: 1,
    nome: 'Livro de lógica de programação',
    descricao: 'Livro em ótimo estado, usado no primeiro semestre da graduação.',
    categoria: 'Livros',
    condicao: 'Usado',
    preco: 150,
    precoOriginal: 220,
    vendedor: 'João Silva',
    local: 'UFBA',
  },
  {
    id: 2,
    nome: 'Empada doce',
    descricao: 'Kit com 12 empadas doces artesanais para encomenda no campus.',
    categoria: 'Alimentação',
    condicao: 'Novo',
    preco: 10,
    vendedor: 'Maria Lima',
    local: 'UFBA',
  },
  {
    id: 3,
    nome: 'Notebook Dell Inspiron',
    descricao: 'Notebook para estudos e trabalho com SSD e 8GB de RAM.',
    categoria: 'Eletrônicos',
    condicao: 'Seminovo',
    preco: 2800,
    precoOriginal: 3400,
    vendedor: 'Caio Ramos',
    local: 'Camaçari',
  },
  {
    id: 4,
    nome: 'Camiseta atlética UFBA',
    descricao: 'Camiseta oficial para eventos e atividades acadêmicas.',
    categoria: 'Vestuário',
    condicao: 'Novo',
    preco: 45,
    vendedor: 'Ana Souza',
    local: 'Salvador',
  },
  {
    id: 5,
    nome: 'Aulas de reforço em Cálculo I',
    descricao: 'Acompanhamento individual para lista, provas e monitoria.',
    categoria: 'Serviços',
    condicao: 'Novo',
    preco: 80,
    vendedor: 'Pedro Alves',
    local: 'Simões Filho',
  },
] 
