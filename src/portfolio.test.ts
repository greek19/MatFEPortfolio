import { describe, expect, it } from 'vitest'
import { importReport, plainText, projects } from './data'
import { pageMeta, projectFromPath, projectPath, videoSchema } from './seo'
import { renderSeoPage } from '../scripts/seo-build'
const base='/MatFEPortfolio/v3/'
describe('public Vimeo import',()=>{
  it('includes every upload reported by the profile',()=>{expect(projects).toHaveLength(46);expect(projects).toHaveLength(importReport.total);expect(new Set(projects.map(p=>p.video.id)).size).toBe(projects.length)})
  it('uses safe unique URLs and valid durations',()=>{expect(new Set(projects.map(p=>p.slug)).size).toBe(projects.length);for(const p of projects){expect(p.slug).toMatch(/^[a-z0-9-]+$/);expect(p.video.id).toMatch(/^\d+$/);expect(p.poster).toMatch(/^https:\/\/i\.vimeocdn\.com\//);expect(p.durationSeconds).toBeGreaterThan(0);expect(p.uploadedAt).toMatch(/^\d{4}-\d{2}-\d{2}$/)}})
  it('does not fabricate credits for empty descriptions',()=>{const teaser=projects.find(p=>p.video.id==='1209849109')!;expect(teaser.credits).toEqual({editor:null,director:null})})
  it('extracts actual editor and director names',()=>{const arisa=projects.find(p=>p.video.id==='1209869181')!;expect(arisa.credits).toEqual({editor:'Matteo Cataldo',director:'Marco Salom'});expect(arisa.roles).toContain('Colorist')})
  it('distinguishes a teaser from its full video',()=>{const items=projects.filter(p=>p.title==='Napoli Melancholia');expect(items).toHaveLength(2);expect(items[0].slug).not.toBe(items[1].slug)})
  it('strips HTML rather than injecting source descriptions',()=>{expect(plainText('<b>Editor</b><br />Matteo &amp; Team')).toBe('Editor\nMatteo & Team')})
})
describe('project SEO',()=>{
  const template='<html><head><title>OLD</title><meta property="og:image" content="/og.png"></head><body><div id="root"></div></body></html>'
  for(const id of ['1209869181','658505793'])it(`prerenders project ${id} with matching metadata`,()=>{
    const p=projects.find(p=>p.video.id===id)!,meta=pageMeta(base,p),html=renderSeoPage(template,base,p)
    expect(html).toContain(meta.url);expect(html).toContain(p.poster.replace(/&/g,'&amp;'));expect(html).toContain(`https://player.vimeo.com/video/${id}`);expect(html).toContain(p.credits.director!);expect(html).not.toContain('/og.png');expect(html).not.toContain('<title>OLD</title>');expect(videoSchema(base,p).uploadDate).toBe(p.uploadedAt);expect(projectFromPath(projectPath(base,p),projects)?.slug).toBe(p.slug)
  })
  it('links all project pages even before JavaScript runs',()=>{const html=renderSeoPage(template,base,null);for(const p of projects)expect(html).toContain(`href="${projectPath(base,p)}"`)})
  it('escapes imported source text in HTML and JSON-LD',()=>{const dangerous={...projects[0],title:'</script><script>alert(1)</script>'};const html=renderSeoPage(template,base,dangerous);expect(html).not.toContain(dangerous.title);expect(html).toContain('&lt;/script&gt;')})
})
