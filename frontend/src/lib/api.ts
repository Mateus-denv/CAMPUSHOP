import axios, { AxiosInstance } from 'axios'

// Usa a variável de ambiente VITE_API_URL em produção; mantém fallback para desenvolvimento local
const apiBaseUrl = import.meta.env.VITE_API_URL ?? 'http://localhost:8080'

const api: AxiosInstance = axios.create({
  baseURL: apiBaseUrl,
})

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token')
  config.headers = config.headers ?? {}

  if (token) {
    config.headers.Authorization = `Bearer ${token}`
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
