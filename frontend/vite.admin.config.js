import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// Vite configuration for Admin Management Dashboard (Port 5174 -> API Port 5001)
export default defineConfig({
  plugins: [react()],
  server: {
    port: 5174,
    proxy: {
      '/api': {
        target: 'http://localhost:5001',
        changeOrigin: true,
      },
      '/uploads': {
        target: 'http://localhost:5001',
        changeOrigin: true,
      },
    },
  },
  define: {
    'import.meta.env.VITE_PORTAL_TYPE': JSON.stringify('admin'),
    'import.meta.env.VITE_USER_PORT': JSON.stringify('5173'),
    'import.meta.env.VITE_ADMIN_PORT': JSON.stringify('5174'),
  },
})
