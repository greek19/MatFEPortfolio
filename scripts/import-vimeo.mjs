import { mkdirSync, writeFileSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import { dirname, resolve } from 'node:path'
const root = resolve(dirname(fileURLToPath(import.meta.url)), '..')
const profile = 'matteocataldo'
async function get(path) {
  const response = await fetch(`https://vimeo.com/api/v2/${profile}/${path}`, { signal: AbortSignal.timeout(30000) })
  if (!response.ok) throw Error(`Vimeo ${response.status}: ${path}`)
  return response.json()
}
const info = await get('info.json')
const videos = []
// Vimeo's public legacy endpoint exposes up to three pages of twenty uploads.
if (info.total_videos_uploaded > 60) throw Error('More than 60 uploads: use the official authenticated Vimeo API, do not silently truncate.')
for (let page = 1; page <= Math.ceil(info.total_videos_uploaded / 20); page++) {
  const items = await get(`videos.json?page=${page}`)
  if (!Array.isArray(items)) throw Error('Unexpected Vimeo response')
  videos.push(...items)
}
const unique = [...new Map(videos.map(video => [video.id, video])).values()]
if (unique.length !== info.total_videos_uploaded) throw Error(`Incomplete import: ${unique.length}/${info.total_videos_uploaded}`)
const snapshot = {
  profile: info.profile_url,
  fetchedAt: new Date().toISOString(),
  total: info.total_videos_uploaded,
  scope: 'Public uploads only; liked videos and appearances on other accounts are not imported.',
  videos: unique.map(({ id, title, description, url, upload_date, duration, thumbnail_large }) => ({ id: String(id), title, description, url, uploadDate: upload_date.slice(0,10), duration, poster: thumbnail_large })),
}
mkdirSync(resolve(root, 'src/content'), { recursive:true })
writeFileSync(resolve(root, 'src/content/vimeo.json'), JSON.stringify(snapshot,null,2)+'\n')
console.log(`Imported ${unique.length}/${info.total_videos_uploaded} public videos from ${info.profile_url}`)
