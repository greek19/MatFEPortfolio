import { readFileSync, existsSync } from 'node:fs'
import { resolve, dirname } from 'node:path'
import { fileURLToPath } from 'node:url'
import assert from 'node:assert/strict'
const root=resolve(dirname(fileURLToPath(import.meta.url)),'../dist')
const index=readFileSync(resolve(root,'index.html'),'utf8')
const projectLinks=[...index.matchAll(/href="([^"#]*\/work\/[^"#]+\/)"/g)].map(m=>m[1])
const snapshot=JSON.parse(readFileSync(resolve(root,'../src/content/vimeo.json'),'utf8'))
assert.equal(new Set(projectLinks).size,snapshot.videos.length,'All imported projects must be crawlable')
assert.ok(index.includes('og.png'),'Home needs a social image')
assert.ok(index.includes('max-image-preview:large'))
const titles=new Set()
for(const url of new Set(projectLinks)) {
  const slug=url.split('/').filter(Boolean).at(-1)
  const path=resolve(root,'work',slug,'index.html')
  assert.ok(existsSync(path),`Missing static page: ${slug}`)
  const html=readFileSync(path,'utf8')
  const title=html.match(/<title>(.*?)<\/title>/)[1]
  assert.ok(!titles.has(title),`Duplicate title: ${title}`);titles.add(title)
  assert.equal((html.match(/rel="canonical"/g)||[]).length,1)
  assert.ok(!html.includes('noindex'))
  const schema=JSON.parse(html.match(/<script id="portfolio-schema" type="application\/ld\+json">([\s\S]*?)<\/script>/)[1])
  assert.equal(schema['@type'],'VideoObject')
  assert.ok(schema.name&&schema.uploadDate&&schema.thumbnailUrl[0]&&schema.embedUrl)
  assert.ok(html.includes(`href="${schema.url}"`),'Canonical should match VideoObject URL')
  assert.ok(html.includes(schema.embedUrl),'Watch page should embed its own video')
  assert.ok(!html.includes('/og.png'),'No generic project social image')
}
assert.equal((readFileSync(resolve(root,'sitemap.xml'),'utf8').match(/<url>/g)||[]).length,snapshot.videos.length+1)
const videoMap=readFileSync(resolve(root,'sitemap-video.xml'),'utf8')
assert.equal((videoMap.match(/<video:video>/g)||[]).length,snapshot.videos.length)
assert.ok(!/&(?!amp;|lt;|gt;|quot;|apos;|#\d+;)/.test(videoMap),'XML must escape ampersands')
console.log(`${titles.size} static watch pages, unique titles, canonical URLs, metadata and both sitemaps validated.`)
