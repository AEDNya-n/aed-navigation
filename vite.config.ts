import { defineConfig } from 'vite'
import path from 'path'

export default defineConfig({
  base: '/aed-navigation', // GitHub Pages 用
  resolve: {
    alias: {
      '@': path.resolve(__dirname, 'src'),
    },
  },
  build: {
    rollupOptions: {
      input: {
        main: path.resolve(__dirname, 'index.html'),
        filter: path.resolve(__dirname, 'filter.html'),
      },
    },
  },
})