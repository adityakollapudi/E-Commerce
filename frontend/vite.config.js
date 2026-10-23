import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// Vite configuration for User Storefront (Port 5173 -> API Port 5000)
export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
    proxy: {
      '/api': {
        target: 'http://localhost:5000',
        changeOrigin: true,
      },
      '/uploads': {
        target: 'http://localhost:5000',
        changeOrigin: true,
      },
    },
  },
  define: {
    'import.meta.env.VITE_PORTAL_TYPE': JSON.stringify('user'),
    'import.meta.env.VITE_USER_PORT': JSON.stringify('5173'),
    'import.meta.env.VITE_ADMIN_PORT': JSON.stringify('5174'),
  },
})
