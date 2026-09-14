import { useEffect, useMemo, useRef, useState } from 'react'
import Player from '@vimeo/player'
import { ArrowDown, ArrowLeft, ArrowUpRight, Menu, Pause, Play, X } from 'lucide-react'
import { categoryLabels, copy, projects } from './data'
import type { Category, Lang, Project } from './types'

type VimeoTimeUpdate = { seconds: number; duration: number }
type WorkView = 'sequence' | 'index'

function formatClock(value: number) {
  const minutes = Math.floor(value / 60)
  const seconds = Math.floor(value % 60)
  return `${minutes}:${String(seconds).padStart(2, '0')}`
}

function formatScrollTime(progress: number) {
  const totalFrames = Math.floor(progress * 86399)
  const hours = Math.floor(totalFrames / 3600)
  const minutes = Math.floor((totalFrames % 3600) / 60)
  const seconds = totalFrames % 60
  return [hours, minutes, seconds, Math.floor(progress * 24)].map((part) => String(part).padStart(2, '0')).join(':')
}

function AutoVideo({ project, title }: { project: Project; title: string }) {
  const shellRef = useRef<HTMLDivElement>(null)
  const iframeRef = useRef<HTMLIFrameElement>(null)
  const playerRef = useRef<Player | null>(null)
  const controlsTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const [ready, setReady] = useState(false)
  const [playing, setPlaying] = useState(false)
  const [controlsVisible, setControlsVisible] = useState(false)
  const [time, setTime] = useState({ seconds: 0, duration: 0 })

  useEffect(() => {
    const shell = shellRef.current
    if (!shell || ready) return
    const observer = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting && entry.intersectionRatio >= 1) {
        setReady(true)
        observer.disconnect()
      }
    }, { threshold: 1 })
    observer.observe(shell)
    return () => observer.disconnect()
  }, [ready])

  useEffect(() => {
    const iframe = iframeRef.current
    if (!ready || !iframe) return
    const player = new Player(iframe)
    playerRef.current = player
    const onTimeUpdate = (event: VimeoTimeUpdate) => setTime({ seconds: event.seconds, duration: event.duration })
    player.on('timeupdate', onTimeUpdate)
    player.on('play', () => setPlaying(true))
    player.on('pause', () => setPlaying(false))
    player.ready().then(async () => {
      await player.setLoop(false)
      await player.setMuted(true)
      await player.play()
    }).catch(() => setPlaying(false))
    return () => {
      player.off('timeupdate', onTimeUpdate)
      player.destroy().catch(() => undefined)
      playerRef.current = null
    }
  }, [ready, project.video.id])

  const togglePlayback = () => {
    if (!playerRef.current) return
    if (playing) playerRef.current.pause()
    else playerRef.current.play()
  }

  const revealControls = () => {
    setControlsVisible(true)
    if (controlsTimerRef.current) clearTimeout(controlsTimerRef.current)
    controlsTimerRef.current = setTimeout(() => {
      if (!shellRef.current?.matches(':focus-within')) setControlsVisible(false)
    }, 1600)
  }

  useEffect(() => () => {
    if (controlsTimerRef.current) clearTimeout(controlsTimerRef.current)
  }, [])

  return <div className="video-shell" ref={shellRef} onPointerMove={revealControls} onPointerDown={revealControls} onFocus={revealControls}>
    {ready ? <>
      <iframe ref={iframeRef} src={`https://player.vimeo.com/video/${project.video.id}?autoplay=1&muted=1&controls=0&playsinline=1&dnt=1`} title={title} allow="autoplay; fullscreen; picture-in-picture" allowFullScreen />
      <button className="video-toggle-surface" onClick={togglePlayback} aria-label={playing ? 'Metti in pausa il video' : 'Riproduci il video'} />
      <div className={`video-controls${controlsVisible ? ' is-visible' : ''}`}>
        <button onClick={togglePlayback} aria-label={playing ? 'Pausa video' : 'Riproduci video'}>{playing ? <Pause size={14} fill="currentColor" /> : <Play size={14} fill="currentColor" />}</button>
        <span>{formatClock(time.seconds)}</span>
        <input type="range" min="0" max={time.duration || 1} step="0.1" value={time.seconds} aria-label="Avanzamento video" onChange={(event) => playerRef.current?.setCurrentTime(Number(event.target.value))} />
        <span>{formatClock(time.duration)}</span>
      </div>
    </> : <button className="video-start" onClick={() => setReady(true)} aria-label={`${title}: play`}><Play size={18} fill="currentColor" /><span>Play</span></button>}
  </div>
}

export default function App() {
  const [lang, setLang] = useState<Lang>('it')
  const [filter, setFilter] = useState<Category | 'all'>('all')
  const [active, setActive] = useState<Project | null>(null)
  const [menuOpen, setMenuOpen] = useState(false)
  const [headerCompact, setHeaderCompact] = useState(false)
  const [workView, setWorkView] = useState<WorkView>('sequence')
  const [hovered, setHovered] = useState<Project>(projects[0])
  const [scrollProgress, setScrollProgress] = useState(0)
  const t = copy[lang]
  const availableCategories = useMemo(() => (Object.keys(categoryLabels) as Category[]).filter((category) => projects.some((project) => project.category === category)), [])
  const visibleProjects = useMemo(() => projects.filter((project) => filter === 'all' || project.category === filter), [filter])

  useEffect(() => { document.documentElement.lang = lang }, [lang])
  useEffect(() => {
    document.body.style.overflow = active || menuOpen ? 'hidden' : ''
    const closeOnEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setActive(null)
        setMenuOpen(false)
      }
    }
    window.addEventListener('keydown', closeOnEscape)
    return () => {
      document.body.style.overflow = ''
      window.removeEventListener('keydown', closeOnEscape)
    }
  }, [active, menuOpen])

  useEffect(() => {
    const updateScroll = () => {
      const max = document.documentElement.scrollHeight - window.innerHeight
      setHeaderCompact(window.scrollY > 72)
      setScrollProgress(max > 0 ? Math.min(window.scrollY / max, 1) : 0)
    }
    updateScroll()
    window.addEventListener('scroll', updateScroll, { passive: true })
    window.addEventListener('resize', updateScroll)
    return () => {
      window.removeEventListener('scroll', updateScroll)
      window.removeEventListener('resize', updateScroll)
    }
  }, [])

  useEffect(() => {
    if (!visibleProjects.includes(hovered)) setHovered(visibleProjects[0] ?? projects[0])
  }, [hovered, visibleProjects])

  useEffect(() => {
    if (filter !== 'all' && !availableCategories.includes(filter)) setFilter('all')
  }, [availableCategories, filter])

  const goTo = (id: string) => {
    setMenuOpen(false)
    document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' })
  }

  return <div className="app v2">
    <a className="skip-link" href="#main">Skip to content</a>
    <div className="grain" aria-hidden="true" />
    <aside className="playhead" aria-hidden="true"><span className="playhead-time">{formatScrollTime(scrollProgress)}</span><i><b style={{ transform: `scaleY(${scrollProgress})` }} /></i></aside>

    <header className={`site-header${headerCompact ? ' is-compact' : ''}`}>
      <button className="wordmark" onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })} aria-label="Torna all'inizio"><span>MC</span><small>Editor<br />Colorist</small></button>
      <nav className="desktop-nav" aria-label="Navigazione principale">
        <button onClick={() => goTo('work')}>{t.nav.work}</button>
        <button onClick={() => goTo('about')}>{t.nav.about}</button>
        <button onClick={() => goTo('contact')}>{t.nav.contact}</button>
      </nav>
      <div className="header-right">
        <a href="https://vimeo.com/matteocataldo" target="_blank" rel="noreferrer">Vimeo <ArrowUpRight size={12} /></a>
        <div className="language">{(['it', 'en'] as Lang[]).map((item) => <button key={item} className={item === lang ? 'active' : ''} onClick={() => setLang(item)} aria-pressed={item === lang}>{item}</button>)}</div>
        <button className="menu-button" onClick={() => setMenuOpen(true)} aria-label={t.menu}><Menu size={19} /></button>
      </div>
    </header>

    <main id="main">
      <section className="hero" aria-labelledby="hero-title">
        <div className="hero-kicker"><span>{t.role}</span><span>Milano / Worldwide</span><span>Est. MMXXVI</span></div>
        <div className="hero-collage" aria-hidden="true">
          <figure className="hero-frame frame-one"><img src={projects[0].poster} alt="" fetchPriority="high" /><figcaption>01 / Music</figcaption></figure>
          <figure className="hero-frame frame-two"><img src={projects[2].poster} alt="" /><figcaption>03 / Film</figcaption></figure>
          <figure className="hero-frame frame-three"><img src={projects[4].poster} alt="" /><figcaption>05 / Edit</figcaption></figure>
        </div>
        <h1 id="hero-title"><span>Matteo</span><span>Cataldo</span></h1>
        <div className="hero-foot"><p>{t.intro}</p><button onClick={() => goTo('work')}>{t.viewWork}<ArrowDown size={15} /></button><span>Scroll to cut</span></div>
        <div className="hero-ticker" aria-hidden="true"><div>EDITING · COLOUR · RHYTHM · MUSIC · FILM · MOVING IMAGES · EDITING · COLOUR · RHYTHM · MUSIC · FILM · MOVING IMAGES ·</div></div>
      </section>

      <section className="work-section" id="work" aria-labelledby="work-title">
        <div className="work-heading"><span>01 / Portfolio</span><h2 id="work-title">{t.selected}</h2><div className="view-switch" role="group" aria-label="Visualizzazione lavori"><button className={workView === 'sequence' ? 'active' : ''} onClick={() => setWorkView('sequence')} aria-pressed={workView === 'sequence'}>{t.sequence}</button><span>/</span><button className={workView === 'index' ? 'active' : ''} onClick={() => setWorkView('index')} aria-pressed={workView === 'index'}>{t.index}</button></div></div>
        <div className="filters" role="group" aria-label="Filtra progetti">
          <button className={filter === 'all' ? 'active' : ''} onClick={() => setFilter('all')}>{t.all}</button>
          {availableCategories.map((category) => <button key={category} className={filter === category ? 'active' : ''} onClick={() => setFilter(category)}>{categoryLabels[category][lang]}</button>)}
          <span>{String(visibleProjects.length).padStart(2, '0')} cuts</span>
        </div>

        {workView === 'sequence' ? <div className="project-sequence" aria-live="polite">
          {visibleProjects.map((project, index) => <article className="sequence-card" key={project.slug}>
            <div className="sequence-meta"><span>{project.number}</span><span>{categoryLabels[project.category][lang]}</span><span>{project.duration}</span></div>
            <button className="sequence-visual" onClick={() => setActive(project)} aria-label={`${t.view}: ${project.title}`}>
              <img src={project.poster} alt="" loading={index < 2 ? 'eager' : 'lazy'} />
              <span className="sequence-play"><Play size={18} fill="currentColor" /></span>
            </button>
            <button className="sequence-copy" onClick={() => setActive(project)}><span>{project.client}</span><strong>{project.title}</strong><small>{project.year} · {project.roles.join(' / ')}</small></button>
          </article>)}
        </div> : <div className="project-index-layout" aria-live="polite">
          <div className="project-index-list">
            {visibleProjects.map((project) => <button key={project.slug} onPointerEnter={() => setHovered(project)} onFocus={() => setHovered(project)} onClick={() => setActive(project)}>
              <span>{project.number}</span><strong>{project.client}</strong><em>{project.title}</em><small>{project.year}</small><ArrowUpRight size={16} />
            </button>)}
          </div>
          <button className="index-preview" onClick={() => setActive(hovered)} aria-label={`${t.view}: ${hovered.title}`}><img src={hovered.poster} alt="" /><span>{hovered.duration} / Play</span></button>
        </div>}
      </section>

      <section className="manifesto" id="about" aria-labelledby="about-title">
        <div className="manifesto-strip" aria-hidden="true">{projects.slice(0, 5).map((project) => <img key={project.slug} src={project.poster} alt="" loading="lazy" />)}</div>
        <div className="manifesto-grid"><span>02 / {t.nav.about}</span><h2 id="about-title">{t.aboutTitle}</h2><p>{t.aboutBody}</p><p>{t.aboutMeta}</p></div>
      </section>

      <section className="contact-section" id="contact" aria-labelledby="contact-title">
        <span>03 / {t.nav.contact}</span><span className="contact-status">● Available for selected projects</span>
        <h2 id="contact-title">{t.contactTitle}</h2>
        <a className="contact-link" href="mailto:hello@matteocataldo.com">hello@matteocataldo.com <ArrowUpRight /></a>
        <div className="contact-foot"><span>Milano, IT</span><a href="https://vimeo.com/matteocataldo" target="_blank" rel="noreferrer">Vimeo ↗</a><button onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}>Back to top ↑</button></div>
      </section>
    </main>

    {menuOpen && <div className="mobile-menu" role="dialog" aria-modal="true" aria-label={t.menu}>
      <div><span>MATTEO CATALDO</span><button onClick={() => setMenuOpen(false)} aria-label={t.close}><X size={22} /></button></div>
      <nav><button onClick={() => goTo('work')}>01 <span>{t.nav.work}</span></button><button onClick={() => goTo('about')}>02 <span>{t.nav.about}</span></button><button onClick={() => goTo('contact')}>03 <span>{t.nav.contact}</span></button></nav>
      <a href="https://vimeo.com/matteocataldo" target="_blank" rel="noreferrer">Vimeo ↗</a>
    </div>}

    {active && <div className="project-modal" role="dialog" aria-modal="true" aria-labelledby="project-modal-title">
      <div className="modal-bar"><button onClick={() => setActive(null)}><ArrowLeft size={17} /> {t.close}</button><span>{active.number} / {String(projects.length).padStart(2, '0')}</span></div>
      <div className="project-layout">
        <div className="project-main"><AutoVideo key={active.slug} project={active} title={`${active.client} — ${active.title}`} /><p className="modal-intro">{active.description[lang]}</p></div>
        <aside className="project-aside"><span>{categoryLabels[active.category][lang]} · {active.year}</span><h2 id="project-modal-title">{active.client}<br /><em>{active.title}</em></h2><dl><div><dt>{t.contribution}</dt><dd>{active.roles.join(' · ')}</dd></div><div><dt>Runtime</dt><dd>{active.duration}</dd></div></dl><p>{active.statement[lang]}</p><a href={`https://vimeo.com/${active.video.id}`} target="_blank" rel="noreferrer">{t.watch}<ArrowUpRight size={16} /></a></aside>
      </div>
    </div>}
  </div>
}
