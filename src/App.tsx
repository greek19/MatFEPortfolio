import { useEffect, useMemo, useState, type CSSProperties } from 'react'
import { ArrowDownRight, ArrowLeft, ArrowUpRight, Menu, Pause, Play, VolumeX, X } from 'lucide-react'
import { categoryLabels, copy, projects } from './data'
import type { Category, Lang, Project } from './types'

type Mode = 'experience' | 'index'

function useTimecode() {
  const [frames, setFrames] = useState(0)
  useEffect(() => {
    const started = performance.now()
    const timer = window.setInterval(() => setFrames(Math.floor((performance.now() - started) / 40)), 40)
    return () => window.clearInterval(timer)
  }, [])
  const ff = frames % 25
  const seconds = Math.floor(frames / 25)
  const ss = seconds % 60
  const mm = Math.floor(seconds / 60) % 60
  const hh = Math.floor(seconds / 3600)
  return [hh, mm, ss, ff].map((n) => String(n).padStart(2, '0')).join(':')
}

function VideoEmbed({ project, title }: { project: Project; title: string }) {
  const src = project.video.provider === 'vimeo'
    ? `https://player.vimeo.com/video/${project.video.id}?title=0&byline=0&portrait=0`
    : `https://www.youtube-nocookie.com/embed/${project.video.id}?rel=0`
  return <iframe src={src} title={title} allow="autoplay; fullscreen; picture-in-picture" allowFullScreen loading="lazy" />
}

export default function App() {
  const [lang, setLang] = useState<Lang>('it')
  const [mode, setMode] = useState<Mode>('experience')
  const [filter, setFilter] = useState<Category | 'all'>('all')
  const [active, setActive] = useState<Project | null>(null)
  const [menuOpen, setMenuOpen] = useState(false)
  const [playing, setPlaying] = useState(true)
  const timecode = useTimecode()
  const t = copy[lang]
  const visibleProjects = useMemo(
    () => projects.filter((project) => filter === 'all' || project.category === filter),
    [filter],
  )

  useEffect(() => {
    document.documentElement.lang = lang
  }, [lang])

  useEffect(() => {
    document.body.style.overflow = active || menuOpen ? 'hidden' : ''
    return () => { document.body.style.overflow = '' }
  }, [active, menuOpen])

  const goTo = (id: string) => {
    setMenuOpen(false)
    document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' })
  }

  return (
    <div className={`app mode-${mode}`}>
      <div className="grain" aria-hidden="true" />
      <div className="playhead" aria-hidden="true"><span /></div>

      <header className="site-header">
        <button className="brand" onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })} aria-label="Torna all'inizio">
          MAT<span>®</span>
        </button>
        <nav className="desktop-nav" aria-label="Navigazione principale">
          <button onClick={() => goTo('work')}>{t.nav.work}</button>
          <button onClick={() => goTo('about')}>{t.nav.about}</button>
          <button onClick={() => goTo('contact')}>{t.nav.contact}</button>
        </nav>
        <div className="header-tools">
          <div className="language" aria-label="Lingua">
            {(['it', 'en'] as Lang[]).map((item) => (
              <button key={item} className={lang === item ? 'active' : ''} onClick={() => setLang(item)} aria-pressed={lang === item}>
                {item.toUpperCase()}
              </button>
            ))}
          </div>
          <button className="menu-button" onClick={() => setMenuOpen(true)} aria-label={t.menu}><Menu size={20} /></button>
        </div>
      </header>

      <main id="main">
        <section className="hero" aria-labelledby="hero-title">
          <div className="hero-topline">
            <span>SEQ / 001</span>
            <span className="timecode">{timecode}</span>
            <span>25 FPS</span>
          </div>
          <p className="eyebrow">{t.eyebrow}</p>
          <h1 id="hero-title">
            <span>{t.heroA}</span>
            <span className="indent">{t.heroB}</span>
            <span>{t.heroC}</span>
          </h1>
          <div className="hero-footer">
            <p>{t.intro}</p>
            <div className="hero-actions">
              <button className="primary-action" onClick={() => { setMode('experience'); goTo('work') }}>
                <Play size={15} fill="currentColor" /> {t.experience}
              </button>
              <button className="text-action" onClick={() => { setMode('index'); goTo('work') }}>
                {t.index} <ArrowDownRight size={17} />
              </button>
            </div>
          </div>
          <div className={`hero-reel ${playing ? 'is-playing' : ''}`} aria-hidden="true">
            {projects.slice(0, 4).map((project) => (
              <div key={project.slug} style={{ '--tone': project.tone } as CSSProperties}>
                <span>{project.number}</span>
                <strong>{project.title}</strong>
              </div>
            ))}
          </div>
          <button className="reel-control" onClick={() => setPlaying(!playing)} aria-label={playing ? 'Pausa animazione' : 'Avvia animazione'}>
            {playing ? <Pause size={14} /> : <Play size={14} />} <VolumeX size={14} />
          </button>
        </section>

        <section className="work-section" id="work" aria-labelledby="work-title">
          <div className="section-heading">
            <div>
              <span className="section-index">01 — 04</span>
              <h2 id="work-title">{t.selected}</h2>
            </div>
            <div className="view-toggle" aria-label="Modalità visualizzazione">
              <button className={mode === 'experience' ? 'active' : ''} onClick={() => setMode('experience')} aria-pressed={mode === 'experience'}>{t.modeExperience}</button>
              <button className={mode === 'index' ? 'active' : ''} onClick={() => setMode('index')} aria-pressed={mode === 'index'}>{t.modeIndex}</button>
            </div>
          </div>
          <div className="filters" role="group" aria-label="Filtra progetti">
            <button className={filter === 'all' ? 'active' : ''} onClick={() => setFilter('all')}>{t.all}</button>
            {(Object.keys(categoryLabels) as Category[]).map((category) => (
              <button key={category} className={filter === category ? 'active' : ''} onClick={() => setFilter(category)}>
                {categoryLabels[category][lang]}
              </button>
            ))}
          </div>

          <div className="projects" aria-live="polite">
            {visibleProjects.map((project, index) => (
              <article className="project-card" key={project.slug}>
                <button className="project-visual" onClick={() => setActive(project)} aria-label={`${t.view}: ${project.title}`} style={{ '--tone': project.tone } as CSSProperties}>
                  <span className="project-number">{project.number}</span>
                  <span className="frame-lines" />
                  <span className="preview-word">{project.title}</span>
                  <span className="preview-cue"><Play size={14} fill="currentColor" /> PLAY</span>
                </button>
                <button className="project-info" onClick={() => setActive(project)}>
                  <span className="project-title">{project.title}</span>
                  <span>{project.client}</span>
                  <span>{categoryLabels[project.category][lang]}</span>
                  <span>{project.year}</span>
                  <ArrowUpRight className="project-arrow" size={18} />
                </button>
                {mode === 'experience' && <p className="project-statement">{project.statement[lang]}</p>}
                {index < visibleProjects.length - 1 && <div className="cut-marker">CUT {String(index + 1).padStart(2, '0')}</div>}
              </article>
            ))}
          </div>
        </section>

        <section className="about-section" id="about" aria-labelledby="about-title">
          <div className="about-meta">
            <span>{t.aboutLabel}</span>
            <span>EDITORIAL NOTE</span>
          </div>
          <div className="portrait-placeholder" aria-label="Spazio riservato al ritratto">
            <span>PORTRAIT<br />PLACEHOLDER</span>
          </div>
          <div className="about-copy">
            <h2 id="about-title">{t.aboutTitle}</h2>
            <p>{t.aboutBody}</p>
          </div>
          <ul className="services">
            {t.services.map((service, index) => <li key={service}><span>0{index + 1}</span>{service}</li>)}
          </ul>
        </section>

        <section className="contact-section" id="contact" aria-labelledby="contact-title">
          <span>{t.contactLabel}</span>
          <h2 id="contact-title">{t.contactTitle}</h2>
          <p>{t.contactBody}</p>
          <a className="contact-link" href="mailto:hello@example.com">
            {t.email} <ArrowUpRight size={28} />
          </a>
          <div className="contact-socials">
            <a href="https://vimeo.com/" target="_blank" rel="noreferrer">Vimeo ↗</a>
            <a href="https://youtube.com/" target="_blank" rel="noreferrer">YouTube ↗</a>
            <a href="#" onClick={(event) => event.preventDefault()}>Instagram ↗</a>
          </div>
        </section>
      </main>

      <footer>
        <span>© {new Date().getFullYear()} MAT</span>
        <span>{t.footer}</span>
        <button onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}>TOP ↑</button>
      </footer>

      {menuOpen && (
        <div className="mobile-menu" role="dialog" aria-modal="true" aria-label={t.menu}>
          <div className="mobile-menu-top"><span>MAT®</span><button onClick={() => setMenuOpen(false)} aria-label={t.close}><X /></button></div>
          <nav>
            <button onClick={() => goTo('work')}>01 <span>{t.nav.work}</span></button>
            <button onClick={() => goTo('about')}>02 <span>{t.nav.about}</span></button>
            <button onClick={() => goTo('contact')}>03 <span>{t.nav.contact}</span></button>
          </nav>
          <span className="timecode">{timecode}</span>
        </div>
      )}

      {active && (
        <div className="project-modal" role="dialog" aria-modal="true" aria-labelledby="project-modal-title">
          <div className="modal-topbar">
            <button onClick={() => setActive(null)}><ArrowLeft size={17} /> {t.close}</button>
            <span className="timecode">{timecode}</span>
            <span>{active.number} / 06</span>
          </div>
          <div className="modal-hero" style={{ '--tone': active.tone } as CSSProperties}>
            <span>{categoryLabels[active.category][lang]} / {active.year}</span>
            <h2 id="project-modal-title">{active.title}</h2>
            <span className="modal-client">{active.client}</span>
          </div>
          <div className="modal-content">
            <div>
              <span className="modal-label">{t.overview}</span>
              <p className="modal-lead">{active.description[lang]}</p>
            </div>
            <dl>
              <div><dt>{t.contribution}</dt><dd>{active.roles.join(' · ')}</dd></div>
              <div><dt>Runtime</dt><dd>{active.duration}</dd></div>
              <div><dt>Year</dt><dd>{active.year}</dd></div>
            </dl>
            <div className="video-shell">
              <VideoEmbed project={active} title={`${active.title} — ${t.watch}`} />
            </div>
            <p className="modal-statement">{active.statement[lang]}</p>
          </div>
        </div>
      )}
    </div>
  )
}
