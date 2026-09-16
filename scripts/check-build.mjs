import { readFileSync, existsSync } from 'node:fs'
import { resolve, dirname } from 'node:path'
import { fileURLToPath } from 'node:url'
import assert from 'node:assert/strict'
const root=resolve(dirname(fileURLToPath(import.meta.url)),'../dist')
const index=readFileSync(resolve(root,'index.html'),'utf8')
const projectLinks=[...index.matchAll(/href="([^"#]*\/work\/[^"#]+\/)"/g)].map(m=>m[1])
assert.equal(new Set(projectLinks).size,46,'All 46 projects must be crawlable')
for(const url of new Set(projectLinks)) {
  const slug=url.split('/').filter(Boolean).at(-1)
  const path=resolve(root,'work',slug,'index.html')
  assert.ok(existsSync(path),`Missing static page: ${slug}`)
  const html=readFileSync(path,'utf8')
  const schema=JSON.parse(html.match(/<script id="portfolio-schema" type="application\/ld\+json">([\s\S]*?)<\/script>/)[1])
  assert.equal(schema['@type'],'VideoObject')
  assert.ok(schema.name&&schema.uploadDate&&schema.thumbnailUrl[0]&&schema.embedUrl)
  assert.ok(html.includes(`href="${schema.url}"`),'Canonical should match VideoObject URL')
  assert.ok(html.includes(schema.embedUrl),'Watch page should embed its own video')
  assert.ok(!html.includes('/og.png'),'No generic project social image')
}
assert.equal((readFileSync(resolve(root,'sitemap.xml'),'utf8').match(/<url>/g)||[]).length,47)
console.log('46 static project pages, metadata and 47 sitemap URLs validated.')
