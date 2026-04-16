import axios, { AxiosInstance } from 'axios'

// Configuração centralizada do cliente HTTP Axios
// Todas as requisições para o backend passam por aqui

// Instância Axios configurada com URL base do backend Spring Boot
const api: AxiosInstance = axios.create({
  baseURL: 'http://localhost:8080',
})

// Interceptador de REQUEST: Adiciona token JWT automaticamente
api.interceptors.request.use((config) => {
  // Recupera token JWT do localStorage (persistido entre sessões)
  const token = localStorage.getItem('token')
  config.headers = config.headers ?? {}

  // Se existe token, adiciona no header Authorization
  // Formato: "Bearer <token-jwt>"
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }

  return config
})

// Interceptador de RESPONSE: Trata erros de autenticação
api.interceptors.response.use(
  (response) => {
    // Respostas bem-sucedidas passam direto
    return response
  },
  (error) => {
    // Se backend retorna 401 (não autorizado/token expirado)
    // Remove token do localStorage para forçar novo login
    if (error.response?.status === 401) {
      localStorage.removeItem('token')
    }
    // Rejeita a Promise para que o componente possa tratar o erro
    return Promise.reject(error)
  }
)

export default api
