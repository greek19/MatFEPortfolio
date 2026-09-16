import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { existsSync } from 'node:fs'
import { resolve } from 'node:path'

export default defineConfig({
  plugins: [react(), {
    name: 'local-version-index-pages',
    configureServer(server) {
      server.middlewares.use((request, _response, next) => {
        const [path, query] = (request.url ?? '').split('?')
        const relative = path.replace(/^\/MatFEPortfolio\//, '/')
        if (request.method === 'GET' && /^\/v\d+\/(?:work\/[a-z0-9-]+\/)?$/.test(relative) && existsSync(resolve(server.config.publicDir, `.${relative}index.html`))) {
          request.url = `${path}index.html${query ? `?${query}` : ''}`
        }
        next()
      })
    },
  }],
  base: '/MatFEPortfolio/',
  build: {
    target: 'es2020',
    cssCodeSplit: true,
    sourcemap: false,
  },
})
