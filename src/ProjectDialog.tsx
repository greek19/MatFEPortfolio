import { useEffect, useRef, useState } from 'react'
import Player from '@vimeo/player'
import { ArrowLeft, ArrowUpRight, Maximize, Pause, Play, Volume2, VolumeX } from 'lucide-react'
import { categoryLabels, copy } from './data'
import type { Lang, Project } from './types'
const timeLabel = (s: number) => `${Math.floor(s / 60)}:${String(Math.floor(s % 60)).padStart(2, '0')}`

function Video({ project, lang }: { project: Project; lang: Lang }) {
  const shell = useRef<HTMLDivElement>(null)
  const iframe = useRef<HTMLIFrameElement>(null)
  const player = useRef<Player | null>(null)
  const timer = useRef<ReturnType<typeof setTimeout>>()
  const [ready, setReady] = useState(false)
  const [playing, setPlaying] = useState(false)
  const [muted, setMuted] = useState(true)
  const [visible, setVisible] = useState(false)
  const [error, setError] = useState(false)
  const [time, setTime] = useState({ seconds:0, duration:0 })
  useEffect(() => {
    const observer = new IntersectionObserver(([entry]) => { if (entry.intersectionRatio >= .999) setReady(true) }, { threshold: [1] })
    if (shell.current) observer.observe(shell.current)
    return () => observer.disconnect()
  }, [])
  useEffect(() => {
    if (!ready || !iframe.current || project.video.provider !== 'vimeo') return
    const instance = new Player(iframe.current); player.current = instance
    instance.on('play', () => setPlaying(true)); instance.on('pause', () => setPlaying(false))
    instance.on('timeupdate', (event: { seconds:number; duration:number }) => setTime(event))
    instance.on('error', () => setError(true))
    instance.ready().then(() => instance.play()).catch(() => setVisible(true))
    return () => { instance.destroy().catch(() => undefined); player.current = null }
  }, [ready, project.video.id, project.video.provider])
  useEffect(() => () => clearTimeout(timer.current), [])
  const reveal = () => { setVisible(true); clearTimeout(timer.current); timer.current = setTimeout(() => setVisible(false), 1700) }
  const toggle = () => { const action = playing ? player.current?.pause() : player.current?.play(); action?.catch(() => setError(true)) }
  return <div className={`video-shell${visible || !playing ? ' show-controls' : ''}`} ref={shell} onPointerMove={reveal} onPointerDown={reveal}>
    <img className="video-bg" src={project.poster} alt="" aria-hidden="true" />
    {!ready ? <button className="video-start" onClick={() => setReady(true)}><Play /> Play</button> : project.video.provider === 'youtube' ? <iframe src={`https://www.youtube-nocookie.com/embed/${project.video.id}?autoplay=1&mute=1&playsinline=1`} title={project.title} allow="autoplay; fullscreen" allowFullScreen /> : <>
      <iframe ref={iframe} src={`https://player.vimeo.com/video/${project.video.id}?autoplay=1&muted=1&controls=0&playsinline=1&dnt=1`} title={project.title} allow="autoplay; fullscreen; picture-in-picture" allowFullScreen />
      <button className="video-surface" onClick={toggle} aria-label={playing ? (lang === 'it' ? 'Pausa video' : 'Pause video') : 'Play video'} />
      <div className="video-controls"><button onClick={toggle} aria-label={playing ? 'Pause' : 'Play'}>{playing ? <Pause size={18} /> : <Play size={18} />}</button><span>{timeLabel(time.seconds)}</span><input type="range" aria-label={lang === 'it' ? 'Minutaggio' : 'Video position'} min={0} max={time.duration || 1} step={.1} value={time.seconds} onChange={e => player.current?.setCurrentTime(Number(e.target.value)).catch(() => setError(true))} /><span>{timeLabel(time.duration)}</span><button onClick={() => player.current?.setMuted(!muted).then(() => setMuted(!muted)).catch(() => setError(true))} aria-label={muted ? (lang === 'it' ? 'Attiva audio' : 'Unmute') : (lang === 'it' ? 'Disattiva audio' : 'Mute')}>{muted ? <VolumeX size={18} /> : <Volume2 size={18} />}</button><button aria-label="Fullscreen" onClick={() => shell.current?.requestFullscreen().catch(() => undefined)}><Maximize size={16} /></button></div>
    </>}
    {error && <p className="video-error" role="status">{lang === 'it' ? 'Player non disponibile: usa il link esterno.' : 'Player unavailable: use the external link.'}</p>}
  </div>
}
export default function ProjectDialog({ project, lang, close }: { project: Project; lang: Lang; close: () => void }) {
  const dialog = useRef<HTMLDialogElement>(null)
  const t = copy[lang]
  useEffect(() => { const node = dialog.current; node?.showModal(); return () => node?.close() }, [])
  return <dialog ref={dialog} className="project-dialog" aria-labelledby="project-title" onCancel={event=>{event.preventDefault();close()}}>
    <div className="dialog-top"><button onClick={close} autoFocus><ArrowLeft size={17} /> {t.close}</button><a href={project.sourceUrl} target="_blank" rel="noreferrer">Vimeo <ArrowUpRight size={14}/></a></div>
    <div className="dialog-layout">
      <Video project={project} lang={lang}/>
      <aside>
        <h2 id="project-title">{project.title}</h2>
        <dl className="credits">
          {project.client&&<div><dt>{project.category==='music'||project.category==='backstage'?t.artist:t.client}</dt><dd>{project.client}</dd></div>}
          <div><dt>{t.editor}</dt><dd>{project.credits.editor??<span title={t.unknown} aria-label={t.unknown}>—</span>}</dd></div>
          <div><dt>{t.director}</dt><dd>{project.credits.director??<span title={t.unknown} aria-label={t.unknown}>—</span>}</dd></div>
        </dl>
        <details className="extra-details"><summary>{t.more}</summary><dl><div><dt>{t.runtime}</dt><dd>{project.duration}</dd></div><div><dt>{t.filters}</dt><dd>{categoryLabels[project.category][lang]}{project.variant&&` / ${project.variant}`}</dd></div><div><dt>{t.uploaded}</dt><dd><time dateTime={project.uploadedAt}>{new Intl.DateTimeFormat(lang==='it'?'it-IT':'en-GB').format(new Date(`${project.uploadedAt}T12:00:00`))}</time></dd></div>{project.roles.length>0&&<div><dt>{t.role}</dt><dd>{project.roles.join(' · ')}</dd></div>}</dl>{project.originalDescription&&<><h3>{t.original}</h3><p className="source-notes">{project.originalDescription}</p></>}</details>
      </aside>
    </div>
  </dialog>
}
