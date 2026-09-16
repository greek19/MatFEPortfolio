import type { Project } from './types'
export const siteOrigin = 'https://greek19.github.io'
export function projectPath(base:string, project:Project) { return `${base}work/${project.slug}/` }
export function projectFromPath(path:string, projects:Project[]) {
  const slug = path.match(/\/work\/([^/]+)(?:\/|$)/)?.[1]
  return projects.find(p => p.slug === slug) ?? null
}
export function pageMeta(base:string, project:Project|null = null) {
  const label = project ? [project.client, project.title, project.variant].filter(Boolean).join(' — ') : 'Matteo Cataldo — Film Editor & Colorist'
  const credits = project ? [project.credits.editor && `Editor: ${project.credits.editor}`,project.credits.director && `Director: ${project.credits.director}`].filter(Boolean).join('. ') : ''
  const description = project ? `${label}.${credits ? ` ${credits}.` : ''} Guarda il video nel portfolio di Matteo Cataldo.` : 'Portfolio di Matteo Cataldo, film editor e colorist a Milano. Video musicali, film e progetti per brand, con video e crediti.'
  return { title:project ? `${label} | Matteo Cataldo` : label, description, url:siteOrigin+(project ? projectPath(base,project) : base), image:project?.poster ?? null }
}
export function videoSchema(base:string, project:Project) {
  const meta = pageMeta(base,project)
  return { '@context':'https://schema.org', '@type':'VideoObject', '@id':`${meta.url}#video`, name:project.originalTitle, description:meta.description,
    thumbnailUrl:[project.poster], uploadDate:project.uploadedAt, duration:`PT${project.durationSeconds}S`, embedUrl:`https://player.vimeo.com/video/${project.video.id}`, url:meta.url,
    ...(project.credits.editor || project.credits.director ? {creditText:[project.credits.editor && `Editor: ${project.credits.editor}`,project.credits.director && `Director: ${project.credits.director}`].filter(Boolean).join('. ')} : {}),
  }
}
export function portfolioSchema(base:string, projects:Project[]) {
  return { '@context':'https://schema.org', '@graph':[
    {'@type':'Person','@id':`${siteOrigin+base}#matteo`,name:'Matteo Cataldo',jobTitle:'Film Editor & Colorist',sameAs:['https://vimeo.com/matteocataldo']},
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
  for (const [key,value] of Object.entries({title:meta.title,description:meta.description,url:meta.url,image:meta.image,type:project?'video.other':'website'})) setMeta(`og:${key}`,value,true)
  for (const [key,value] of Object.entries({title:meta.title,description:meta.description,image:meta.image,card:project?'summary_large_image':'summary'})) setMeta(`twitter:${key}`,value)
  let canonical=document.head.querySelector<HTMLLinkElement>('link[rel="canonical"]')
  if (!canonical) {canonical=document.createElement('link');canonical.rel='canonical';document.head.append(canonical)}
  canonical.href=meta.url
  let data=document.getElementById('portfolio-schema')
  if (!data) {data=document.createElement('script');data.id='portfolio-schema';data.setAttribute('type','application/ld+json');document.head.append(data)}
  data.textContent=JSON.stringify(project ? videoSchema(base,project) : portfolioSchema(base,projects))
}
