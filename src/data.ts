import type { Category, Lang, Project } from './types'
import snapshot from './content/vimeo.json'
import { overrides } from './content/overrides'

export const copy = {
  it: { nav:{work:'Lavori',about:'About',contact:'Contact'}, all:'Tutti', close:'Chiudi', view:'Apri progetto',
    aboutBody:'Matteo Cataldo, film editor e colorist. Milano.', aboutNote:'Video musicali, film e progetti per brand.', contact:'Vimeo',
    filters:'Categorie', list:'Vista griglia', stage:'Vista cinema', editor:'Editor', director:'Director', client:'Cliente', artist:'Artista', song:'Brano',
    more:'Altre informazioni', original:'Note e crediti originali', runtime:'Durata', uploaded:'Caricato su Vimeo', role:'Contributo', unknown:'Non indicato su Vimeo',
  },
  en: { nav:{work:'Work',about:'About',contact:'Contact'}, all:'All', close:'Close', view:'Open project',
    aboutBody:'Matteo Cataldo, film editor and colorist. Milan.', aboutNote:'Music videos, films and work for brands.', contact:'Vimeo',
    filters:'Categories', list:'Grid view', stage:'Cinema view', editor:'Editor', director:'Director', client:'Client', artist:'Artist', song:'Song',
    more:'More information', original:'Original notes and credits', runtime:'Duration', uploaded:'Uploaded to Vimeo', role:'Contribution', unknown:'Not listed on Vimeo',
  },
} satisfies Record<Lang, Record<string, unknown>>
export const categoryLabels: Record<Category, Record<Lang,string>> = {
  music:{it:'Musica',en:'Music'}, production:{it:'Brand',en:'Brands'}, film:{it:'Film',en:'Film'}, social:{it:'Promo / Social',en:'Promo / Social'}, backstage:{it:'Backstage',en:'Behind the scenes'}, personal:{it:'Personali',en:'Personal'},
}
export function plainText(html:string) {
  return html.replace(/<br\s*\/?\s*>/gi,'\n').replace(/<[^>]*>/g,'').replace(/&amp;/g,'&').replace(/&quot;/g,'"').replace(/&#0?39;|&apos;/g,"'").replace(/&lt;/g,'<').replace(/&gt;/g,'>').replace(/&nbsp;/g,' ').replace(/\r/g,'').replace(/\n{3,}/g,'\n\n').trim().normalize('NFC')
}
export const projects: Project[] = snapshot.videos.map((raw,index) => {
  const override = overrides[raw.id] ?? {}
  const parts = raw.title.normalize('NFC').split('|').map(s => s.trim())
  const description = plainText(raw.description)
  const creditLine = description.split('\n').find(line => /^(?:edit(?:or|ing)?|montaggio)(?:\s|_|:)/i.test(line) && /matteo cataldo/i.test(line))
  const editor = override.editor ?? (creditLine ? 'Matteo Cataldo' : null)
  const roles = override.roles ?? (editor ? (/color/i.test(creditLine ?? '') ? ['Editing','Colorist'] : ['Editing']) : [])
  const category = override.category ?? (/music video/i.test(raw.title) ? 'music' : 'production')
  const client = override.client ?? (parts.length > 1 ? parts[0] : '')
  const title = override.title ?? parts[1] ?? parts[0]
  const variant = override.variant ?? parts.slice(2).join(' / ')
  const slug = `${title.normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLowerCase().replace(/[^a-z0-9]+/g,'-').replace(/^-|-$/g,'')}-${raw.id}`
  return {
    slug, number:String(index+1).padStart(2,'0'), title, client, category, roles, featured:index < 8,
    // Upload year is retained for compatibility; never presented as the production year.
    year:raw.uploadDate.slice(0,4), uploadedAt:raw.uploadDate, durationSeconds:raw.duration,
    duration:`${String(Math.floor(raw.duration/60)).padStart(2,'0')}:${String(raw.duration%60).padStart(2,'0')}`,
    poster:raw.poster, video:{provider:'vimeo',id:raw.id}, sourceUrl:raw.url,
    credits:{editor,director:override.director ?? null}, originalTitle:raw.title.normalize('NFC'), originalDescription:description, variant,
    description:{it:[client,title,variant].filter(Boolean).join(' — '),en:[client,title,variant].filter(Boolean).join(' — ')},
    statement:{it:description,en:description},
  }
})
export const importReport = { total:snapshot.total, fetchedAt:snapshot.fetchedAt, missingCredits:projects.filter(p => !p.credits.editor || !p.credits.director).map(p => p.video.id) }
