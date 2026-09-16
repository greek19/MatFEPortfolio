export type Lang = 'it' | 'en'
export type Category = 'music' | 'social' | 'film' | 'production' | 'backstage' | 'personal'
export type Localized = Record<Lang, string>

export interface Project {
  slug: string
  number: string
  title: string
  client: string
  year: string
  category: Category
  roles: string[]
  duration: string
  featured: boolean
  poster: string
  description: Localized
  statement: Localized
  credits: { editor: string | null; director: string | null }
  originalTitle: string
  originalDescription: string
  uploadedAt: string
  durationSeconds: number
  variant: string
  sourceUrl: string
  video: { provider: 'vimeo' | 'youtube'; id: string }
}
