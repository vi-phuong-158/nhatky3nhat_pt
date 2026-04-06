import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  base: '/nhatky3nhat_pt/', // Cấu hình đường dẫn cho GitHub Pages
})
