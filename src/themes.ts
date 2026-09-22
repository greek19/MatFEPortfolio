export const themes = {
  original: { name: 'Originale', paper: '#e9e7e1', ink: '#151514', accent: '#d7ff32', flare: '#b63216' },
  orange: { name: 'Cosmic Orange', paper: '#f3e9dc', ink: '#291d18', accent: '#ff894f', flare: '#b03c0c' },
  teal: { name: 'Transformative Teal', paper: '#e5efea', ink: '#123b3a', accent: '#80d7c7', flare: '#12685e' },
  cloud: { name: 'Cloud Dancer', paper: '#f5f3ed', ink: '#34332e', accent: '#ded9cc', flare: '#655a48' },
  blue: { name: 'Electric Blue', paper: '#e9edf7', ink: '#172554', accent: '#aac4ff', flare: '#234dde' },
  plum: { name: 'Plum / Butter', paper: '#f5edda', ink: '#432639', accent: '#e8d79b', flare: '#8a365f' },
  dark: { name: 'Dark Room', paper: '#0d0d0b', ink: '#f4f0e6', accent: '#465c12', flare: '#ff5a36' },
} as const
export type ThemeId = keyof typeof themes
export const isTheme = (value: unknown): value is ThemeId => typeof value === 'string' && Object.prototype.hasOwnProperty.call(themes, value)
const storageKey = 'matteo-portfolio-theme'
export function readTheme(): ThemeId {
  const requested = new URLSearchParams(location.search).get('theme')
  if (isTheme(requested)) return requested
  try { const saved = localStorage.getItem(storageKey); if (isTheme(saved)) return saved } catch { /* Private browsing may block storage. */ }
  return 'original'
}
export function applyTheme(id: ThemeId) {
  const root = document.documentElement
  const theme = themes[id]
  if (id === 'original') {
    delete root.dataset.theme
    for (const key of ['paper', 'ink', 'acid', 'flare', 'soft', 'line']) root.style.removeProperty(`--${key}`)
  } else {
    root.dataset.theme = id
    for (const [key, value] of Object.entries({ paper: theme.paper, ink: theme.ink, acid: theme.accent, flare: theme.flare, soft: theme.accent, line: `${theme.ink}40` })) root.style.setProperty(`--${key}`, value)
  }
  try { localStorage.setItem(storageKey, id) } catch { /* Theme still works without persistence. */ }
}
export function installTheme() {
  applyTheme(readTheme())
  window.addEventListener('message', (event: MessageEvent) => {
    if (event.origin !== location.origin || event.source !== window.parent || event.data?.type !== 'portfolio-theme' || !isTheme(event.data.id)) return
    applyTheme(event.data.id)
  })
}
