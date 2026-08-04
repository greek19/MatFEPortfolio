import { useEffect, useMemo, useState } from 'react'
import { ArrowDown, ArrowLeft, ArrowUpRight, Menu, Play, X } from 'lucide-react'
import { categoryLabels, copy, projects } from './data'
import type { Category, Lang, Project } from './types'

function VideoEmbed({ project, title }: { project: Project; title: string }) {
  return <iframe src={`https://player.vimeo.com/video/${project.video.id}?title=0&byline=0&portrait=0&dnt=1`} title={title} allow="autoplay; fullscreen; picture-in-picture" allowFullScreen loading="lazy" />
}

export default function App() {
  const [lang, setLang] = useState<Lang>('it')
  const [filter, setFilter] = useState<Category | 'all'>('all')
  const [active, setActive] = useState<Project | null>(null)
  const [menuOpen, setMenuOpen] = useState(false)
  const t = copy[lang]
  const visibleProjects = useMemo(() => projects.filter((project) => filter === 'all' || project.category === filter), [filter])

  useEffect(() => { document.documentElement.lang = lang }, [lang])
  useEffect(() => {
    document.body.style.overflow = active || menuOpen ? 'hidden' : ''
    return () => { document.body.style.overflow = '' }
  }, [active, menuOpen])

  const goTo = (id: string) => {
    setMenuOpen(false)
    document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' })
  }

  return <div className="app">
    <div className="grain" aria-hidden="true" />
    <header className="site-header">
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
        <div className="hero-image" style={{ backgroundImage: `url(${projects[0].poster})` }} aria-hidden="true" />
        <div className="hero-overlay" aria-hidden="true" />
        <div className="hero-content">
          <p>{t.role}</p>
          <h1 id="hero-title">Matteo<br /><em>Cataldo</em></h1>
          <div className="hero-bottom"><span>{t.intro}</span><button onClick={() => goTo('work')}>{t.viewWork}<ArrowDown size={16} /></button></div>
        </div>
        <span className="hero-credit">{projects[0].client} — {projects[0].title}</span>
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
      <div className="modal-image"><img src={active.poster} alt="" /><div><span>{categoryLabels[active.category][lang]} · {active.year}</span><h2 id="project-modal-title">{active.client}<br /><em>{active.title}</em></h2></div></div>
      <div className="modal-body"><p className="modal-intro">{active.description[lang]}</p><dl><div><dt>{t.contribution}</dt><dd>{active.roles.join(' · ')}</dd></div><div><dt>Runtime</dt><dd>{active.duration}</dd></div></dl><p>{active.statement[lang]}</p><div className="video-shell"><VideoEmbed project={active} title={`${active.client} — ${active.title}`} /></div><a href={`https://vimeo.com/${active.video.id}`} target="_blank" rel="noreferrer">{t.watch}<ArrowUpRight size={16} /></a></div>
    </div>}
  </div>
}
