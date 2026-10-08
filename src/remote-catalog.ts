import { projectsFromSnapshot, type VideoSnapshot } from './data'

export function validateSnapshot(value:unknown):VideoSnapshot {
  const data=value as VideoSnapshot
  if(!data || !Array.isArray(data.videos) || !data.videos.length || data.videos.length>5000 || data.total!==data.videos.length || !Number.isFinite(Date.parse(data.fetchedAt))) throw Error('Invalid catalog')
  const ids=new Set<string>()
  for(const v of data.videos){
    if(!v || !/^\d+$/.test(v.id) || ids.has(v.id) || typeof v.title!=='string' || !v.title.trim() || typeof v.description!=='string' || !/^\d{4}-\d{2}-\d{2}$/.test(v.uploadDate) || !Number.isFinite(Date.parse(v.uploadDate)) || !Number.isFinite(v.duration) || v.duration<0) throw Error('Invalid video')
    if(new URL(v.url).origin!=='https://vimeo.com' || new URL(v.poster).protocol!=='https:') throw Error('Invalid video URL')
    ids.add(v.id)
  }
  return data
}

export async function loadRemoteCatalog(signal:AbortSignal){
  const configResponse=await fetch(`${import.meta.env.BASE_URL}catalog-config.json`,{signal})
  if(!configResponse.ok)return null
  const config=await configResponse.json()
  if(!config.endpoint)return null
  const endpoint=new URL(config.endpoint)
  if(endpoint.protocol!=='https:' && !(import.meta.env.DEV && endpoint.hostname==='localhost'))throw Error('HTTPS required')
  const response=await fetch(endpoint,{signal,credentials:'omit'})
  if(!response.ok)throw Error('Catalog unavailable')
  return projectsFromSnapshot(validateSnapshot(await response.json()))
}
