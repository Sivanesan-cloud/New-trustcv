import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
    proxy: {
      '/login':      { target: 'http://localhost:8000', changeOrigin: true },
      '/dataset':    { target: 'http://localhost:8000', changeOrigin: true },
      '/model':      { target: 'http://localhost:8000', changeOrigin: true },
      '/inference':  { target: 'http://localhost:8000', changeOrigin: true },
      '/audit':      { target: 'http://localhost:8000', changeOrigin: true },
      '/dashboard':  { target: 'http://localhost:8000', changeOrigin: true },
      '/db':         { target: 'http://localhost:8000', changeOrigin: true },
      '/users':      { target: 'http://localhost:8000', changeOrigin: true },
    },
  },
})
