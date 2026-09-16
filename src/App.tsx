import { useEffect, useRef, useState } from 'react'
import { ArrowUpRight } from 'lucide-react'
import { applyTheme, isTheme, readTheme, themes } from './themes'
import type { ThemeId } from './themes'

type Version = { id: string; branch: string; label: string; description: string }
const base = import.meta.env.BASE_URL
export default function App() {
  const [versions, setVersions] = useState<Version[]>([])
  const [selectedId, setSelectedId] = useState(new URLSearchParams(location.search).get('version'))
  const [theme, setTheme] = useState<ThemeId>(readTheme)
  const [loaded, setLoaded] = useState(false)
  const [error, setError] = useState(false)
  const iframe = useRef<HTMLIFrameElement>(null)
  useEffect(() => {
    fetch(`${base}demo-versions.json`).then(r => { if (!r.ok) throw Error(); return r.json() }).then(setVersions).catch(() => setError(true))
    const sync = () => { setSelectedId(new URLSearchParams(location.search).get('version')); setTheme(readTheme()) }
    window.addEventListener('popstate', sync)
    return () => window.removeEventListener('popstate', sync)
  }, [])
  const selected = versions.find(v => v.id === selectedId) ?? versions[versions.length - 1]
  // Same-origin paths work locally and on Pages; no stale online builds in local previews.
  const versionUrl = selected ? `${base}${selected.id}/index.html` : ''
  useEffect(() => {
    applyTheme(theme)
    iframe.current?.contentWindow?.postMessage({ type: 'portfolio-theme', id: theme }, location.origin)
  }, [theme, loaded])
  function updateUrl(key: string, value: string) {
    const url = new URL(location.href); url.searchParams.set(key, value); history.pushState({}, '', url)
  }
  return <main className="demo-shell">
    <header className="demo-toolbar">
      <div className="demo-brand"><strong>MATTEO CATALDO</strong><span>Design archive</span></div>
      <nav aria-label="Versione portfolio">{versions.map(v => <button key={v.id} aria-label={`${v.label} ${v.description}`} aria-pressed={v.id === selected?.id} className={v.id === selected?.id ? 'active' : ''} onClick={() => { if (v.id !== selected?.id) setLoaded(false); setSelectedId(v.id); updateUrl('version', v.id) }}><span className="version-label">{v.label}</span><span className="version-short" aria-hidden="true">{v.id.toUpperCase()}</span><small>{v.description}</small></button>)}</nav>
      <div className="demo-tools"><label className="theme-picker"><span>Palette</span><select aria-label="Palette colori per tutte le versioni" value={theme} onChange={e => { if (isTheme(e.target.value)) { setTheme(e.target.value); updateUrl('theme', e.target.value) } }}>{Object.entries(themes).map(([id, item]) => <option key={id} value={id}>{item.name}</option>)}</select></label><a href={`${versionUrl}?theme=${theme}`} target="_blank" rel="noreferrer" aria-label="Apri versione a schermo intero"><ArrowUpRight size={18} /></a></div>
    </header>
    <section className="demo-stage">
      {error && <div className="demo-message">Configurazione non disponibile. Ricarica la pagina.</div>}
      {!loaded && !error && <div className="demo-loading" role="status">Caricamento portfolio…</div>}
      {selected && <iframe ref={iframe} key={selected.id} src={versionUrl} title={`Matteo Cataldo — ${selected.label}`} className={loaded ? 'is-loaded' : ''} onLoad={() => { setLoaded(true); iframe.current?.contentWindow?.postMessage({ type:'portfolio-theme', id:theme }, location.origin) }} allow="autoplay; fullscreen" />}
    </section>
  </main>
}
