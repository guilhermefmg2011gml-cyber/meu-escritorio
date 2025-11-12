import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
// =======================================================
// Configuração Vite - Moura Martins Advogados
// Redireciona chamadas /api → Flask backend
// =======================================================
export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
    proxy: {
      '/api': {
        target: 'http://127.0.0.1:5000', // Flask backend
        changeOrigin: true,
        secure: false
      }
    }
  }
})
