import type { Project } from './types'
import { projects as bundledProjects } from './data'
export const siteOrigin = 'https://greek19.github.io'
export const robotsPolicy = 'index, follow, max-image-preview:large, max-video-preview:-1, max-snippet:-1'
export function embedUrl(project:Project) {
  return project.video.provider === 'youtube' ? `https://www.youtube-nocookie.com/embed/${project.video.id}` : `https://player.vimeo.com/video/${project.video.id}`
}
export function projectPath(base:string, project:Project) { return bundledProjects.some(p=>p.slug===project.slug) ? `${base}work/${project.slug}/` : `${base}?video=${encodeURIComponent(project.video.id)}` }
export function projectFromPath(path:string, projects:Project[]) {
  const slug = path.match(/\/work\/([^/]+)(?:\/|$)/)?.[1]
  return projects.find(p => p.slug === slug) ?? null
}
export function pageMeta(base:string, project:Project|null = null) {
  const label = project ? [project.client, project.title, project.variant].filter(Boolean).join(' — ') : 'Matteo Cataldo — Film Editor & Colorist'
  const credits = project ? [project.credits.editor && `Editor: ${project.credits.editor}`,project.credits.director && `Director: ${project.credits.director}`].filter(Boolean).join('. ') : ''
  const description = project ? `${label}.${credits ? ` ${credits}.` : ''} Guarda il video nel portfolio di Matteo Cataldo.` : 'Portfolio di Matteo Cataldo, film editor e colorist a Milano. Video musicali, film e progetti per brand, con video e crediti.'
  return { title:project ? `${label} | Matteo Cataldo` : 'Matteo Cataldo | Montatore video e Colorist', description, url:siteOrigin+(project ? projectPath(base,project) : base), image:project?.poster ?? `${siteOrigin}${base}og.png` }
}
export function videoSchema(base:string, project:Project) {
  const meta = pageMeta(base,project)
  return { '@context':'https://schema.org', '@type':'VideoObject', '@id':`${meta.url}#video`, name:project.originalTitle, description:meta.description,
    thumbnailUrl:[project.poster], uploadDate:project.uploadedAt, ...(project.durationSeconds > 0 ? {duration:`PT${project.durationSeconds}S`} : {}), embedUrl:embedUrl(project), url:meta.url,
    mainEntityOfPage:{'@type':'WebPage','@id':meta.url},
    ...(project.credits.editor || project.credits.director ? {creditText:[project.credits.editor && `Editor: ${project.credits.editor}`,project.credits.director && `Director: ${project.credits.director}`].filter(Boolean).join('. ')} : {}),
  }
}
export function portfolioSchema(base:string, projects:Project[]) {
  return { '@context':'https://schema.org', '@graph':[
    {'@type':'Person','@id':`${siteOrigin+base}#matteo`,name:'Matteo Cataldo',url:siteOrigin+base,jobTitle:'Film Editor & Colorist',sameAs:['https://vimeo.com/matteocataldo']},
    {'@type':'WebSite','@id':`${siteOrigin+base}#website`,url:siteOrigin+base,name:'Matteo Cataldo — Portfolio',inLanguage:'it',about:{'@id':`${siteOrigin+base}#matteo`}},
    {'@type':'CollectionPage',url:siteOrigin+base,name:'Matteo Cataldo — Portfolio', mainEntity:{'@type':'ItemList',numberOfItems:projects.length,itemListElement:projects.map((p,index) => ({'@type':'ListItem',position:index+1,name:p.originalTitle,url:siteOrigin+projectPath(base,p)}))}},
  ]}
}
export function updatePageMeta(base:string, project:Project|null, projects:Project[]) {
  const meta = pageMeta(base,project); document.title = meta.title
  const setMeta = (key:string, value:string|null, property=false) => {
    const attr = property ? 'property' : 'name'
    let node = document.head.querySelector<HTMLMetaElement>(`meta[${attr}="${key}"]`)
    if (value === null) { node?.remove(); return }
    if (!node) { node=document.createElement('meta');node.setAttribute(attr,key);document.head.append(node) }
    node.content=value
  }
  setMeta('description',meta.description)
  setMeta('robots',robotsPolicy)
  setMeta('og:site_name','Matteo Cataldo — Portfolio',true)
  setMeta('og:locale','it_IT',true)
  setMeta('og:image:alt',meta.title,true)
  for (const [key,value] of Object.entries({title:meta.title,description:meta.description,url:meta.url,image:meta.image,type:project?'video.other':'website'})) setMeta(`og:${key}`,value,true)
  for (const [key,value] of Object.entries({title:meta.title,description:meta.description,image:meta.image,card:'summary_large_image', 'image:alt':meta.title})) setMeta(`twitter:${key}`,value)
  let canonical=document.head.querySelector<HTMLLinkElement>('link[rel="canonical"]')
  if (!canonical) {canonical=document.createElement('link');canonical.rel='canonical';document.head.append(canonical)}
  canonical.href=meta.url
  let data=document.getElementById('portfolio-schema')
  if (!data) {data=document.createElement('script');data.id='portfolio-schema';data.setAttribute('type','application/ld+json');document.head.append(data)}
  data.textContent=JSON.stringify(project ? videoSchema(base,project) : portfolioSchema(base,projects))
}
