import axios from 'axios'

/**
 * Pre-configured Axios instance pointing to the FastAPI backend.
 * Proxy in vite.config.js forwards /api → http://localhost:8000
 * so we keep baseURL as '' (relative) for dev, or use env var for prod.
 */
const api = axios.create({
  baseURL: '',   // Vite proxy handles /api → localhost:8000
  timeout: 120000, // 120 seconds to allow full verification of 55,403 dataset files
  headers: { 'Content-Type': 'application/json' },
})


// ── Request interceptor: attach JWT token ───────────────────────────────────
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('trustcv_token')
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }
    return config
  },
  (error) => Promise.reject(error)
)

// ── Response interceptor: handle auth errors ────────────────────────────────
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Token expired – clear storage and reload to show login
      localStorage.removeItem('trustcv_token')
      localStorage.removeItem('trustcv_user')
      window.location.href = '/'
    }
    return Promise.reject(error)
  }
)

export default api
