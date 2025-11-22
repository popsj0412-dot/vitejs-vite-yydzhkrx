import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    port: 3000, // 強制使用 3000 端口
    host: true  // 允許外部連結 (對線上編輯器很重要)
  }
})