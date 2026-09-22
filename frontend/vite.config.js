import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
    proxy: {
      // Proxy ALL backend API routes directly to FastAPI (no /api prefix needed)
      '/login':     { target: 'http://localhost:8000', changeOrigin: true },
      '/dataset':   { target: 'http://localhost:8000', changeOrigin: true },
      '/model':     { target: 'http://localhost:8000', changeOrigin: true },
      '/inference': { target: 'http://localhost:8000', changeOrigin: true },
      '/audit':     { target: 'http://localhost:8000', changeOrigin: true },
    },
  },
})
