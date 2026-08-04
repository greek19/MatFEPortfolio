export type Lang = 'it' | 'en'
export type Category = 'music' | 'social' | 'film' | 'production'
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
  video: { provider: 'vimeo' | 'youtube'; id: string }
}
