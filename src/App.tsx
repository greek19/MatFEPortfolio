import { useEffect, useMemo, useRef, useState } from 'react'
import { ArrowLeft, ArrowRight, ArrowUpRight, ChevronDown, Grid2X2, Maximize2, Play } from 'lucide-react'
import { categoryLabels, copy, projects } from './data'
import { projectFromPath, projectPath, updatePageMeta } from './seo'
import ProjectDialog from './ProjectDialog'
import type { Category, Lang, Project } from './types'

type View = 'work'|'about'|'contact'
const base=import.meta.env.BASE_URL
const readView=():View => location.hash==='#about'?'about':location.hash==='#contact'?'contact':'work'
const initialProject=projectFromPath(location.pathname,projects)
export default function App() {
  const [lang,setLang]=useState<Lang>('it')
  const [view,setView]=useState<View>(readView)
  const [layout,setLayout]=useState<'cinema'|'grid'>('cinema')
  const [filter,setFilter]=useState<Category|'all'>('all')
  const [filtersOpen,setFiltersOpen]=useState(false)
  const [selected,setSelected]=useState(initialProject?.slug ?? projects[0].slug)
  const [active,setActive]=useState<Project|null>(initialProject)
  const panel=useRef<HTMLElement>(null)
  const filters=useRef<HTMLDivElement>(null)
  const filterButton=useRef<HTMLButtonElement>(null)
  const openedHere=useRef(false)
  const t=copy[lang]
  const it=lang==='it'
  const categories=[...new Set(projects.map(p=>p.category))]
  const visible=useMemo(()=>projects.filter(p=>filter==='all'||p.category===filter),[filter])
  const chosen=visible.find(p=>p.slug===selected) ?? visible[0]
  const index=visible.findIndex(p=>p.slug===chosen?.slug)

  useEffect(()=>{document.documentElement.lang=lang},[lang])
  useEffect(()=>{updatePageMeta(base,active,projects)},[active])
  useEffect(()=>{
    const sync=()=>{setView(readView());setActive(projectFromPath(location.pathname,projects))}
    window.addEventListener('popstate',sync);window.addEventListener('hashchange',sync)
    return()=>{window.removeEventListener('popstate',sync);window.removeEventListener('hashchange',sync)}
  },[])
  useEffect(()=>{
    if(!filtersOpen)return
    const outside=(event:PointerEvent)=>{if(!filters.current?.contains(event.target as Node))setFiltersOpen(false)}
    const escape=(event:KeyboardEvent)=>{if(event.key==='Escape'){setFiltersOpen(false);filterButton.current?.focus()}}
    document.addEventListener('pointerdown',outside);document.addEventListener('keydown',escape)
    return()=>{document.removeEventListener('pointerdown',outside);document.removeEventListener('keydown',escape)}
  },[filtersOpen])
  useEffect(()=>{
    if(layout==='cinema') document.querySelector('.filmstrip .selected')?.scrollIntoView({block:'nearest',inline:'nearest',behavior:'instant'})
  },[chosen?.slug,layout])
  function navigate(next:View){setView(next);setFiltersOpen(false);history.pushState({},'',`${base}${location.search}#${next}`);requestAnimationFrame(()=>panel.current?.focus())}
  function openProject(project:Project){openedHere.current=true;history.pushState({},'',`${projectPath(base,project)}${location.search}`);setActive(project)}
  function closeProject(){setActive(null);if(openedHere.current){openedHere.current=false;history.back()}else history.replaceState({},'',`${base}${location.search}`)}
  const move=(direction:number)=>{if(visible.length)setSelected(visible[(index+direction+visible.length)%visible.length].slug)}
  return <div className="studio">
    <div className="grain" aria-hidden="true" />
    <header className="studio-header">
      <button className="identity" onClick={()=>navigate('work')} aria-label="Matteo Cataldo — Portfolio"><strong>Matteo Cataldo</strong><small>EDITOR & COLORIST</small></button>
      <nav aria-label={it?'Navigazione principale':'Main navigation'}>{(['work','about','contact'] as View[]).map(item=><button key={item} aria-current={view===item?'page':undefined} onClick={()=>navigate(item)}>{t.nav[item]}</button>)}</nav>
      <div className="header-end"><a href="https://vimeo.com/matteocataldo" target="_blank" rel="noreferrer">Vimeo <ArrowUpRight size={12}/></a><div className="language">{(['it','en'] as Lang[]).map(l=><button key={l} aria-pressed={lang===l} onClick={()=>setLang(l)}>{l.toUpperCase()}</button>)}</div></div>
    </header>
    <main id="main" ref={panel} tabIndex={-1} className={`workspace view-${view}`}>
      {view==='work'?<>
        <h1 className="sr-only">Matteo Cataldo — Portfolio video</h1>
        <div className="work-toolbar">
          <div className="category-control" ref={filters}>
            <button ref={filterButton} className="filter-toggle" aria-expanded={filtersOpen} aria-controls="category-options" onClick={()=>setFiltersOpen(!filtersOpen)}>{filter==='all'?t.filters:categoryLabels[filter][lang]}<ChevronDown size={12}/></button>
            {filtersOpen&&<div id="category-options" className="category-options" role="group" aria-label={t.filters}>{(['all',...categories] as const).map(cat=><button key={cat} aria-pressed={filter===cat} onClick={()=>{setFilter(cat);setFiltersOpen(false);filterButton.current?.focus()}}>{cat==='all'?t.all:categoryLabels[cat][lang]}<span>{cat==='all'?projects.length:projects.filter(p=>p.category===cat).length}</span></button>)}</div>}
          </div>
          <div className="layout-toggle"><button aria-label={t.stage} aria-pressed={layout==='cinema'} onClick={()=>setLayout('cinema')}><Maximize2 size={15}/></button><button aria-label={t.list} aria-pressed={layout==='grid'} onClick={()=>setLayout('grid')}><Grid2X2 size={15}/></button></div>
        </div>
        {layout==='cinema'&&chosen?<section className="cinema" aria-label={it?'Progetti video':'Video projects'}>
          <a className="main-frame" key={chosen.slug} href={projectPath(base,chosen)} onClick={e=>{if(!e.ctrlKey&&!e.metaKey&&!e.shiftKey){e.preventDefault();openProject(chosen)}}} aria-label={`${t.view}: ${chosen.client} ${chosen.title}`}>
            <img src={chosen.poster} alt={`${chosen.client} — ${chosen.title}`} fetchPriority="high"/>
            <span className="frame-play" aria-hidden="true"><Play size={22} fill="currentColor"/></span>
          </a>
          <div className="filmstrip" aria-label={it?'Seleziona un video':'Select a video'}>{visible.map(p=><button key={p.slug} className={chosen.slug===p.slug?'selected':''} aria-pressed={chosen.slug===p.slug} onClick={()=>setSelected(p.slug)} aria-label={`${p.client} — ${p.title}${p.variant?` / ${p.variant}`:''}`} title={`${p.client} — ${p.title}`}><img src={p.poster} alt="" loading="lazy"/><span>{p.number}</span></button>)}</div>
          <div className="film-caption"><div><span>{chosen.client}</span><h2>{chosen.title}{chosen.variant&&/teaser|trailer|behind/i.test(chosen.variant)&&<small> / {chosen.variant}</small>}</h2></div><div className="scene-controls"><span>{String(index+1).padStart(2,'0')} / {visible.length}</span><button onClick={()=>move(-1)} aria-label={it?'Video precedente':'Previous video'}><ArrowLeft size={18}/></button><button onClick={()=>move(1)} aria-label={it?'Video successivo':'Next video'}><ArrowRight size={18}/></button></div></div>
        </section>:<section className="project-grid" aria-label={it?'Tutti i video':'All videos'}>{visible.map(p=><a key={p.slug} href={projectPath(base,p)} onClick={e=>{if(!e.ctrlKey&&!e.metaKey&&!e.shiftKey){e.preventDefault();openProject(p)}}}><img src={p.poster} alt={`${p.client} — ${p.title}`} loading="lazy"/><span>{p.client}</span><h2>{p.title}{p.variant&&/teaser|trailer|behind/i.test(p.variant)&&<small> / {p.variant}</small>}</h2></a>)}</section>}
      </>:view==='about'?<section className="editorial-page"><h1>About</h1><div><p className="about-intro">{t.aboutBody}</p><p>{t.aboutNote}</p></div></section>:<section className="editorial-page"><h1>Contact</h1><a className="contact-action" href="https://vimeo.com/matteocataldo" target="_blank" rel="noreferrer">Vimeo <ArrowUpRight size={30}/></a></section>}
    </main>
    <footer className="studio-footer"><span>© {new Date().getFullYear()} Matteo Cataldo</span></footer>
    {active&&<ProjectDialog project={active} lang={lang} close={closeProject}/>}
  </div>
}
