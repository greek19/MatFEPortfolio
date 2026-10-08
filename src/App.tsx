import { useEffect, useMemo, useRef, useState, type MouseEvent, type PointerEvent as ReactPointerEvent } from 'react'
import Player from '@vimeo/player'
import { ArrowLeft, ArrowRight, ArrowUpRight, ChevronDown, Grid2X2, Maximize2, Play, Volume2, VolumeX } from 'lucide-react'
import { categoryLabels, copy, projects as bundledProjects } from './data'
import { loadRemoteCatalog } from './remote-catalog'
import { projectFromPath, projectPath, updatePageMeta } from './seo'
import ProjectDialog from './ProjectDialog'
import type { Category, Lang, Project } from './types'

type View = 'work'|'about'|'contact'
const base=import.meta.env.BASE_URL
const readView=():View => location.hash==='#about'?'about':location.hash==='#contact'?'contact':'work'
const initialProject=projectFromPath(location.pathname,bundledProjects)
function Preview({ project, sound, it }: { project: Project; sound: boolean; it: boolean }) {
  const iframe = useRef<HTMLIFrameElement>(null)
  const player = useRef<Player | null>(null)
  const [audible, setAudible] = useState(sound)
  const [busy, setBusy] = useState(false)
  const [src] = useState(() => `https://player.vimeo.com/video/${project.video.id}?autoplay=1&muted=${sound ? 0 : 1}&controls=0&playsinline=1&dnt=1&loop=1`)
  useEffect(() => {
    if (!iframe.current) return
    const instance = new Player(iframe.current)
    player.current = instance
    const syncVolume = (event: { muted: boolean; volume: number }) => setAudible(!event.muted && event.volume > 0)
    instance.on('volumechange', syncVolume)
    let disposed = false
    instance.ready().then(async () => {
      if (disposed) return
      try { await instance.play() } catch {
        if (disposed) return
        await instance.setMuted(true)
        setAudible(false)
        if (!disposed) await instance.play()
      }
    }).catch(() => undefined)
    return () => {
      disposed = true
      instance.off('volumechange', syncVolume)
      player.current = null
      instance.destroy().catch(() => undefined)
    }
  }, [])
  const toggle = async (event: MouseEvent<HTMLButtonElement>) => {
    event.stopPropagation()
    const instance = player.current
    if (!instance || busy) return
    setBusy(true)
    try {
      const next = !audible
      await instance.setMuted(!next)
      if (next) await instance.setVolume(1)
      setAudible(next)
    } catch {
      // Keep the current icon if the player rejects the audio change.
    } finally {
      setBusy(false)
    }
  }
  return <>
    <iframe ref={iframe} className="frame-video" src={src} title={`${project.client} — ${project.title}`} allow="autoplay; fullscreen; picture-in-picture" aria-hidden="true" tabIndex={-1}/>
    <button className="frame-audio" type="button" onClick={toggle} onKeyDown={event=>event.stopPropagation()} disabled={busy} aria-label={audible?(it?'Disattiva audio preview':'Mute preview'):(it?'Attiva audio preview':'Unmute preview')} aria-pressed={audible}>{audible?<Volume2 size={16}/>:<VolumeX size={16}/>}</button>
  </>
}
export default function App() {
  const [projects,setProjects]=useState(bundledProjects)
  useEffect(()=>{
    const controller=new AbortController()
    const timeout=setTimeout(()=>controller.abort(),8000)
    loadRemoteCatalog(controller.signal).then(items=>{
      if(items && !controller.signal.aborted)setProjects(items)
    }).catch(()=>{/* Keep the bundled catalog on network or validation failure. */}).finally(()=>clearTimeout(timeout))
    return()=>{controller.abort();clearTimeout(timeout)}
  },[])
  const [lang,setLang]=useState<Lang>('it')
  const [view,setView]=useState<View>(readView)
  const [layout,setLayout]=useState<'cinema'|'grid'>('cinema')
  const [filter,setFilter]=useState<Category|'all'>('all')
  const [filtersOpen,setFiltersOpen]=useState(false)
  const [selected,setSelected]=useState(initialProject?.slug ?? projects[0].slug)
  const [previewSound,setPreviewSound]=useState(false)
  const [dragged,setDragged]=useState<string|null>(null)
  const [dropHover,setDropHover]=useState(false)
  const [stripProgress,setStripProgress]=useState({top:0,size:1})
  const [active,setActive]=useState<Project|null>(initialProject)
  const panel=useRef<HTMLElement>(null)
  const filmstrip=useRef<HTMLDivElement>(null)
  const filters=useRef<HTMLDivElement>(null)
  const filterButton=useRef<HTMLButtonElement>(null)
  const filterCloseTimer=useRef<ReturnType<typeof setTimeout>>()
  const openedHere=useRef(false)
  const t=copy[lang]
  const it=lang==='it'
  const categories=[...new Set(projects.map(p=>p.category))]
  const visible=useMemo(()=>projects.filter(p=>filter==='all'||p.category===filter),[filter,projects])
  const chosen=visible.find(p=>p.slug===selected) ?? visible[0]
  const index=visible.findIndex(p=>p.slug===chosen?.slug)

  useEffect(()=>{document.documentElement.lang=lang},[lang])
  useEffect(()=>{updatePageMeta(base,active,projects)},[active,projects])
  useEffect(()=>{
    const sync=()=>{setView(readView());setActive(projectFromPath(location.pathname,projects) ?? projects.find(p=>p.video.id===new URLSearchParams(location.search).get('video')) ?? null)}
    sync()
    window.addEventListener('popstate',sync);window.addEventListener('hashchange',sync)
    return()=>{window.removeEventListener('popstate',sync);window.removeEventListener('hashchange',sync)}
  },[projects])
  useEffect(()=>{if(filter!=='all'&&!projects.some(p=>p.category===filter))setFilter('all')},[filter,projects])
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
  useEffect(()=>{
    const node=filmstrip.current
    if(!node)return
    const sync=()=>{const max=node.scrollHeight-node.clientHeight;setStripProgress({top:max>0?node.scrollTop/max:0,size:node.scrollHeight?Math.min(1,node.clientHeight/node.scrollHeight):1})}
    sync();node.addEventListener('scroll',sync,{passive:true});window.addEventListener('resize',sync)
    return()=>{node.removeEventListener('scroll',sync);window.removeEventListener('resize',sync)}
  },[layout,visible.length])
  useEffect(()=>()=>clearTimeout(filterCloseTimer.current),[])
  const openFilters=()=>{clearTimeout(filterCloseTimer.current);setFiltersOpen(true)}
  const closeFiltersSoon=()=>{clearTimeout(filterCloseTimer.current);filterCloseTimer.current=setTimeout(()=>setFiltersOpen(false),140)}
  function navigate(next:View){setView(next);setFiltersOpen(false);history.pushState({},'',`${base}${location.search}#${next}`);requestAnimationFrame(()=>panel.current?.focus())}
  function openProject(project:Project){openedHere.current=true;const query=new URLSearchParams(location.search);query.delete('video');if(!bundledProjects.some(p=>p.slug===project.slug))query.set('video',project.video.id);const path=query.has('video')?base:projectPath(base,project);history.pushState({},'',`${path}${query.size?'?'+query.toString():''}`);setActive(project)}
  function closeProject(){setActive(null);if(openedHere.current){openedHere.current=false;history.back()}else{const query=new URLSearchParams(location.search);query.delete('video');history.replaceState({},'',`${base}${query.size?'?'+query.toString():''}`)}}
  const selectPreview=(slug:string,sound=true)=>{setSelected(slug);setPreviewSound(sound)}
  const move=(direction:number)=>{if(visible.length)selectPreview(visible[(index+direction+visible.length)%visible.length].slug)}
  const openFrameProject=()=>{if(chosen)openProject(chosen)}
  const endDrag=()=>{setDragged(null);setDropHover(false)}
  const dragStripScroll=(event:ReactPointerEvent<HTMLButtonElement>)=>{const node=filmstrip.current;if(!node)return;event.preventDefault();const startY=event.clientY,startTop=node.scrollTop,max=node.scrollHeight-node.clientHeight,track=Math.max(1,node.clientHeight*(1-stripProgress.size));const move=(moveEvent:globalThis.PointerEvent)=>{node.scrollTop=Math.max(0,Math.min(max,startTop+(moveEvent.clientY-startY)*max/track))};const end=()=>{window.removeEventListener('pointermove',move);window.removeEventListener('pointerup',end)};window.addEventListener('pointermove',move);window.addEventListener('pointerup',end)}
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
          <div className="category-control" ref={filters} onPointerEnter={(event)=>{if(event.pointerType==='mouse')openFilters()}} onPointerLeave={(event)=>{if(event.pointerType==='mouse')closeFiltersSoon()}}>
            <button ref={filterButton} className="filter-toggle" aria-expanded={filtersOpen} aria-controls="category-options" onClick={()=>setFiltersOpen(!filtersOpen)}>{filter==='all'?t.filters:categoryLabels[filter][lang]}<ChevronDown size={12}/></button>
            {filtersOpen&&<div id="category-options" className="category-options" role="group" aria-label={t.filters}>{(['all',...categories] as const).map(cat=><button key={cat} aria-pressed={filter===cat} onClick={()=>{setFilter(cat);setFiltersOpen(false);filterButton.current?.focus()}}>{cat==='all'?t.all:categoryLabels[cat][lang]}<span>{cat==='all'?projects.length:projects.filter(p=>p.category===cat).length}</span></button>)}</div>}
          </div>
          <div className="layout-toggle"><button aria-label={t.stage} aria-pressed={layout==='cinema'} onClick={()=>setLayout('cinema')}><Maximize2 size={15}/></button><button aria-label={t.list} aria-pressed={layout==='grid'} onClick={()=>setLayout('grid')}><Grid2X2 size={15}/></button></div>
        </div>
        {layout==='cinema'&&chosen?<section className="cinema" aria-label={it?'Progetti video':'Video projects'}>
          <div className={`main-frame${dragged?' drop-ready':''}${dropHover?' drop-hover':''}`} key={chosen.slug} role="link" tabIndex={0} onClick={openFrameProject} onKeyDown={event=>{if(event.key==='Enter'||event.key===' '){event.preventDefault();openFrameProject()}}} aria-label={`${t.view}: ${chosen.client} ${chosen.title}`}
            onDragOver={event=>{if(dragged){event.preventDefault();event.dataTransfer.dropEffect='copy';setDropHover(true)}}}
            onDragLeave={event=>{if(!event.currentTarget.contains(event.relatedTarget as Node|null))setDropHover(false)}}
            onDrop={event=>{
              if(!dragged)return
              event.preventDefault();event.stopPropagation()
              const slug=event.dataTransfer.getData('application/x-portfolio-project')
              if(slug===dragged&&visible.some(project=>project.slug===slug))selectPreview(slug)
              endDrag()
            }}>
            <img className="frame-bg" src={chosen.poster} alt="" aria-hidden="true" fetchPriority="high"/>
            {chosen.video.provider==='vimeo' && !active
              ? <Preview key={chosen.video.id} project={chosen} sound={previewSound} it={it}/>
              : <img className="frame-image" src={chosen.poster} alt={`${chosen.client} — ${chosen.title}`} fetchPriority="high"/>}
            {chosen.video.provider!=='vimeo'&&<span className="frame-play" aria-hidden="true"><Play size={22} fill="currentColor"/></span>}
            {dragged&&<div className="frame-drop-hint" aria-hidden="true"><Play size={18}/><span>{it?'Rilascia per riprodurre':'Drop to play'}</span></div>}
          </div>
          <div className="filmstrip-wrap"><div className="filmstrip" ref={filmstrip} aria-label={it?'Seleziona un video':'Select a video'}>{visible.map(p=><button key={p.slug} draggable onDragStart={event=>{event.dataTransfer.setData('application/x-portfolio-project',p.slug);event.dataTransfer.effectAllowed='copy';setDragged(p.slug)}} onDragEnd={endDrag} className={`${chosen.slug===p.slug?'selected':''}${dragged===p.slug?' dragging':''}`} aria-pressed={chosen.slug===p.slug} onClick={()=>selectPreview(p.slug)} aria-label={`${p.client} — ${p.title}${p.variant?` / ${p.variant}`:''}`} title={`${p.client} — ${p.title}`}><img src={p.poster} alt="" loading="lazy" draggable={false}/><span>{p.number}</span></button>)}</div>{stripProgress.size<1&&<div className="filmstrip-scroll" aria-hidden="true"><button className="filmstrip-thumb" onPointerDown={dragStripScroll} style={{height:`${stripProgress.size*100}%`,top:`${stripProgress.top*(1-stripProgress.size)*100}%`}} /></div>}</div>
          <div className="film-caption"><div><span>{chosen.client}</span><h2>{chosen.title}{chosen.variant&&/teaser|trailer|behind/i.test(chosen.variant)&&<small> / {chosen.variant}</small>}</h2></div><div className="scene-controls"><span>{String(index+1).padStart(2,'0')} / {visible.length}</span><button onClick={()=>move(-1)} aria-label={it?'Video precedente':'Previous video'}><ArrowLeft size={18}/></button><button onClick={()=>move(1)} aria-label={it?'Video successivo':'Next video'}><ArrowRight size={18}/></button></div></div>
        </section>:<section className="project-grid" aria-label={it?'Tutti i video':'All videos'}>{visible.map(p=><a key={p.slug} href={projectPath(base,p)} onClick={e=>{if(!e.ctrlKey&&!e.metaKey&&!e.shiftKey){e.preventDefault();openProject(p)}}}><img src={p.poster} alt={`${p.client} — ${p.title}`} loading="lazy"/><span>{p.client}</span><h2>{p.title}{p.variant&&/teaser|trailer|behind/i.test(p.variant)&&<small> / {p.variant}</small>}</h2></a>)}</section>}
      </>:view==='about'?<section className="editorial-page"><h1>About</h1><div><p className="about-intro">{t.aboutBody}</p><p>{t.aboutNote}</p></div></section>:<section className="editorial-page"><h1>Contact</h1><a className="contact-action" href="https://vimeo.com/matteocataldo" target="_blank" rel="noreferrer">Vimeo <ArrowUpRight size={30}/></a></section>}
    </main>
    <footer className="studio-footer"><span>© {new Date().getFullYear()} Matteo Cataldo</span></footer>
    {active&&<ProjectDialog project={active} lang={lang} close={closeProject}/>}
  </div>
}
