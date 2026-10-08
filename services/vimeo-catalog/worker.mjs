const API='https://api.vimeo.com'
export function sourceKey(env){
  if(!['profile','showcase'].includes(env.SOURCE_MODE))throw Error('Invalid source mode')
  if(env.SOURCE_MODE==='showcase'&&!/^\d+$/.test(env.VIMEO_SHOWCASE_ID||''))throw Error('Missing showcase ID')
  return `catalog:${env.SOURCE_MODE}:${env.VIMEO_USER_ID||'me'}:${env.SOURCE_MODE==='showcase'?env.VIMEO_SHOWCASE_ID:'uploads'}`
}
export async function synchronize(env,request=fetch,now=Date.now()){
  const key=sourceKey(env)
  const previous=await env.CATALOG.get(key,'json')
  const hours=Number(env.SYNC_INTERVAL_HOURS||24)
  if(![24,48,168].includes(hours))throw Error('Invalid sync interval')
  if(previous && now-Date.parse(previous.fetchedAt)<hours*3600000-60000)return {skipped:true}
  if(!env.VIMEO_TOKEN)throw Error('Missing Vimeo token')
  const get=async path=>{
    const url=new URL(path,API)
    if(url.origin!==API)throw Error('Invalid pagination origin')
    const response=await request(url,{headers:{Authorization:`Bearer ${env.VIMEO_TOKEN}`,Accept:'application/vnd.vimeo.*+json;version=3.4'},signal:AbortSignal.timeout(20000)})
    if(!response.ok)throw Error(`Vimeo HTTP ${response.status}`)
    return response.json()
  }
  const user=await get(env.VIMEO_USER_ID?`/users/${encodeURIComponent(env.VIMEO_USER_ID)}`:'/me')
  if(user.link?.replace(/\/$/,'')!==env.EXPECTED_PROFILE_URL)throw Error('Vimeo account does not match configured profile')
  if(!/^\/users\/\d+$/.test(user.uri))throw Error('Invalid Vimeo user')
  const path=env.SOURCE_MODE==='showcase'?`${user.uri}/albums/${env.VIMEO_SHOWCASE_ID}/videos`:`${user.uri}/videos`
  let next=`${path}?per_page=100&sort=${env.SOURCE_MODE==='showcase'?'manual':'date'}&direction=${env.SOURCE_MODE==='showcase'?'asc':'desc'}`
  const seen=new Set(),videos=[],ids=new Set()
  let expected=null,received=0
  while(next){
    if(seen.has(next)||seen.size>=40)throw Error('Pagination limit; preserving previous catalog')
    seen.add(next)
    const page=await get(next)
    if(!Array.isArray(page.data)||!Number.isInteger(page.total)||page.total<0)throw Error('Invalid Vimeo page')
    if(expected!==null&&expected!==page.total)throw Error('Catalog changed during sync')
    expected=page.total;received+=page.data.length
    for(const video of page.data){
      // Never expose private, unlisted, password-protected or unembeddable entries.
      if(video.privacy?.view!=='anybody'||video.privacy?.embed!=='public'||video.status!=='available')continue
      const id=video.uri?.match(/^\/videos\/(\d+)$/)?.[1]
      const sizes=video.pictures?.sizes||[]
      const poster=[...sizes].sort((a,b)=>a.width-b.width).find(p=>p.width>=640)?.link||sizes.at(-1)?.link
      if(!id||ids.has(id)||!video.name||!poster||!Number.isFinite(video.duration)||!Number.isFinite(Date.parse(video.created_time)))throw Error('Invalid public video')
      if(new URL(poster).protocol!=='https:'||new URL(video.link).origin!=='https://vimeo.com')throw Error('Invalid media URL')
      ids.add(id)
      videos.push({id,title:video.name,description:video.description||'',url:video.link,uploadDate:video.created_time.slice(0,10),duration:video.duration,poster})
    }
    next=page.paging?.next||null
  }
  if(received!==expected)throw Error('Incomplete Vimeo import')
  // Empty results need explicit review, not replacement of a working portfolio.
  if(!videos.length)throw Error('No publishable videos; preserving previous catalog')
  const catalog={profile:user.link,fetchedAt:new Date(now).toISOString(),total:videos.length,scope:env.SOURCE_MODE,videos}
  await env.CATALOG.put(key,JSON.stringify(catalog))
  return {total:videos.length}
}
export default {
  async scheduled(_event,env,ctx){
    ctx.waitUntil(synchronize(env).catch(error=>{console.error('Vimeo sync failed:',error.message);throw error}))
  },
  async fetch(request,env){
    const url=new URL(request.url)
    const headers={'Content-Type':'application/json; charset=utf-8','Access-Control-Allow-Origin':'*','X-Content-Type-Options':'nosniff','X-Robots-Tag':'noindex'}
    if(request.method!=='GET'&&request.method!=='HEAD')return new Response(null,{status:405,headers:{...headers,Allow:'GET, HEAD'}})
    if(url.pathname!=='/catalog.json')return new Response('{}',{status:404,headers})
    // Reads never trigger Vimeo requests, including during cold start or outage.
    try{
      const catalog=await env.CATALOG.get(sourceKey(env))
      if(!catalog)return new Response('{"error":"Catalog not synchronized yet"}',{status:503,headers:{...headers,'Cache-Control':'no-store'}})
      return new Response(request.method==='HEAD'?null:catalog,{headers:{...headers,'Cache-Control':'public, max-age=300'}})
    }catch{return new Response('{"error":"Catalog unavailable"}',{status:503,headers:{...headers,'Cache-Control':'no-store'}})}
  },
}
