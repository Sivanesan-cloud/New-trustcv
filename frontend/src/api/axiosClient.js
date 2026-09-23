import axios from 'axios'

const BASE = import.meta.env.VITE_API_URL || 'http://localhost:8000'

const api = axios.create({
  baseURL: BASE,
  timeout: 120_000,
  headers: { 'Content-Type': 'application/json' },
})

// Attach JWT on every request
api.interceptors.request.use(config => {
  const token = localStorage.getItem('trustcv_token')
  if (token) config.headers.Authorization = `Bearer ${token}`
  return config
})

// On 401 → clear auth and reload
api.interceptors.response.use(
  res => res,
  err => {
    if (err.response?.status === 401) {
      localStorage.removeItem('trustcv_token')
      localStorage.removeItem('trustcv_user')
      window.location.href = '/'
    }
    return Promise.reject(err)
  }
)

export default api
