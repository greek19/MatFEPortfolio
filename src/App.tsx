import { useEffect, useMemo, useRef, useState } from 'react'
import Player from '@vimeo/player'
import { ArrowDown, ArrowLeft, ArrowUpRight, Menu, Pause, Play, X } from 'lucide-react'
import { categoryLabels, copy, projects } from './data'
import type { Category, Lang, Project } from './types'

type VimeoTimeUpdate = { seconds: number; duration: number }

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

  const formatTime = (value: number) => {
    const minutes = Math.floor(value / 60)
    const seconds = Math.floor(value % 60)
    return `${minutes}:${String(seconds).padStart(2, '0')}`
  }

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
    {ready
      ? <><iframe ref={iframeRef} src={`https://player.vimeo.com/video/${project.video.id}?autoplay=1&muted=1&controls=0&playsinline=1&dnt=1`} title={title} allow="autoplay; fullscreen; picture-in-picture" allowFullScreen /><button className="video-toggle-surface" onClick={togglePlayback} aria-label={playing ? 'Metti in pausa il video' : 'Riproduci il video'} /><div className={`video-controls${controlsVisible ? ' is-visible' : ''}`}><button onClick={togglePlayback} aria-label={playing ? 'Pausa video' : 'Riproduci video'}>{playing ? <Pause size={14} fill="currentColor" /> : <Play size={14} fill="currentColor" />}</button><span>{formatTime(time.seconds)}</span><input type="range" min="0" max={time.duration || 1} step="0.1" value={time.seconds} aria-label="Avanzamento video" onChange={(event) => playerRef.current?.setCurrentTime(Number(event.target.value))} /><span>{formatTime(time.duration)}</span></div></>
      : <button className="video-start" onClick={() => setReady(true)} aria-label={`${title}: play`}><Play size={18} fill="currentColor" /><span>Play</span></button>}
  </div>
}

export default function App() {
  const [lang, setLang] = useState<Lang>('it')
  const [filter, setFilter] = useState<Category | 'all'>('all')
  const [active, setActive] = useState<Project | null>(null)
  const [menuOpen, setMenuOpen] = useState(false)
  const [headerCompact, setHeaderCompact] = useState(false)
  const t = copy[lang]
  const visibleProjects = useMemo(() => projects.filter((project) => filter === 'all' || project.category === filter), [filter])

  useEffect(() => { document.documentElement.lang = lang }, [lang])
  useEffect(() => {
    document.body.style.overflow = active || menuOpen ? 'hidden' : ''
    return () => { document.body.style.overflow = '' }
  }, [active, menuOpen])
  useEffect(() => {
    const updateHeader = () => setHeaderCompact(window.scrollY > 72)
    updateHeader()
    window.addEventListener('scroll', updateHeader, { passive: true })
    return () => window.removeEventListener('scroll', updateHeader)
  }, [])

  const goTo = (id: string) => {
    setMenuOpen(false)
    document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' })
  }

  return <div className="app">
    <div className="grain" aria-hidden="true" />
    <header className={`site-header${headerCompact ? ' is-compact' : ''}`}>
      <button className="wordmark" onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })} aria-label="Torna all'inizio">MATTEO<br />CATALDO</button>
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
        <div className="hero-copy">
          <p>{t.role}</p>
          <h1 id="hero-title">Matteo<br /><em>Cataldo</em></h1>
          <div className="hero-bottom"><span>{t.intro}</span><button onClick={() => goTo('work')}>{t.viewWork}<ArrowDown size={16} /></button></div>
        </div>
        <div className="hero-media">
          <img src={projects[0].poster} alt="" fetchPriority="high" />
          <div><span>Selected / {projects[0].year}</span><strong>{projects[0].client}</strong><small>{projects[0].title}</small></div>
        </div>
      </section>

      <section className="work-section" id="work" aria-labelledby="work-title">
        <div className="section-top"><h2 id="work-title">{t.selected}</h2><span>({String(visibleProjects.length).padStart(2, '0')})</span></div>
        <div className="filters" role="group" aria-label="Filtra progetti">
          <button className={filter === 'all' ? 'active' : ''} onClick={() => setFilter('all')}>{t.all}</button>
          {(Object.keys(categoryLabels) as Category[]).map((category) => <button key={category} className={filter === category ? 'active' : ''} onClick={() => setFilter(category)}>{categoryLabels[category][lang]}</button>)}
        </div>
        <div className="project-grid" aria-live="polite">
          {visibleProjects.map((project) => <article className="project-card" key={project.slug}>
            <button className="project-image" onClick={() => setActive(project)} aria-label={`${t.view}: ${project.title}`}>
              <img src={project.poster} alt="" loading="lazy" />
              <span className="project-play"><Play size={15} fill="currentColor" /></span>
              <span className="project-index">{project.number}</span>
            </button>
            <button className="project-caption" onClick={() => setActive(project)}>
              <span><strong>{project.client}</strong><small>{project.title}</small></span><span>{project.year}<ArrowUpRight size={15} /></span>
            </button>
          </article>)}
        </div>
      </section>

      <section className="about-section" id="about" aria-labelledby="about-title">
        <div className="about-label"><span>01</span><span>{t.nav.about}</span></div>
        <h2 id="about-title">{t.aboutTitle}</h2>
        <div className="about-detail"><p>{t.aboutBody}</p><p>{t.aboutMeta}</p></div>
      </section>

      <section className="contact-section" id="contact" aria-labelledby="contact-title">
        <span>02 / {t.nav.contact}</span>
        <h2 id="contact-title">{t.contactTitle}</h2>
        <a className="contact-link" href="mailto:hello@matteocataldo.com">{t.email}<ArrowUpRight /></a>
        <a className="vimeo-link" href="https://vimeo.com/matteocataldo" target="_blank" rel="noreferrer">Vimeo <ArrowUpRight size={14} /></a>
      </section>
    </main>

    <footer><span>© {new Date().getFullYear()} Matteo Cataldo</span><span>{t.role}</span><button onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}>Top ↑</button></footer>

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
