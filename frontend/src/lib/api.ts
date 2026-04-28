import axios, { AxiosInstance } from 'axios'

// Em produção (frontend servido pelo Spring Boot na mesma origem),
// usa URL relativa. Em dev, o proxy do Vite encaminha /api/* para localhost:8080.
const api: AxiosInstance = axios.create({
  baseURL: '',
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
