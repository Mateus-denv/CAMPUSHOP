import axios, { AxiosInstance } from 'axios'

const base = (import.meta.env && import.meta.env.VITE_API_URL)
  ? String(import.meta.env.VITE_API_URL)
  : 'http://localhost:8080'

const api: AxiosInstance = axios.create({
  baseURL: base,
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
