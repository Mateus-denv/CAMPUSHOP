import { ImageCropModal } from '@/components/ImageCropModal'
import { Layout } from '@/components/Layout'
import { MediaImage } from '@/components/MediaImage'
import { PlanBadge } from '@/components/PlanBadge'
import { Button, Card, Input } from '@/components/UI'
import { subscriptionAPI, usuarioAPI, type SubscriptionAPI } from '@/lib/api-service'
import { buildUserPhotoUrl, getAllowedImageAccept, getImageGuidance, validateImageBasics } from '@/lib/image-utils'
import { useAuthStore } from '@/store'
import { AlertCircle, Camera, Save } from 'lucide-react'
import { useEffect, useMemo, useState, type ChangeEvent, type FormEvent } from 'react'

export function EditarContaPage() {
  const { usuario, setUsuario } = useAuthStore()
  const [nomeCompleto, setNomeCompleto] = useState('')
  const [email, setEmail] = useState('')
  const [fotoSelecionada, setFotoSelecionada] = useState<File | null>(null)
  const [fotoPreview, setFotoPreview] = useState('')
  const [fotoVersao, setFotoVersao] = useState(0)
  const [fotoParaRecorte, setFotoParaRecorte] = useState<File | null>(null)
  const [erro, setErro] = useState('')
  const [mensagem, setMensagem] = useState('')
  const [salvando, setSalvando] = useState(false)
  const [assinatura, setAssinatura] = useState<SubscriptionAPI | null>(null)

  useEffect(() => {
    const carregarPlano = async () => {
      try {
        const response = await subscriptionAPI.current()
        setAssinatura(response.data ?? null)
      } catch {
        setAssinatura(null)
      }
    }

    setNomeCompleto(usuario?.nomeCompleto || usuario?.nome || '')
    setEmail(usuario?.email || '')
    setFotoVersao((atual) => atual + 1)
    carregarPlano()
  }, [usuario])

  useEffect(() => {
    return () => {
      if (fotoPreview) {
        URL.revokeObjectURL(fotoPreview)
      }
    }
  }, [fotoPreview])

  const fotoAtualUrl = useMemo(() => buildUserPhotoUrl(usuario?.id, fotoVersao), [fotoVersao, usuario?.id])
  const imagemExibida = fotoPreview || fotoAtualUrl

  const handleFotoChange = async (event: ChangeEvent<HTMLInputElement>) => {
    const arquivo = event.target.files?.[0] ?? null
    setErro('')
    setMensagem('')

    if (!arquivo) {
      setFotoSelecionada(null)
      setFotoPreview('')
      setFotoParaRecorte(null)
      return
    }

    const validacao = await validateImageBasics(arquivo)
    if (validacao) {
      setErro(validacao)
      event.target.value = ''
      setFotoSelecionada(null)
      setFotoPreview('')
      setFotoParaRecorte(null)
      return
    }

    setFotoParaRecorte(arquivo)
    event.target.value = ''
  }

  const aplicarFotoRecortada = (arquivoRecortado: File) => {
    if (fotoPreview) {
      URL.revokeObjectURL(fotoPreview)
    }

    setFotoSelecionada(arquivoRecortado)
    setFotoPreview(URL.createObjectURL(arquivoRecortado))
    setFotoParaRecorte(null)
  }

  const cancelarRecorte = () => {
    setFotoParaRecorte(null)
  }

  const limparFoto = () => {
    if (fotoPreview) {
      URL.revokeObjectURL(fotoPreview)
    }

    setFotoSelecionada(null)
    setFotoPreview('')
  }

  const salvarConta = async (event: FormEvent) => {
    event.preventDefault()
    setErro('')
    setMensagem('')

    if (!nomeCompleto.trim()) {
      setErro('Nome completo é obrigatório')
      return
    }

    if (!email.trim() || !email.includes('@')) {
      setErro('Informe um email válido')
      return
    }

    setSalvando(true)

    try {
      const respostaPerfil = await usuarioAPI.atualizarPerfil(nomeCompleto.trim(), email.trim().toLowerCase())
      const usuarioAtualizado = respostaPerfil.data?.user ?? respostaPerfil.data
      const novoToken = respostaPerfil.data?.token

      setUsuario(usuarioAtualizado)
      localStorage.setItem('user', JSON.stringify(usuarioAtualizado))

      if (novoToken) {
        localStorage.setItem('token', novoToken)
      }

      if (fotoSelecionada) {
        await usuarioAPI.atualizarFotoPerfil(fotoSelecionada)
        setFotoSelecionada(null)
        setFotoPreview('')
        setFotoVersao((atual) => atual + 1)
      }

      setMensagem(fotoSelecionada ? 'Conta e foto atualizadas com sucesso!' : 'Conta atualizada com sucesso!')
    } catch (error: any) {
      setErro(error?.response?.data?.message || 'Não foi possível atualizar a conta.')
    } finally {
      setSalvando(false)
    }
  }

  return (
    <Layout>
      <section className="grid gap-6 lg:grid-cols-[0.95fr_1.05fr]">
        <Card className="rounded-[2rem] border border-slate-200 bg-white shadow-sm">
          <div className="p-6 sm:p-8">
            <div className="flex items-center gap-4">
              <div className="h-20 w-20 overflow-hidden rounded-[1.75rem] border border-slate-200 bg-slate-50">
                <MediaImage
                  src={imagemExibida}
                  alt={nomeCompleto || 'Foto de perfil'}
                  fallbackLabel="Sem foto"
                  className="h-20 w-20"
                  imageClassName="h-20 w-20"
                />
              </div>
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-400">Conta</p>
                <h1 className="text-3xl font-black tracking-tight text-slate-900">Editar conta</h1>
                <p className="mt-1 text-sm text-slate-500">Atualize dados pessoais e foto de perfil em uma página dedicada.</p>
                <div className="mt-3">
                  <PlanBadge text={assinatura?.badgeText || assinatura?.planName || 'ESSENCIAL'} color={assinatura?.badgeColor} icon={assinatura?.badgeIcon} />
                </div>
              </div>
            </div>

            <div className="mt-6 rounded-[1.25rem] border border-blue-100 bg-blue-50 p-4 text-sm text-blue-800">
              {getImageGuidance('perfil')}
            </div>

            <label className="mt-5 flex cursor-pointer flex-col gap-2 rounded-[1.5rem] border border-dashed border-slate-300 bg-slate-50 p-5 transition hover:border-slate-400 hover:bg-slate-100">
              <span className="inline-flex items-center gap-2 text-sm font-semibold text-slate-700">
                <Camera className="h-4 w-4" />
                Selecionar foto de perfil
              </span>
              <span className="text-sm text-slate-500">Qualquer formato de imagem, até 2 MB.</span>
              <input
                type="file"
                accept={getAllowedImageAccept()}
                onChange={handleFotoChange}
                className="sr-only"
              />
            </label>

            {fotoSelecionada ? (
              <div className="mt-4 rounded-[1.25rem] border border-slate-200 bg-white p-4 text-sm text-slate-600">
                <p className="font-semibold text-slate-900">Foto selecionada</p>
                <p className="mt-1">{fotoSelecionada.name}</p>
                <button type="button" onClick={limparFoto} className="mt-3 rounded-xl border border-slate-200 px-3 py-2 font-semibold text-slate-700 transition hover:bg-slate-50">
                  Remover foto
                </button>
              </div>
            ) : null}
          </div>
        </Card>

        <Card className="rounded-[2rem] border border-slate-200 bg-white shadow-sm">
          <form onSubmit={salvarConta} className="p-6 sm:p-8">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-400">Dados</p>
              <h2 className="text-2xl font-black tracking-tight text-slate-900">Informações da conta</h2>
              <p className="mt-2 text-sm text-slate-500">A edição fica concentrada aqui para facilitar futuras funções de conta.</p>
            </div>

            {erro ? (
              <div className="mt-5 flex gap-3 rounded-[1.25rem] border border-red-200 bg-red-50 p-4">
                <AlertCircle className="mt-0.5 h-5 w-5 text-red-600" />
                <p className="text-sm text-red-800">{erro}</p>
              </div>
            ) : null}

            {mensagem ? (
              <div className="mt-5 rounded-[1.25rem] border border-emerald-200 bg-emerald-50 p-4 text-sm text-emerald-700">
                {mensagem}
              </div>
            ) : null}

            <div className="mt-6 grid gap-4">
              <Input
                label="Nome completo"
                value={nomeCompleto}
                onChange={(event) => setNomeCompleto(event.target.value)}
                placeholder="Seu nome"
              />

              <Input
                label="Email"
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                placeholder="voce@exemplo.com"
              />

              <div className="grid gap-3 rounded-[1.25rem] border border-slate-200 bg-slate-50 p-4 text-sm text-slate-600">
                <p><span className="font-semibold text-slate-900">R.A:</span> {usuario?.ra || 'Não informado'}</p>
                <p><span className="font-semibold text-slate-900">URL da foto:</span> {fotoSelecionada ? 'Nova imagem será enviada no salvamento' : 'Mantida a imagem atual do perfil'}</p>
              </div>
            </div>

            <div className="mt-6 flex flex-col gap-3 sm:flex-row">
              <Button type="submit" loading={salvando} className="flex-1 rounded-2xl py-3.5 text-base shadow-lg shadow-blue-600/20">
                <Save className="mr-2 h-4 w-4" />
                Salvar alterações
              </Button>
            </div>
          </form>
        </Card>
      </section>

      <ImageCropModal
        open={Boolean(fotoParaRecorte)}
        file={fotoParaRecorte}
        aspectRatio={4 / 5}
        title="Ajuste sua foto de perfil"
        helperText={getImageGuidance('perfil')}
        confirmLabel="Salvar recorte"
        onCancel={cancelarRecorte}
        onConfirm={aplicarFotoRecortada}
      />
    </Layout>
  )
}