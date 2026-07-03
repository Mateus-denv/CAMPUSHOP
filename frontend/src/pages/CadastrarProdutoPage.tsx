import { MediaImage } from '@/components/MediaImage'
import { PlanBadge } from '@/components/PlanBadge'
import { Button, Card, Input } from '@/components/UI'
import { categoriaAPI, produtoAPI, subscriptionAPI, type ProdutoImagemAPI, type SubscriptionAPI } from '@/lib/api-service'
import { buildProductImageUrl, getAllowedImageAccept, getImageGuidance, validateImageFile } from '@/lib/image-utils'
import { AlertCircle } from 'lucide-react'
import { useEffect, useRef, useState, type ChangeEvent, type FormEvent } from 'react'
import { Link, useNavigate, useSearchParams } from 'react-router-dom'

const LIMITE_IMAGENS_PRODUTO = 4

type Categoria = {
    idCategoria: number
    nome_categoria: string
    descricao: string
}

type VariacaoForm = {
    id: string
    nomeProduto: string
    estoque: string
    preco: string
    descricaoVariacao?: string
}

type ProdutoForm = {
    nomeProduto: string
    descricao: string
    tipoProduto: 'PRODUTO' | 'SERVICO'
    estoque: string
    preco: string
    peso: string
    categoriaId: string
    status: string
    visivelParaComprador: boolean
    possuiVariantes: boolean
    usaDimensoes: boolean
    dimensaoComprimento: string
    dimensaoLargura: string
    variantes: VariacaoForm[]
}

function criarVariacaoVazia(): VariacaoForm {
    return {
        id: `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
        nomeProduto: '',
        estoque: '',
        preco: '',
        descricaoVariacao: '',
    }
}

export function CadastrarProdutoPage() {
    const navigate = useNavigate()
    const [searchParams] = useSearchParams()
    const [produtoIdEdicao, setProdutoIdEdicao] = useState<number | null>(null)
    const [form, setForm] = useState<ProdutoForm>({
        nomeProduto: '',
        descricao: '',
        tipoProduto: 'PRODUTO',
        estoque: '',
        preco: '',
        peso: '',
        categoriaId: '',
        status: 'ATIVO',
        visivelParaComprador: true,
        possuiVariantes: false,
        usaDimensoes: false,
        dimensaoComprimento: '',
        dimensaoLargura: '',
        variantes: [],
    })
    const [categorias, setCategorias] = useState<Categoria[]>([])
    const [erro, setErro] = useState('')
    const [carregando, setCarregando] = useState(false)
    const [assinatura, setAssinatura] = useState<SubscriptionAPI | null>(null)
    const [imagensSelecionadas, setImagensSelecionadas] = useState<File[]>([])
    const [previewImagens, setPreviewImagens] = useState<string[]>([])
    const [imagensExistentes, setImagensExistentes] = useState<ProdutoImagemAPI[]>([])
    const [carregandoImagens, setCarregandoImagens] = useState(false)
    // Arquivo selecionado por variante (mesma ordem do array `form.variantes` filtrado)
    const [variantesArquivos, setVariantesArquivos] = useState<(File | null)[]>([])
    const [variantesPreview, setVariantesPreview] = useState<string[]>([])

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
        const carregarAssinatura = async () => {
            try {
                const response = await subscriptionAPI.current()
                setAssinatura(response.data ?? null)
            } catch {
                setAssinatura(null)
            }
        }

        carregarAssinatura()
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
                    tipoProduto: (produto.tipoProduto ?? 'PRODUTO') as 'PRODUTO' | 'SERVICO',
                    estoque: String(produto.estoque ?? ''),
                    preco: produto.preco != null ? String(produto.preco) : '',
                    peso: produto.peso != null ? String(produto.peso) : '',
                    categoriaId: String(produto.categoria?.idCategoria ?? ''),
                    status: produto.status ?? 'ATIVO',
                    visivelParaComprador: produto.visivelParaComprador ?? true,
                    possuiVariantes: Boolean(produto.possuiVariantes),
                    usaDimensoes: Boolean(produto.usaDimensoes ?? produto.dimensoes),
                    dimensaoComprimento: produto.dimensaoComprimento != null ? String(produto.dimensaoComprimento) : '',
                    dimensaoLargura: produto.dimensaoLargura != null ? String(produto.dimensaoLargura) : '',
                    variantes: (produto.variantes ?? []).map((variante: any) => ({
                        id: `${variante.idProduto ?? variante.id ?? Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
                        nomeProduto: variante.nomeProduto ?? '',
                        estoque: String(variante.estoque ?? ''),
                        preco: variante.preco != null ? String(variante.preco) : '',
                        descricaoVariacao: variante.descricaoVariacao ?? variante.descricao ?? '',
                    })),
                })
                // Inicializa arrays de imagens das variantes (sem arquivos por enquanto)
                const qtdVar = (produto.variantes ?? []).length
                setVariantesArquivos(Array(qtdVar).fill(null))
                setVariantesPreview(Array(qtdVar).fill(''))
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

    const atualizarTipoProduto = (tipoProduto: ProdutoForm['tipoProduto']) => {
        setForm((atual) => ({
            ...atual,
            tipoProduto,
            estoque: tipoProduto === 'SERVICO' ? '0' : atual.estoque,
        }))
    }

    const limiteImagensPermitidas = form.possuiVariantes ? 1 : LIMITE_IMAGENS_PRODUTO

    const atualizarPossuiVariantes = (possuiVariantes: boolean) => {
        setForm((atual) => ({
            ...atual,
            possuiVariantes,
            variantes: possuiVariantes && atual.variantes.length === 0 ? [criarVariacaoVazia()] : atual.variantes,
        }))
        if (possuiVariantes && variantesArquivos.length === 0) {
            setVariantesArquivos([null])
            setVariantesPreview([''])
        }
    }

    const adicionarVariacao = () => {
        setForm((atual) => ({
            ...atual,
            variantes: [...atual.variantes, criarVariacaoVazia()],
        }))
        setVariantesArquivos((atuais) => [...atuais, null])
        setVariantesPreview((atuais) => [...atuais, ''])
    }

    const atualizarVariacao = (indice: number, campo: keyof Omit<VariacaoForm, 'id'>, valor: string) => {
        setForm((atual) => ({
            ...atual,
            variantes: atual.variantes.map((variante, posicao) => (posicao === indice ? { ...variante, [campo]: valor } : variante)),
        }))
    }

    const removerVariacao = (indice: number) => {
        setForm((atual) => ({
            ...atual,
            variantes: atual.variantes.filter((_, posicao) => posicao !== indice),
        }))
        setVariantesArquivos((atuais) => {
            const copia = atuais.slice()
            copia.splice(indice, 1)
            return copia
        })
        setVariantesPreview((atuais) => {
            const copia = atuais.slice()
            const removed = copia.splice(indice, 1)
            if (removed[0]) URL.revokeObjectURL(removed[0])
            return copia
        })
    }

    // Atualiza estado de arquivo e preview associado a uma variante
    const atualizarImagemVariacao = async (indice: number, event: ChangeEvent<HTMLInputElement>) => {
        const arquivo = event.target.files?.[0] ?? null
        if (!arquivo) return

        const validacao = await validateImageFile(arquivo, 'produto')
        if (validacao) {
            setErro(validacao)
            return
        }

        setVariantesArquivos((atuais) => {
            const copia = [...atuais]
            copia[indice] = arquivo
            return copia
        })

        setVariantesPreview((atuais) => {
            const copia = [...atuais]
            // cria URL de preview e libera antiga
            if (copia[indice]) URL.revokeObjectURL(copia[indice])
            copia[indice] = URL.createObjectURL(arquivo)
            return copia
        })
    }

    const removerImagemVariacao = (indice: number) => {
        setVariantesArquivos((atuais) => {
            const copia = [...atuais]
            copia[indice] = null
            return copia
        })
        setVariantesPreview((atuais) => {
            const copia = [...atuais]
            if (copia[indice]) URL.revokeObjectURL(copia[indice])
            copia[indice] = ''
            return copia
        })
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

        const limiteRestante = Math.max(0, limiteImagensPermitidas - imagensExistentes.length)

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

    const singleFileInputRef = useRef<HTMLInputElement | null>(null)

    const abrirSelecionarImagemUnica = () => {
        singleFileInputRef.current?.click()
    }

    const adicionarImagem = async (event: ChangeEvent<HTMLInputElement>) => {
        const arquivo = event.target.files?.[0]
        event.target.value = ''

        if (!arquivo) {
            return
        }

        const limiteRestante = Math.max(0, limiteImagensPermitidas - imagensExistentes.length - imagensSelecionadas.length)
        if (limiteRestante <= 0) {
            setErro(`Você já atingiu o limite de ${LIMITE_IMAGENS_PRODUTO} imagens por anúncio.`)
            return
        }

        const validacao = await validateImageFile(arquivo, 'produto')
        if (validacao) {
            setErro(validacao)
            return
        }

        // Adiciona sem sobrescrever as imagens já selecionadas
        setImagensSelecionadas((atuais) => [...atuais, arquivo].slice(0, limiteRestante + atuais.length))
        setPreviewImagens((atuais) => [...atuais, URL.createObjectURL(arquivo)])
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
        } catch (err: any) {
            if (err?.response?.status === 403) {
                setErro('Acesso negado. Faça login novamente para cadastrar produtos.')
            } else {
                setErro(err.response?.data?.message || (produtoIdEdicao ? 'Erro ao atualizar produto' : 'Erro ao cadastrar produto'))
            }
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
            if (form.nomeProduto.trim().length > 40) {
                setErro('Nome do produto deve ter no máximo 40 caracteres')
                return
            }
            if (form.descricao.trim().length > 200) {
                setErro('Descrição do produto deve ter no máximo 200 caracteres')
                return
            }
            if (!form.tipoProduto) {
                setErro('Selecione se o anúncio é de produto ou serviço')
                return
            }
            // Se o anúncio possui variantes, o estoque do produto principal
            // é calculado a partir das variantes — não validar o campo
            // `form.estoque` nesse caso para evitar falso-positivo.
            if (!form.possuiVariantes) {
                // Validação apenas para anúncios sem variantes (produto único)
                if (!form.estoque.trim() || Number(form.estoque) < 0 || Number.isNaN(Number(form.estoque))) {
                    setErro('Estoque deve ser um número válido e maior ou igual a zero')
                    return
                }
            }
            // Quando o anúncio possui variantes, o preço do anúncio principal
            // é calculado pelas variantes — não validar o campo `form.preco` aqui.
            if (!form.possuiVariantes) {
                if (!form.preco.trim() || Number(form.preco.replace(',', '.')) <= 0 || Number.isNaN(Number(form.preco.replace(',', '.')))) {
                    setErro('Preço deve ser um valor positivo')
                    return
                }
            }
            if (form.peso.trim() && (Number(form.peso.replace(',', '.')) <= 0 || Number.isNaN(Number(form.peso.replace(',', '.'))))) {
                setErro('Peso deve ser um valor positivo')
                return
            }
            if (!form.categoriaId) {
                setErro('Categoria é obrigatória')
                return
            }
            if (form.tipoProduto === 'SERVICO' && Number(form.estoque) !== 0) {
                setErro('Serviços não usam estoque. O valor foi ajustado para 0.')
                return
            }

            if (form.possuiVariantes) {
                const variantesValidas = form.variantes.filter((variante) => variante.nomeProduto.trim())

                if (!variantesValidas.length) {
                    setErro('Informe ao menos uma variante para este anúncio')
                    return
                }

                for (const variante of variantesValidas) {
                    const estoqueVariante = Number(variante.estoque)
                    const precoVariante = Number(variante.preco.replace(',', '.'))

                    if (!variante.nomeProduto.trim()) {
                        setErro('Cada variante precisa ter um nome')
                        return
                    }
                    if (Number.isNaN(estoqueVariante) || estoqueVariante < 0) {
                        setErro('O estoque de cada variante deve ser um número válido')
                        return
                    }
                    if (Number.isNaN(precoVariante) || precoVariante <= 0) {
                        setErro('O preço de cada variante deve ser um valor positivo')
                        return
                    }
                    if (variante.descricaoVariacao && variante.descricaoVariacao.trim().length > 100) {
                        setErro('A descrição da variante deve ter no máximo 100 caracteres')
                        return
                    }
                }
            }

            if (form.usaDimensoes) {
                const comprimento = Number(form.dimensaoComprimento.replace(',', '.'))
                const largura = Number(form.dimensaoLargura.replace(',', '.'))

                if (!form.dimensaoComprimento.trim() || Number.isNaN(comprimento) || comprimento <= 0) {
                    setErro('Comprimento deve ser um número positivo')
                    return
                }
                if (!form.dimensaoLargura.trim() || Number.isNaN(largura) || largura <= 0) {
                    setErro('Largura deve ser um número positivo')
                    return
                }
            }

                const variantesPayload = form.possuiVariantes
                    ? form.variantes
                        .filter((variante) => variante.nomeProduto.trim())
                        .map((variante) => ({
                            nomeProduto: variante.nomeProduto.trim(),
                            estoque: Number(variante.estoque),
                            preco: Number(variante.preco.replace(',', '.')),
                            descricaoVariacao: (variante.descricaoVariacao ?? '').trim(),
                            status: 'ATIVO',
                            visivelParaComprador: true,
                            tipoProduto: form.tipoProduto,
                        }))
                    : []

                const estoqueCalculado = form.possuiVariantes
                    ? variantesPayload.reduce((total, variante) => total + Number(variante.estoque ?? 0), 0)
                    : (form.tipoProduto === 'SERVICO' ? 0 : Number(form.estoque))

                const precoCalculado = form.possuiVariantes
                    ? variantesPayload.reduce((menor, variante) => Math.min(menor, Number(variante.preco ?? 0)), variantesPayload[0]?.preco ?? 0)
                    : Number(form.preco.replace(',', '.'))

            const produto = {
                nomeProduto: form.nomeProduto.trim(),
                descricao: form.descricao.trim(),
                tipoProduto: form.tipoProduto,
                    estoque: estoqueCalculado,
                    preco: precoCalculado,
                peso: form.peso.trim() ? Number(form.peso.replace(',', '.')) : null,
                status: form.status,
                visivelParaComprador: form.visivelParaComprador,
                    possuiVariantes: form.possuiVariantes,
                usaDimensoes: form.usaDimensoes,
                dimensoes: form.usaDimensoes
                    ? `${Number(form.dimensaoLargura.replace(',', '.'))} x ${Number(form.dimensaoComprimento.replace(',', '.'))}`
                    : null,
                dimensaoComprimento: form.usaDimensoes ? Number(form.dimensaoComprimento.replace(',', '.')) : null,
                dimensaoLargura: form.usaDimensoes ? Number(form.dimensaoLargura.replace(',', '.')) : null,
                    variantes: variantesPayload,
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
                // Se houver variantes e arquivos associados a elas, enviar as imagens
                // após a criação. O backend retorna a lista de variantes criadas
                // dentro de `produtoCriado.variantes` na mesma ordem do payload.
                if (produto.possuiVariantes && produtoCriado.variantes && Array.isArray(produtoCriado.variantes)) {
                    const variantesCriadas = produtoCriado.variantes as any[]
                    // Envia arquivo correspondente à variante, se houver
                    for (let i = 0; i < variantesCriadas.length; i++) {
                        const variante = variantesCriadas[i]
                        const arquivo = variantesArquivos[i]
                        if (arquivo && variante && (variante.idProduto || variante.id)) {
                            const variantId = Number(variante.idProduto ?? variante.id)
                            try {
                                await produtoAPI.enviarImagens(variantId, [arquivo])
                            } catch (uploadErr: any) {
                                // Não interrompe o fluxo principal, mas avisa o usuário
                                console.warn('Não foi possível enviar imagem da variante', variantId, uploadErr)
                            }
                        }
                    }
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
            // Caso o produto já estivesse em edição, também pode haver imagens locais
            // associadas às variantes — enviá-las aqui ao backend correspondente.
            if (produtoIdEdicao && form.possuiVariantes && variantesArquivos.length) {
                // Obter variantes atuais do backend para mapear IDs
                try {
                    const resp = await produtoAPI.obterPorId(produtoIdEdicao!)
                    const produtoAtualizado = resp.data ?? {}
                    const variantesBack = produtoAtualizado.variantes ?? []
                    for (let i = 0; i < variantesBack.length; i++) {
                        const varBack = variantesBack[i]
                        const arquivo = variantesArquivos[i]
                        if (arquivo && varBack && (varBack.idProduto || varBack.id)) {
                            const variantId = Number(varBack.idProduto ?? varBack.id)
                            try {
                                await produtoAPI.enviarImagens(variantId, [arquivo])
                            } catch (uploadErr: any) {
                                console.warn('Falha ao enviar imagem da variante (edição)', variantId, uploadErr)
                            }
                        }
                    }
                } catch (err) {
                    console.warn('Não foi possível recuperar variantes para envio de imagens na edição', err)
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
                                <p className="mt-2 text-sm text-slate-600">{produtoIdEdicao ? 'Ajuste os dados do produto e salve a atualização.' : 'Preencha os dados do produto e anuncie no CampuShop.'}</p>
                                <div className="mt-3 flex flex-wrap items-center gap-3">
                                    <PlanBadge
                                        text={assinatura?.badgeText || assinatura?.planName || 'ESSENCIAL'}
                                        color={assinatura?.badgeColor}
                                        icon={assinatura?.badgeIcon}
                                    />
                                    <p className="text-sm text-slate-500">
                                        {assinatura?.remainingListings != null
                                            ? `${assinatura.remainingListings} anúncio(s) restante(s) no plano atual.`
                                            : 'Seu limite de anúncios é calculado a partir do plano ativo.'}
                                    </p>
                                </div>
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

                        <form onSubmit={handleSalvar} className="grid gap-6">
                            <div className="rounded-[1.5rem] border border-slate-200 bg-slate-50 p-4">
                                <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                                    <div>
                                        <h2 className="text-lg font-black tracking-tight text-slate-900">Imagens do anúncio</h2>
                                        <p className="text-sm text-slate-600">{getImageGuidance('produto')} {form.possuiVariantes ? 'Anúncios com variantes usam apenas 1 imagem no anúncio principal.' : `Você pode manter até ${LIMITE_IMAGENS_PRODUTO} imagens por anúncio.`}</p>
                                    </div>
                                    <span className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-400">1920x1350</span>
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

                                <div className="mt-4 flex items-start gap-3">
                                    <label className="flex-1 cursor-pointer flex-col gap-2 rounded-[1.25rem] border border-dashed border-slate-300 bg-white p-4 transition hover:border-slate-400 hover:bg-slate-50">
                                        <span className="text-sm font-semibold text-slate-700">Selecionar imagens do anúncio</span>
                                        <span className="text-sm text-slate-500">Qualquer formato de imagem, até 2 MB por imagem.</span>
                                        <span className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-400">Restam {Math.max(0, limiteImagensPermitidas - imagensExistentes.length - imagensSelecionadas.length)} espaço(s)</span>
                                        <input
                                            type="file"
                                            accept={getAllowedImageAccept()}
                                            multiple
                                            onChange={atualizarImagens}
                                            disabled={imagensExistentes.length >= limiteImagensPermitidas}
                                            className="sr-only"
                                        />
                                    </label>

                                    <div className="mt-1 flex items-center gap-2">
                                        <button
                                            type="button"
                                            onClick={abrirSelecionarImagemUnica}
                                            disabled={imagensExistentes.length + imagensSelecionadas.length >= limiteImagensPermitidas}
                                            className="inline-flex h-12 w-12 items-center justify-center rounded-lg border border-slate-200 bg-white text-lg font-bold text-slate-700 shadow-sm hover:bg-slate-50"
                                            aria-label="Adicionar imagem"
                                        >
                                            +
                                        </button>
                                        <input
                                            ref={singleFileInputRef}
                                            type="file"
                                            accept={getAllowedImageAccept()}
                                            onChange={adicionarImagem}
                                            className="sr-only"
                                        />
                                    </div>
                                </div>

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

                            <div className="rounded-[1.5rem] border border-slate-200 bg-white p-4 shadow-sm">
                                <div className="grid gap-4">
                                    <Input
                                        label="Nome do produto"
                                        placeholder="Ex: Lápis, Sanduíche, Mochila"
                                        value={form.nomeProduto}
                                        onChange={(e) => atualizarCampo('nomeProduto', e.target.value)}
                                        maxLength={40}
                                    />

                                    <div className="flex flex-col gap-2">
                                        <label className="text-sm font-semibold text-slate-700">Descrição do produto</label>
                                        <textarea
                                            placeholder="Descreva o produto"
                                            value={form.descricao}
                                            maxLength={200}
                                            onChange={(e) => atualizarCampo('descricao', e.target.value)}
                                            className="min-h-32 rounded-2xl border border-slate-200 px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-blue-500"
                                        />
                                        <p className="text-xs text-slate-500">Limite de 200 caracteres.</p>
                                    </div>

                                    <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                                        <div>
                                            <label className="mb-2 block text-sm font-semibold text-slate-700">Tipo do anúncio</label>
                                            <select
                                                value={form.tipoProduto}
                                                onChange={(e) => atualizarTipoProduto(e.target.value as ProdutoForm['tipoProduto'])}
                                                className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                                            >
                                                <option value="PRODUTO">Produto</option>
                                                <option value="SERVICO">Serviço</option>
                                            </select>
                                        </div>

                                        {form.possuiVariantes ? (
                                            <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4 text-sm text-slate-600">
                                                <p className="font-semibold text-slate-900">Estoque do anúncio principal</p>
                                                <p className="mt-1">Será calculado automaticamente pela soma das variantes cadastradas.</p>
                                            </div>
                                        ) : (
                                            <Input
                                                label="Quantidade de estoque"
                                                placeholder="0"
                                                type="number"
                                                min={0}
                                                step={1}
                                                value={form.tipoProduto === 'SERVICO' ? '0' : form.estoque}
                                                onChange={(e) => atualizarCampo('estoque', e.target.value)}
                                                disabled={form.tipoProduto === 'SERVICO'}
                                            />
                                        )}
                                    </div>

                                    <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                                        {form.possuiVariantes ? (
                                            <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4 text-sm text-slate-600">
                                                <p className="font-semibold text-slate-900">Preço do anúncio principal</p>
                                                <p className="mt-1">Será calculado pelo menor preço entre as variantes.</p>
                                            </div>
                                        ) : (
                                            <Input
                                                label="Preço"
                                                placeholder="49.90"
                                                type="number"
                                                min={0}
                                                step="0.01"
                                                value={form.preco}
                                                onChange={(e) => atualizarCampo('preco', e.target.value)}
                                            />
                                        )}

                                        <div>
                                            <label className="mb-2 block text-sm font-semibold text-slate-700">Categoria</label>
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

                                    <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
                                        <label className="inline-flex items-center gap-3 text-sm font-medium text-slate-700">
                                            <input
                                                type="checkbox"
                                                checked={form.usaDimensoes}
                                                onChange={(e) => setForm((atual) => ({ ...atual, usaDimensoes: e.target.checked }))}
                                                className="h-4 w-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500"
                                            />
                                            Precisa informar dimensões?
                                        </label>
                                        <p className="mt-2 text-sm text-slate-500">Ative esta opção quando o produto precisar de medidas físicas.</p>
                                    </div>

                                    <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
                                        <label className="inline-flex items-center gap-3 text-sm font-medium text-slate-700">
                                            <input
                                                type="checkbox"
                                                checked={form.possuiVariantes}
                                                onChange={(e) => atualizarPossuiVariantes(e.target.checked)}
                                                className="h-4 w-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500"
                                            />
                                            Este anúncio tem variantes
                                        </label>
                                        <p className="mt-2 text-sm text-slate-500">Use isso para roupas, sabores, tamanhos ou qualquer anúncio com escolha de opção antes da compra.</p>
                                    </div>

                                    {form.possuiVariantes ? (
                                        <div className="rounded-[1.5rem] border border-blue-200 bg-blue-50 p-4">
                                            <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                                                <div>
                                                    <h3 className="text-lg font-black tracking-tight text-slate-900">Variantes do produto</h3>
                                                    <p className="text-sm text-slate-600">Cada variante vira um item comprável dentro do anúncio principal.</p>
                                                </div>
                                                <button
                                                    type="button"
                                                    onClick={adicionarVariacao}
                                                    className="inline-flex items-center rounded-2xl bg-slate-900 px-4 py-2 text-sm font-semibold text-white transition hover:opacity-95"
                                                >
                                                    Adicionar variante
                                                </button>
                                            </div>

                                            <div className="mt-4 space-y-3">
                                                {form.variantes.map((variante, indice) => (
                                                    <div key={variante.id} className="rounded-[1.25rem] border border-slate-200 bg-white p-4">
                                                        <div className="flex items-start justify-between gap-3">
                                                            <div>
                                                                <p className="text-sm font-semibold text-slate-700">Variante {indice + 1}</p>
                                                                <p className="text-xs text-slate-500">Nome, preço e estoque desta opção</p>
                                                            </div>
                                                            <button
                                                                type="button"
                                                                onClick={() => removerVariacao(indice)}
                                                                className="rounded-xl border border-red-200 px-3 py-2 text-xs font-semibold text-red-700 transition hover:bg-red-50"
                                                            >
                                                                Remover
                                                            </button>
                                                        </div>

                                                        <div className="mt-4 grid gap-4 md:grid-cols-3">
                                                            <Input
                                                                label="Nome da variante"
                                                                placeholder="Ex: Tamanho M, Sabor Chocolate"
                                                                value={variante.nomeProduto}
                                                                onChange={(e) => atualizarVariacao(indice, 'nomeProduto', e.target.value)}
                                                            />
                                                            <div>
                                                                <label className="mb-2 block text-sm font-semibold text-slate-700">Descrição da variante (opcional)</label>
                                                                <input
                                                                    type="text"
                                                                    maxLength={100}
                                                                    placeholder="Breve descrição (até 100 caracteres)"
                                                                    value={variante.descricaoVariacao ?? ''}
                                                                    onChange={(e) => atualizarVariacao(indice, 'descricaoVariacao', e.target.value)}
                                                                    className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 focus:border-blue-500 focus:outline-none"
                                                                />
                                                                <p className="text-xs text-slate-500 mt-1">Limite de 100 caracteres.</p>
                                                            </div>
                                                            <Input
                                                                label="Estoque da variante"
                                                                placeholder="0"
                                                                type="number"
                                                                min={0}
                                                                step={1}
                                                                value={variante.estoque}
                                                                onChange={(e) => atualizarVariacao(indice, 'estoque', e.target.value)}
                                                            />
                                                            <Input
                                                                label="Preço da variante"
                                                                placeholder="49.90"
                                                                type="number"
                                                                min={0}
                                                                step="0.01"
                                                                value={variante.preco}
                                                                onChange={(e) => atualizarVariacao(indice, 'preco', e.target.value)}
                                                            />
                                                        </div>
                                                        <div className="mt-3">
                                                            <label className="text-sm font-semibold text-slate-700">Imagem da variante (opcional)</label>
                                                            <div className="mt-2 flex items-center gap-3">
                                                                <label className="cursor-pointer rounded-lg border border-dashed border-slate-300 bg-white px-3 py-2 text-sm text-slate-700">
                                                                    Selecionar imagem
                                                                    <input
                                                                        type="file"
                                                                        accept={getAllowedImageAccept()}
                                                                        onChange={(e) => atualizarImagemVariacao(indice, e)}
                                                                        className="sr-only"
                                                                    />
                                                                </label>
                                                                {variantesPreview[indice] ? (
                                                                    <div className="relative">
                                                                        <img src={variantesPreview[indice]} alt={`Preview variante ${indice + 1}`} className="h-20 w-28 object-cover rounded" />
                                                                        <button type="button" onClick={() => removerImagemVariacao(indice)} className="absolute right-0 top-0 rounded-full bg-white p-1 text-sm">×</button>
                                                                    </div>
                                                                ) : (
                                                                    <span className="text-sm text-slate-500">Nenhuma imagem</span>
                                                                )}
                                                            </div>
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    ) : null}

                                    {form.usaDimensoes ? (
                                        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                                            <Input
                                                label="Largura (cm)"
                                                placeholder="Ex: 20"
                                                type="number"
                                                min={0.01}
                                                step="0.01"
                                                value={form.dimensaoLargura}
                                                onChange={(e) => atualizarCampo('dimensaoLargura', e.target.value)}
                                                required
                                            />
                                            <Input
                                                label="Comprimento (cm)"
                                                placeholder="Ex: 30"
                                                type="number"
                                                min={0.01}
                                                step="0.01"
                                                value={form.dimensaoComprimento}
                                                onChange={(e) => atualizarCampo('dimensaoComprimento', e.target.value)}
                                                required
                                            />
                                        </div>
                                    ) : null}

                                    <Input
                                        label="Peso (opcional)"
                                        placeholder="Ex: 0.5"
                                        type="number"
                                        min={0.01}
                                        step="0.01"
                                        value={form.peso}
                                        onChange={(e) => atualizarCampo('peso', e.target.value)}
                                    />
                                </div>
                            </div>

                            <Button
                                type="submit"
                                loading={carregando}
                                className="w-full rounded-2xl py-3.5 text-base shadow-lg shadow-blue-600/20"
                                disabled={carregando || (!produtoIdEdicao && assinatura?.remainingListings === 0)}
                            >
                                {produtoIdEdicao ? 'Salvar alterações' : 'Cadastrar produto'}
                            </Button>
                            {!produtoIdEdicao && assinatura?.remainingListings === 0 ? (
                                <div className="rounded-2xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800">
                                    Limite de anúncios atingido para o plano atual. Faça upgrade para cadastrar mais produtos.
                                </div>
                            ) : null}
                        </form>
                    </div>
                </Card>
            </div>
        </div>
    )
}
