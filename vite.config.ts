import { defineConfig } from 'vite'
import path from 'path'

export default defineConfig({
  base: '/aed-navigation', // GitHub Pages 用
  resolve: {
    alias: {
      '@': path.resolve(__dirname, 'src'),
    },
  },
  server: {
    host: 'localhost', // localhost のみで実行（セキュアコンテキス扱い）
    port: 5173,
  },
  preview: {
    host: 'localhost', // localhost のみで実行（セキュアコンテキス扱い）
    port: 4173,
  },
  build: {
    rollupOptions: {
      input: {
        main: path.resolve(__dirname, 'index.html'),
        contact: path.resolve(__dirname, 'contact.html'),
        filter: path.resolve(__dirname, 'filter.html'),
      },
    },
  },
})
