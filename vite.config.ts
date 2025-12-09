import { defineConfig } from 'vite'
import path from 'path'

// ...existing code...
export default defineConfig({
  base: '/aed-navigation', // GitHub Pages 用にリポジトリ名をセット
  resolve: {
    alias: {
      '@': path.resolve(__dirname, 'src'),
    },
  },
})
// ...existing code...