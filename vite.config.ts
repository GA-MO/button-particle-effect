import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import { glslify } from 'vite-plugin-glslify'

export default defineConfig({
  plugins: [react(), tailwindcss(), glslify()],
  server: {
    port: 3000
  },
  publicDir: 'public'
})
