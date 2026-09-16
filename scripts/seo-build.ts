import { mkdirSync, readFileSync, writeFileSync } from 'node:fs'
import { resolve, dirname } from 'node:path'
import type { Plugin, ResolvedConfig } from 'vite'
import { projects } from '../src/data'
import { pageMeta, portfolioSchema, projectPath, siteOrigin, videoSchema } from '../src/seo'
import type { Project } from '../src/types'

const escape=(value:string)=>value.replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;').replace(/'/g,'&#39;')
const json=(value:unknown)=>JSON.stringify(value).replace(/</g,'\\u003c')
function fallback(base:string,project:Project|null) {
  const nav=`<nav aria-label="Portfolio"><a href="${base}">Matteo Cataldo</a><a href="https://vimeo.com/matteocataldo">Vimeo ↗</a></nav>`
  if(!project)return `<main class="static-portfolio">${nav}<h1>Matteo Cataldo — Portfolio</h1><div class="project-grid">${projects.map(p=>`<a href="${projectPath(base,p)}"><img src="${escape(p.poster)}" alt="${escape(p.originalTitle)}" loading="lazy"><span>${escape(p.client)}</span><h2>${escape(p.title)}${p.variant?` <small>${escape(p.variant)}</small>`:''}</h2></a>`).join('')}</div></main>`
  const row=(label:string,value:string|null)=>`<div><dt>${label}</dt><dd>${escape(value||'Non indicato su Vimeo')}</dd></div>`
  return `<main class="static-portfolio">${nav}<div class="dialog-layout"><iframe class="fallback-video" src="https://player.vimeo.com/video/${project.video.id}?dnt=1" title="${escape(project.title)}" allow="fullscreen; picture-in-picture" allowfullscreen></iframe><aside><h1>${escape(project.title)}</h1><dl>${project.client?row(project.category==='music'||project.category==='backstage'?'Artista':'Cliente',project.client):''}${row('Editor',project.credits.editor)}${row('Director',project.credits.director)}</dl><details><summary>Altre informazioni</summary><dl>${row('Durata',project.duration)}${row('Caricato su Vimeo',project.uploadedAt)}</dl><p class="source-notes">${escape(project.originalDescription)}</p></details></aside></div></main>`
}
export function renderSeoPage(template:string,base:string,project:Project|null) {
  const meta=pageMeta(base,project)
  const html=template.replace(/<title>[\s\S]*?<\/title>/i,'').replace(/<meta\b[^>]*(?:name|property)=["'](?:description|twitter:[^"']*|og:[^"']*)["'][^>]*>/gi,'').replace(/<link\b[^>]*rel=["']canonical["'][^>]*>/gi,'')
  const head=`<title>${escape(meta.title)}</title><meta name="description" content="${escape(meta.description)}"><link rel="canonical" href="${escape(meta.url)}"><meta property="og:type" content="${project?'video.other':'website'}"><meta property="og:title" content="${escape(meta.title)}"><meta property="og:description" content="${escape(meta.description)}"><meta property="og:url" content="${escape(meta.url)}"><meta name="twitter:card" content="${project?'summary_large_image':'summary'}"><meta name="twitter:title" content="${escape(meta.title)}"><meta name="twitter:description" content="${escape(meta.description)}">${meta.image?`<meta property="og:image" content="${escape(meta.image)}"><meta name="twitter:image" content="${escape(meta.image)}">`:''}<script id="portfolio-schema" type="application/ld+json">${json(project?videoSchema(base,project):portfolioSchema(base,projects))}</script>`
  if(!html.includes('<div id="root"></div>'))throw Error('SEO build: root placeholder not found')
  return html.replace('</head>',`${head}</head>`).replace('<div id="root"></div>',`<div id="root">${fallback(base,project)}</div>`)
}
export function seoPages():Plugin {
  let config:ResolvedConfig
  return {name:'portfolio-seo-pages',apply:'build',configResolved(value){config=value},writeBundle(){
    const output=resolve(config.root,config.build.outDir)
    const template=readFileSync(resolve(output,'index.html'),'utf8')
    writeFileSync(resolve(output,'index.html'),renderSeoPage(template,config.base,null))
    for(const project of projects){
      const path=resolve(output,'work',project.slug,'index.html')
      mkdirSync(dirname(path),{recursive:true});writeFileSync(path,renderSeoPage(template,config.base,project))
    }
    const urls=[siteOrigin+config.base,...projects.map(p=>siteOrigin+projectPath(config.base,p))]
    writeFileSync(resolve(output,'sitemap.xml'),`<?xml version="1.0" encoding="UTF-8"?><urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">${urls.map(url=>`<url><loc>${escape(url)}</loc></url>`).join('')}</urlset>`)
  }}
}
