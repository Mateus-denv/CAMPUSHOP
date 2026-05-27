import { apiBaseUrl } from '@/lib/api'

const MAX_BYTES = 2 * 1024 * 1024

type ImageKind = 'perfil' | 'produto'

type ImageRule = {
  kind: ImageKind
  ratio: number
  maxWidth: number
  maxHeight: number
  label: string
}

const IMAGE_RULES: Record<ImageKind, ImageRule> = {
  perfil: {
    kind: 'perfil',
    ratio: 4 / 5,
    maxWidth: 1080,
    maxHeight: 1350,
    label: 'foto de perfil',
  },
  produto: {
    kind: 'produto',
    ratio: 0,
    maxWidth: 1920,
    maxHeight: 1350,
    label: 'imagem do anúncio',
  },
}

export function buildApiImageUrl(path: string) {
  if (!path) {
    return ''
  }

  if (path.startsWith('http://') || path.startsWith('https://') || path.startsWith('blob:') || path.startsWith('data:')) {
    return path
  }

  return `${apiBaseUrl}${path}`
}

export function buildUserPhotoUrl(userId?: number | null, version?: number) {
  if (!userId) {
    return ''
  }

  return buildApiImageUrl(`/api/usuarios/${userId}/foto${version ? `?v=${version}` : ''}`)
}

export function buildProductImageUrl(productId?: number | null, imageId?: number | null, version?: number) {
  if (!productId) {
    return ''
  }

  const path = imageId
    ? `/api/produtos/${productId}/imagens/${imageId}`
    : `/api/produtos/${productId}/imagens/principal`

  return buildApiImageUrl(`${path}${version ? `?v=${version}` : ''}`)
}

export async function validateImageFile(file: File, kind: ImageKind) {
  const rule = IMAGE_RULES[kind]

  if (!file) {
    return `Selecione uma ${rule.label}.`
  }

  if (file.size > MAX_BYTES) {
    return 'Cada imagem deve ter no máximo 2 MB.'
  }

  const contentType = file.type.toLowerCase()
  if (!contentType.startsWith('image/')) {
    return 'Selecione uma imagem válida.'
  }

  const dimensions = await readImageDimensions(file)

  if (dimensions.width > rule.maxWidth || dimensions.height > rule.maxHeight) {
    return `A ${rule.label} deve respeitar no máximo ${rule.maxWidth}x${rule.maxHeight}px.`
  }

  if (kind === 'perfil') {
    const ratio = dimensions.width / dimensions.height
    const ratioDiff = Math.abs(ratio - rule.ratio)

    if (ratioDiff > 0.03) {
      return `A ${rule.label} deve seguir o formato 4:5.`
    }
  }

  return null
}

export async function validateImageBasics(file: File) {
  if (!file) {
    return 'Selecione uma imagem válida.'
  }

  if (file.size > MAX_BYTES) {
    return 'Cada imagem deve ter no máximo 2 MB.'
  }

  const contentType = file.type.toLowerCase()
  if (!contentType.startsWith('image/')) {
    return 'Selecione uma imagem válida.'
  }

  return null
}

export function getImageGuidance(kind: ImageKind) {
  return IMAGE_RULES[kind].kind === 'perfil'
    ? 'Use qualquer formato de imagem, até 1080x1350px, com no máximo 2 MB.'
    : 'Use qualquer formato de imagem, até 1920x1350px, com no máximo 2 MB.'
}

export function getAllowedImageAccept() {
  return 'image/*'
}

function readImageDimensions(file: File) {
  return new Promise<{ width: number; height: number }>((resolve, reject) => {
    const reader = new FileReader()

    reader.onerror = () => reject(new Error('Não foi possível ler a imagem.'))
    reader.onload = () => {
      const image = new Image()

      image.onload = () => resolve({ width: image.width, height: image.height })
      image.onerror = () => reject(new Error('Não foi possível obter as dimensões da imagem.'))
      image.src = String(reader.result)
    }

    reader.readAsDataURL(file)
  })
}