import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { seoPages } from './scripts/seo-build'

export default defineConfig({
  plugins: [react(), seoPages()],
  base: '/MatFEPortfolio/v3/',
  build: {
    target: 'es2020',
    cssCodeSplit: true,
    sourcemap: false,
  },
})
