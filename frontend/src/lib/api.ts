import axios, { AxiosInstance } from 'axios'

export const apiBaseUrl = (import.meta.env && import.meta.env.VITE_API_URL)
  ? String(import.meta.env.VITE_API_URL)
  : 'http://localhost:8080'

const api: AxiosInstance = axios.create({
  baseURL: apiBaseUrl,
})

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token')
  config.headers = config.headers ?? {}

  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }

  // DEBUG: logar info de autorização para diagnosticar 403 em criação/envio de imagens
  try {
    const url = String(config.url || '')
    const method = String(config.method || '').toLowerCase()
    if (url.includes('/api/produtos') && (method === 'post' || method === 'put')) {
      // eslint-disable-next-line no-console
      console.debug('[DEBUG][api] Enviando', method.toUpperCase(), url, 'Authorization=', config.headers.Authorization)
    }
  } catch (e) {
    // ignore
  }

  return config
})

api.interceptors.response.use(
  (response) => {
    return response
  },
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token')
    }
    return Promise.reject(error)
  }
)

export default api
