import { MediaImage } from '@/components/MediaImage'
import { Button, Card, Input } from '@/components/UI'
import { categoriaAPI, produtoAPI, type ProdutoImagemAPI } from '@/lib/api-service'
import { buildProductImageUrl, getAllowedImageAccept, getImageGuidance, validateImageFile } from '@/lib/image-utils'
import { AlertCircle } from 'lucide-react'
import { useEffect, useState, type ChangeEvent, type FormEvent } from 'react'
import { Link, useNavigate, useSearchParams } from 'react-router-dom'

type Categoria = {
    idCategoria: number
    nome_categoria: string
    descricao: string
}

type ProdutoForm = {
    nomeProduto: string
    descricao: string
    estoque: string
    preco: string
    dimensoes: string
    peso: string
    categoriaId: string
    status: string
    visivelParaComprador: boolean
}

export function CadastrarProdutoPage() {
    const navigate = useNavigate()
    const [searchParams] = useSearchParams()
    const [produtoIdEdicao, setProdutoIdEdicao] = useState<number | null>(null)
    const [form, setForm] = useState<ProdutoForm>({
        nomeProduto: '',
        descricao: '',
        estoque: '',
        preco: '',
        dimensoes: '',
        peso: '',
        categoriaId: '',
        status: 'ATIVO',
        visivelParaComprador: true,
    })
    const [categorias, setCategorias] = useState<Categoria[]>([])
    const [erro, setErro] = useState('')
    const [carregando, setCarregando] = useState(false)
    const [semDimensoes, setSemDimensoes] = useState(false)
    const [imagensSelecionadas, setImagensSelecionadas] = useState<File[]>([])
    const [previewImagens, setPreviewImagens] = useState<string[]>([])
    const [imagensExistentes, setImagensExistentes] = useState<ProdutoImagemAPI[]>([])
    const [carregandoImagens, setCarregandoImagens] = useState(false)

    useEffect(() => {
        const carregarCategorias = async () => {
            try {
                console.log('🔄 Carregando categorias...')
                const response = await categoriaAPI.listar()
                console.log('✅ Categorias carregadas:', response.data)
                setCategorias(response.data)
            } catch (err: any) {
                console.error('❌ Erro ao carregar categorias:', err.message)
                console.error('Status:', err.response?.status)
                console.error('Data:', err.response?.data)
            }
        }
        carregarCategorias()
    }, [])

    useEffect(() => {
        const produtoId = searchParams.get('produtoId')
        if (!produtoId) {
            return
        }

        const idNumerico = Number(produtoId)
        if (!idNumerico) {
            setErro('Produto inválido para edição.')
            return
        }

        const carregarProduto = async () => {
            try {
                setCarregando(true)
                const response = await produtoAPI.obterPorId(idNumerico)
                const produto = response.data ?? {}

                setProdutoIdEdicao(idNumerico)
                setForm({
                    nomeProduto: produto.nomeProduto ?? produto.nome ?? '',
                    descricao: produto.descricao ?? '',
                    estoque: String(produto.estoque ?? ''),
                    preco: produto.preco != null ? String(produto.preco) : '',
                    dimensoes: produto.dimensoes ?? '',
                    peso: produto.peso != null ? String(produto.peso) : '',
                    categoriaId: String(produto.categoria?.idCategoria ?? ''),
                    status: produto.status ?? 'ATIVO',
                    visivelParaComprador: produto.visivelParaComprador ?? true,
                })
                setSemDimensoes(!produto.dimensoes)
            } catch (err: any) {
                setErro(err.response?.data?.message || 'Não foi possível carregar o produto para edição.')
            } finally {
                setCarregando(false)
            }
        }

        carregarProduto()
    }, [searchParams])

    useEffect(() => {
        const produtoId = searchParams.get('produtoId')
        if (!produtoId || !produtoIdEdicao) {
            setImagensExistentes([])
            return
        }

        carregarImagensProduto(produtoIdEdicao)
    }, [produtoIdEdicao, searchParams])

    useEffect(() => {
        return () => {
            previewImagens.forEach((url) => URL.revokeObjectURL(url))
        }
    }, [previewImagens])

    const atualizarCampo = <K extends keyof ProdutoForm>(campo: K, valor: ProdutoForm[K]) => {
        setForm((atual) => ({
            ...atual,
            [campo]: valor,
        }))
    }

    const carregarImagensProduto = async (produtoId: number) => {
        try {
            setCarregandoImagens(true)
            const response = await produtoAPI.listarImagens(produtoId)
            setImagensExistentes(response.data ?? [])
        } catch (error) {
            console.error('Erro ao carregar imagens do produto:', error)
            setImagensExistentes([])
        } finally {
            setCarregandoImagens(false)
        }
    }

    const atualizarImagens = async (event: ChangeEvent<HTMLInputElement>) => {
        const arquivos = Array.from(event.target.files ?? [])
        setErro('')

        const limiteRestante = Math.max(0, 3 - imagensExistentes.length)

        if (!arquivos.length) {
            setImagensSelecionadas([])
            setPreviewImagens([])
            return
        }

        if (arquivos.length > limiteRestante) {
            setErro(`Você pode enviar no máximo ${limiteRestante} imagem(ns) adicional(is).`)
            event.target.value = ''
            return
        }

        const novasPreviews: string[] = []
        for (const arquivo of arquivos) {
            const validacao = await validateImageFile(arquivo, 'produto')
            if (validacao) {
                novasPreviews.forEach((url) => URL.revokeObjectURL(url))
                setErro(validacao)
                event.target.value = ''
                return
            }

            novasPreviews.push(URL.createObjectURL(arquivo))
        }

        previewImagens.forEach((url) => URL.revokeObjectURL(url))
        setImagensSelecionadas(arquivos)
        setPreviewImagens(novasPreviews)
        event.target.value = ''
    }

    const removerPreviewImagem = (indice: number) => {
        setPreviewImagens((atuais) => {
            const removida = atuais[indice]
            if (removida) {
                URL.revokeObjectURL(removida)
            }

            return atuais.filter((_, posicao) => posicao !== indice)
        })
        setImagensSelecionadas((atuais) => atuais.filter((_, posicao) => posicao !== indice))
    }

    const excluirImagemExistente = async (imagemId: number) => {
        if (!produtoIdEdicao) {
            return
        }

        try {
            setCarregando(true)
            await produtoAPI.excluirImagem(produtoIdEdicao, imagemId)
            await carregarImagensProduto(produtoIdEdicao)
        } catch (error: any) {
            setErro(error?.response?.data?.message || 'Não foi possível excluir a imagem.')
        } finally {
            setCarregando(false)
        }
    }

    const handleSalvar = async (e: FormEvent) => {
        e.preventDefault()
        setErro('')
        setCarregando(true)

        try {
            if (!form.nomeProduto.trim()) {
                setErro('Nome do produto é obrigatório')
                return
            }
            if (!form.descricao.trim()) {
                setErro('Descrição do produto é obrigatória')
                return
            }
            if (!form.estoque.trim() || Number(form.estoque) < 0 || Number.isNaN(Number(form.estoque))) {
                setErro('Estoque deve ser um número válido e maior ou igual a zero')
                return
            }
            if (!form.preco.trim() || Number(form.preco.replace(',', '.')) <= 0 || Number.isNaN(Number(form.preco.replace(',', '.')))) {
                setErro('Preço deve ser um valor positivo')
                return
            }
            if (!form.categoriaId) {
                setErro('Categoria é obrigatória')
                return
            }
            if (!semDimensoes && form.dimensoes.trim() && form.dimensoes.trim().length < 3) {
                setErro('Dimensões, se informadas, devem ser descritivas')
                return
            }
            if (form.peso.trim() && (Number(form.peso.replace(',', '.')) <= 0 || Number.isNaN(Number(form.peso.replace(',', '.'))))) {
                setErro('Peso deve ser um valor positivo')
                return
            }

            const produto = {
                nomeProduto: form.nomeProduto.trim(),
                descricao: form.descricao.trim(),
                estoque: Number(form.estoque),
                preco: Number(form.preco.replace(',', '.')),
                status: form.status,
                visivelParaComprador: form.visivelParaComprador,
                dimensoes: semDimensoes ? null : form.dimensoes.trim() || null,
                peso: form.peso.trim() ? Number(form.peso.replace(',', '.')) : null,
                categoria: { idCategoria: Number(form.categoriaId) }
            }

            let idProdutoFinal = produtoIdEdicao

            if (produtoIdEdicao) {
                await produtoAPI.atualizar(produtoIdEdicao, produto)
            } else {
                const resposta = await produtoAPI.salvar(produto)
                const produtoCriado = resposta.data ?? {}
                idProdutoFinal = Number(produtoCriado.idProduto ?? produtoCriado.id ?? 0) || null
                if (idProdutoFinal) {
                    setProdutoIdEdicao(idProdutoFinal)
                }
            }

            if (imagensSelecionadas.length && idProdutoFinal) {
                try {
                    await produtoAPI.enviarImagens(idProdutoFinal, imagensSelecionadas)
                } catch (uploadErr: any) {
                    setErro(uploadErr?.response?.data?.message || 'Produto salvo, mas não foi possível enviar as imagens.')
                    return
                }
            }
            navigate('/conta')
        } catch (err: any) {
            setErro(err.response?.data?.message || (produtoIdEdicao ? 'Erro ao atualizar produto' : 'Erro ao cadastrar produto'))
        } finally {
            setCarregando(false)
        }
    }

    return (
        <div className="min-h-screen bg-[radial-gradient(circle_at_top,_#f8fafc_0,_#e2e8f0_35%,_#ffffff_100%)] px-4 py-10 flex items-center justify-center">
            <div className="w-full max-w-4xl">
                <Card className="border-0 shadow-none rounded-[2rem] bg-white">
                    <div className="p-8 sm:p-10">
                        <div className="mb-8 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                            <div>
                                <h1 className="text-3xl font-black tracking-tight text-slate-900">{produtoIdEdicao ? 'Editar produto' : 'Cadastrar produto'}</h1>
                                <p className="mt-2 text-sm text-slate-600">{produtoIdEdicao ? 'Ajuste os dados do produto e salve a atualização.' : 'Preencha os dados do produto e anuncie no CampusShop.'}</p>
                            </div>
                            <Link
                                to="/conta"
                                className="inline-flex items-center rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm font-semibold text-slate-900 transition hover:border-slate-300 hover:bg-slate-100"
                            >
                                Voltar para minha conta
                            </Link>
                        </div>

                        {erro && (
                            <div className="mb-6 flex gap-3 rounded-2xl border border-red-200 bg-red-50 p-4">
                                <AlertCircle className="mt-0.5 h-5 w-5 text-red-600" />
                                <p className="text-sm text-red-800">{erro}</p>
                            </div>
                        )}

                        <form onSubmit={handleSalvar} className="grid gap-4">
                            <Input
                                label="Nome do produto"
                                placeholder="Ex: Lápis, Sanduíche, Mochila"
                                value={form.nomeProduto}
                                onChange={(e) => atualizarCampo('nomeProduto', e.target.value)}
                            />
                            <Input
                                label="Descrição"
                                placeholder="Descreva o produto"
                                value={form.descricao}
                                onChange={(e) => atualizarCampo('descricao', e.target.value)}
                            />
                            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                                <Input
                                    label="Estoque"
                                    placeholder="0"
                                    type="number"
                                    value={form.estoque}
                                    onChange={(e) => atualizarCampo('estoque', e.target.value)}
                                />
                                <Input
                                    label="Preço"
                                    placeholder="49.90"
                                    type="text"
                                    value={form.preco}
                                    onChange={(e) => atualizarCampo('preco', e.target.value)}
                                />
                            </div>
                            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                                <div>
                                    <label className="block text-sm font-medium text-slate-700 mb-2">Categoria</label>
                                    <select
                                        value={form.categoriaId}
                                        onChange={(e) => atualizarCampo('categoriaId', e.target.value)}
                                        className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 placeholder:text-slate-500 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                                    >
                                        <option value="">Selecione uma categoria</option>
                                        {categorias.map((categoria) => (
                                            <option key={categoria.idCategoria} value={categoria.idCategoria}>
                                                {categoria.nome_categoria}
                                            </option>
                                        ))}
                                    </select>
                                </div>
                            </div>
                            <div className="flex flex-col gap-4 md:flex-row md:items-center">
                                <label className="inline-flex items-center gap-3 text-sm font-medium text-slate-700">
                                    <input
                                        type="checkbox"
                                        checked={semDimensoes}
                                        onChange={(e) => setSemDimensoes(e.target.checked)}
                                        className="h-4 w-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500"
                                    />
                                    Dimensões não são necessárias
                                </label>
                            </div>
                            {!semDimensoes && (
                                <Input
                                    label="Dimensões (opcional)"
                                    placeholder="Ex: 20x2x1 cm"
                                    value={form.dimensoes}
                                    onChange={(e) => atualizarCampo('dimensoes', e.target.value)}
                                />
                            )}
                            <Input
                                label="Peso (opcional)"
                                placeholder="Ex: 0.12"
                                type="text"
                                value={form.peso}
                                onChange={(e) => atualizarCampo('peso', e.target.value)}
                            />

                            <div className="rounded-[1.5rem] border border-slate-200 bg-slate-50 p-4">
                                <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                                    <div>
                                        <h2 className="text-lg font-black tracking-tight text-slate-900">Imagens do anúncio</h2>
                                        <p className="text-sm text-slate-600">{getImageGuidance('produto')} Você pode manter até 3 imagens por anúncio.</p>
                                    </div>
                                    <span className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-400">16:9</span>
                                </div>

                                        {produtoIdEdicao ? (
                                            <div className="mt-4 rounded-[1.25rem] border border-slate-200 bg-white p-3">
                                                <p className="mb-2 text-sm font-semibold text-slate-700">Imagens já salvas</p>
                                                {carregandoImagens ? (
                                                    <p className="text-sm text-slate-500">Carregando imagens...</p>
                                                ) : imagensExistentes.length > 0 ? (
                                                    <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                                                        {imagensExistentes.map((imagem, index) => (
                                                            <div key={imagem.id} className="overflow-hidden rounded-[1.25rem] border border-slate-200 bg-slate-50">
                                                                <MediaImage
                                                                    src={imagem.url}
                                                                    alt={imagem.nomeArquivo}
                                                                    fallbackLabel="Sem imagem"
                                                                    className="h-40 w-full"
                                                                    imageClassName="h-40 w-full"
                                                                />
                                                                <div className="flex items-center justify-between gap-2 px-3 py-3">
                                                                    <span className="text-xs font-semibold text-slate-500">Imagem {index + 1}</span>
                                                                    <button
                                                                        type="button"
                                                                        onClick={() => excluirImagemExistente(imagem.id)}
                                                                        className="rounded-lg border border-red-200 px-2.5 py-1.5 text-xs font-semibold text-red-700 transition hover:bg-red-50"
                                                                    >
                                                                        Excluir
                                                                    </button>
                                                                </div>
                                                            </div>
                                                        ))}
                                                    </div>
                                                ) : (
                                                    <MediaImage
                                                        src={buildProductImageUrl(produtoIdEdicao)}
                                                        alt={form.nomeProduto || 'Imagem do produto'}
                                                        fallbackLabel="Sem imagem cadastrada"
                                                        className="h-56 w-full rounded-[1.25rem]"
                                                        imageClassName="h-56 w-full rounded-[1.25rem]"
                                                    />
                                                )}
                                            </div>
                                        ) : null}

                                <label className="mt-4 flex cursor-pointer flex-col gap-2 rounded-[1.25rem] border border-dashed border-slate-300 bg-white p-4 transition hover:border-slate-400 hover:bg-slate-50">
                                            <span className="text-sm font-semibold text-slate-700">Selecionar imagens do anúncio</span>
                                    <span className="text-sm text-slate-500">JPG, JPEG, WebP ou AVIF, até 2 MB por imagem.</span>
                                            <span className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-400">Restam {Math.max(0, 3 - imagensExistentes.length - imagensSelecionadas.length)} espaço(s)</span>
                                    <input
                                        type="file"
                                        accept={getAllowedImageAccept()}
                                        multiple
                                        onChange={atualizarImagens}
                                                disabled={imagensExistentes.length >= 3}
                                        className="sr-only"
                                    />
                                </label>

                                {previewImagens.length > 0 ? (
                                            <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                                        {previewImagens.map((preview, index) => (
                                                    <div key={preview} className="overflow-hidden rounded-[1.25rem] border border-slate-200 bg-white">
                                                        <div className="relative">
                                                            <img
                                                                src={preview}
                                                                alt={`Pré-visualização ${index + 1}`}
                                                                className="h-40 w-full object-cover"
                                                            />
                                                            <button
                                                                type="button"
                                                                onClick={() => removerPreviewImagem(index)}
                                                                className="absolute right-2 top-2 rounded-full bg-slate-900/80 p-2 text-white transition hover:bg-slate-900"
                                                                aria-label={`Remover imagem ${index + 1}`}
                                                            >
                                                                ×
                                                            </button>
                                                        </div>
                                            </div>
                                        ))}
                                    </div>
                                ) : null}
                            </div>

                            <Button type="submit" loading={carregando} className="w-full rounded-2xl py-3.5 text-base shadow-lg shadow-blue-600/20">
                                {produtoIdEdicao ? 'Salvar alterações' : 'Cadastrar produto'}
                            </Button>
                        </form>
                    </div>
                </Card>
            </div>
        </div>
    )
}
