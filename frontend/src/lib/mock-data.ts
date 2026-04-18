export type category = {
  id: number
  nome: string
  quantidade: number
  icon: string
  color: string
}

export type mockproduct = {
  id: number
  nome: string
  descricao: string
  categoria: string
  condicao: string
  preco: number
  precooriginal?: number
  vendedor: string
  local: string
  latitude?: number;
  longitude?: number;
}

export const categories: category[] = [
  { id: 1, nome: 'livros', quantidade: 18, icon: '📚', color: 'bg-blue-50 text-blue-700' },
  { id: 2, nome: 'eletrônicos', quantidade: 12, icon: '💻', color: 'bg-indigo-50 text-indigo-700' },
  { id: 3, nome: 'vestuário', quantidade: 9, icon: '👕', color: 'bg-pink-50 text-pink-700' },
  { id: 4, nome: 'serviços', quantidade: 6, icon: '🛠️', color: 'bg-emerald-50 text-emerald-700' },
  { id: 5, nome: 'alimentação', quantidade: 8, icon: '🍱', color: 'bg-orange-50 text-orange-700' },
]

export const products: mockproduct[] = [
  {
    id: 1,
    nome: 'livro de lógica de programação',
    descricao: 'livro em ótimo estado, usado no primeiro semestre da graduação.',
    categoria: 'livros',
    condicao: 'usado',
    preco: 150,
    precooriginal: 220,
    vendedor: 'joão silva',
    local: 'ufba',
    latitude: -12.9714,
    longitude: -38.4580,
  },
  {
    id: 2,
    nome: 'empada doce',
    descricao: 'kit com 12 empadas doces artesanais para encomenda no campus.',
    categoria: 'alimentação',
    condicao: 'novo',
    preco: 10,
    vendedor: 'maria lima',
    local: 'ufba',
    latitude: -12.9714,
    longitude: -38.4580,
  },
  {
    id: 3,
    nome: 'notebook dell inspiron',
    descricao: 'notebook para estudos e trabalho com ssd e 8gb de ram.',
    categoria: 'eletrônicos',
    condicao: 'seminovo',
    preco: 2800,
    precooriginal: 3400,
    vendedor: 'caio ramos',
    local: 'camacari',
    latitude: -12.7392,
    longitude: -38.3242,
  },
  {
    id: 4,
    nome: 'camiseta atlética ufba',
    descricao: 'camiseta oficial para eventos e atividades acadêmicas.',
    categoria: 'vestuário',
    condicao: 'novo',
    preco: 45,
    vendedor: 'ana souza',
    local: 'salvador',
    latitude: -12.9714,
    longitude: -38.4580,
  },
  {
    id: 5,
    nome: 'aulas de reforço em cálculo i',
    descricao: 'acompanhamento individual para lista, provas e monitoria.',
    categoria: 'serviços',
    condicao: 'novo',
    preco: 80,
    vendedor: 'pedro alves',
    local: 'simões filho',
    latitude: -12.9630,
    longitude: -38.4264,
  },
]