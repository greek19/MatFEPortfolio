import { copyFileSync, existsSync } from 'node:fs'
import { resolve } from 'node:path'
const root = resolve(process.argv[2] || '../MatFEPortfolio-versions')
for (const id of ['v1','v2','v3']) {
  const src = resolve(root, id, 'src')
  if (!existsSync(src)) throw new Error(`Version missing: ${src}`)
  for (const file of ['themes.ts', 'theme.css']) copyFileSync(resolve('src',file), resolve(src,file))
}
console.log('Palette sincronizzate in v1, v2 e v3.')
