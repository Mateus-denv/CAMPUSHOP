import { apiBaseUrl } from '@/lib/api'

const MAX_BYTES = 2 * 1024 * 1024
const ALLOWED_MIME_TYPES = new Set(['image/jpeg', 'image/jpg', 'image/webp', 'image/avif'])

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
    ratio: 16 / 9,
    maxWidth: 1920,
    maxHeight: 1080,
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
  const fileName = file.name.toLowerCase()
  const hasAllowedMime = ALLOWED_MIME_TYPES.has(contentType)
  const hasAllowedExtension = ['.jpg', '.jpeg', '.webp', '.avif'].some((extension) => fileName.endsWith(extension))

  if (!hasAllowedMime && !hasAllowedExtension) {
    return 'Formato inválido. Use JPG, JPEG, WebP ou AVIF.'
  }

  const dimensions = await readImageDimensions(file)
  const ratio = dimensions.width / dimensions.height
  const ratioDiff = Math.abs(ratio - rule.ratio)

  if (dimensions.width > rule.maxWidth || dimensions.height > rule.maxHeight) {
    return `A ${rule.label} deve respeitar no máximo ${rule.maxWidth}x${rule.maxHeight}px.`
  }

  if (ratioDiff > 0.03) {
    return `A ${rule.label} deve seguir o formato ${kind === 'perfil' ? '4:5' : '16:9'}.`
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
  const fileName = file.name.toLowerCase()
  const hasAllowedMime = ALLOWED_MIME_TYPES.has(contentType)
  const hasAllowedExtension = ['.jpg', '.jpeg', '.webp', '.avif'].some((extension) => fileName.endsWith(extension))

  if (!hasAllowedMime && !hasAllowedExtension) {
    return 'Formato inválido. Use JPG, JPEG, WebP ou AVIF.'
  }

  return null
}

export function getImageGuidance(kind: ImageKind) {
  return IMAGE_RULES[kind].kind === 'perfil'
    ? 'Use imagens 4:5, até 1080x1350px, com no máximo 2 MB.'
    : 'Use imagens 16:9, até 1920x1080px, com no máximo 2 MB.'
}

export function getAllowedImageAccept() {
  return 'image/jpeg,image/jpg,image/webp,image/avif'
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