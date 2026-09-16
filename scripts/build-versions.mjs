import { cpSync, existsSync, mkdirSync, readFileSync, rmSync } from 'node:fs'
import { spawnSync } from 'node:child_process'
import { resolve, join, sep } from 'node:path'
const root = resolve(process.argv[2] || '../MatFEPortfolio-versions')
const versions = JSON.parse(readFileSync('public/demo-versions.json','utf8'))
const output = resolve('public')
for (const { id } of versions) {
  if (!/^v[0-9]+$/.test(id)) throw Error('Invalid version identifier')
  const source = resolve(root,id)
  if (!existsSync(join(source,'node_modules'))) throw Error(`Install dependencies in ${source} first`)
  for (const [tool,args] of [['typescript/bin/tsc',['-b']],['vite/bin/vite.js',['build',`--base=/MatFEPortfolio/${id}/`]]]) {
    const result = spawnSync(process.execPath,[join(source,'node_modules',tool),...args],{cwd:source,stdio:'inherit'})
    if (result.status !== 0) process.exit(result.status || 1)
  }
  const target = resolve(output,id)
  if (!target.startsWith(output+sep)) throw Error('Unsafe output path')
  // Only remove generated builds in public/vN, never source worktrees.
  rmSync(target,{recursive:true,force:true}); mkdirSync(target,{recursive:true})
  cpSync(join(source,'dist'),target,{recursive:true})
}
console.log('Local version builds ready. Start pnpm dev to preview the complete demo.')
