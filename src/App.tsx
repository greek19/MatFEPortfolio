import { useEffect, useMemo, useState } from 'react'
import { ArrowUpRight, Check } from 'lucide-react'

type DemoVersion = {
  id: string
  branch: string
  label: string
  description: string
}

const BASE_PATH = '/MatFEPortfolio/'
const IS_LOCAL = window.location.hostname === '127.0.0.1' || window.location.hostname === 'localhost'

function readRequestedVersion() {
  return new URLSearchParams(window.location.search).get('version')
}

export default function App() {
  const [versions, setVersions] = useState<DemoVersion[]>([])
  const [selectedId, setSelectedId] = useState(readRequestedVersion)
  const [loaded, setLoaded] = useState(false)

  useEffect(() => {
    fetch(`${BASE_PATH}demo-versions.json`)
      .then((response) => {
        if (!response.ok) throw new Error('Version configuration unavailable')
        return response.json() as Promise<DemoVersion[]>
      })
      .then((items) => {
        setVersions(items)
        setSelectedId((current) => items.some((item) => item.id === current) ? current : items[items.length - 1]?.id ?? null)
      })
      .catch(() => setVersions([]))
  }, [])

  useEffect(() => {
    const syncFromHistory = () => setSelectedId(readRequestedVersion())
    window.addEventListener('popstate', syncFromHistory)
    return () => window.removeEventListener('popstate', syncFromHistory)
  }, [])

  const selected = useMemo(() => versions.find((item) => item.id === selectedId) ?? versions[versions.length - 1], [selectedId, versions])
  const versionUrl = selected ? (IS_LOCAL ? `https://greek19.github.io/MatFEPortfolio/${selected.id}/` : `${BASE_PATH}${selected.id}/`) : ''

  const selectVersion = (id: string) => {
    const url = new URL(window.location.href)
    url.searchParams.set('version', id)
    window.history.pushState({}, '', url)
    setLoaded(false)
    setSelectedId(id)
  }

  return <main className="demo-shell">
    <header className="demo-toolbar">
      <div className="demo-brand"><strong>MATTEO CATALDO</strong><span>Design archive</span></div>
      <nav aria-label="Seleziona una versione del portfolio">
        {versions.map((version) => <button key={version.id} className={version.id === selected?.id ? 'active' : ''} onClick={() => selectVersion(version.id)} aria-pressed={version.id === selected?.id}>
          <span>{version.label}</span><small>{version.description}</small>{version.id === selected?.id && <Check size={13} aria-hidden="true" />}
        </button>)}
      </nav>
      {selected && <a href={versionUrl} target="_blank" rel="noreferrer"><span>Apri a schermo intero</span><ArrowUpRight size={15} /></a>}
    </header>

    <section className="demo-stage" aria-live="polite">
      {!selected && <div className="demo-message"><strong>Nessuna versione configurata.</strong><span>Aggiungi un branch al file demo-versions.json.</span></div>}
      {selected && <>
        {!loaded && <div className="demo-loading"><span>Loading {selected.label}</span><i /></div>}
        <iframe key={selected.id} className={loaded ? 'is-loaded' : ''} src={versionUrl} title={`Portfolio Matteo Cataldo — ${selected.label}`} onLoad={() => setLoaded(true)} />
      </>}
    </section>
  </main>
}
