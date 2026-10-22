import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

export default defineConfig(({ mode }) => ({
  base: mode === 'pages' ? '/button-particle-effect/' : '/',
  plugins: [react(), tailwindcss()],
  server: { port: Number(process.env.GAMO_PORT) || 5173, strictPort: true }
}))
