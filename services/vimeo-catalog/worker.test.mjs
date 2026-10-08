import {test} from 'node:test'
import assert from 'node:assert/strict'
import worker,{synchronize,sourceKey} from './worker.mjs'
const video=id=>({uri:`/videos/${id}`,name:`Video ${id}`,description:'Editor: Matteo Cataldo',link:`https://vimeo.com/${id}`,created_time:'2026-01-01T10:00:00Z',duration:60,status:'available',privacy:{view:'anybody',embed:'public'},pictures:{sizes:[{width:640,link:'https://i.vimeocdn.com/image.jpg'}]}})
function setup(){
  const store=new Map()
  const env={SOURCE_MODE:'profile',VIMEO_TOKEN:'test-secret',EXPECTED_PROFILE_URL:'https://vimeo.com/matteocataldo',SYNC_INTERVAL_HOURS:'24',CATALOG:{get:async(k,type)=>{const v=store.get(k);return type==='json'&&v?JSON.parse(v):v||null},put:async(k,v)=>store.set(k,v)}}
  return {env,store}
}
const user={uri:'/users/123',link:'https://vimeo.com/matteocataldo'}
test('full paginated import; private videos never published',async()=>{
  const {env,store}=setup();let calls=0
  await synchronize(env,async(url,options)=>{assert.equal(options.headers.Authorization,'Bearer test-secret');calls++;return Response.json(calls===1?user:calls===2?{total:3,data:[video(1),{...video(2),privacy:{view:'nobody'}}],paging:{next:'/users/123/videos?page=2'}}:{total:3,data:[video(3)],paging:{next:null}})})
  assert.equal(calls,3);assert.deepEqual(JSON.parse(store.get(sourceKey(env))).videos.map(v=>v.id),['1','3'])
})
test('48 hour cooldown makes zero upstream requests',async()=>{
  const {env,store}=setup();env.SYNC_INTERVAL_HOURS='48'
  store.set(sourceKey(env),JSON.stringify({fetchedAt:new Date().toISOString()}))
  assert.deepEqual(await synchronize(env,()=>{throw Error('must not fetch')}),{skipped:true})
})
test('failed later page preserves previous snapshot',async()=>{
  const {env,store}=setup();const key=sourceKey(env);store.set(key,'{"fetchedAt":"2020-01-01"}');let calls=0
  await assert.rejects(synchronize(env,async()=>{calls++;return calls===1?Response.json(user):calls===2?Response.json({total:2,data:[video(1)],paging:{next:'/next'}}):new Response('',{status:429})}))
  assert.equal(store.get(key),'{"fetchedAt":"2020-01-01"}')
})
test('showcase uses separate cache and ordered endpoint',async()=>{
  const {env}=setup();env.SOURCE_MODE='showcase';env.VIMEO_SHOWCASE_ID='42';const urls=[]
  await synchronize(env,async url=>{urls.push(String(url));return Response.json(urls.length===1?user:{total:1,data:[video(1)],paging:{next:null}})})
  assert.match(urls[1],/albums\/42\/videos\?per_page=100&sort=manual/)
})
test('foreign pagination and wrong account are rejected',async()=>{
  const {env}=setup();let calls=0
  await assert.rejects(synchronize(env,async()=>Response.json(++calls===1?user:{total:2,data:[video(1)],paging:{next:'https://evil.example/token'}})),/pagination origin/)
  assert.equal(calls,2)
  await assert.rejects(synchronize(env,async()=>Response.json({...user,link:'https://vimeo.com/other'})),/does not match/)
})
test('empty and partial results never overwrite a catalog',async()=>{
  for(const page of [{total:0,data:[]},{total:2,data:[video(1)]}]){
    const {env,store}=setup();let calls=0
    await assert.rejects(synchronize(env,async()=>Response.json(++calls===1?user:page)))
    assert.equal(store.size,0)
  }
})
test('public endpoint serves saved JSON only and has no sync route',async()=>{
  const {env,store}=setup()
  assert.equal((await worker.fetch(new Request('https://test/catalog.json'),env)).status,503)
  store.set(sourceKey(env),'{"total":1}')
  const r=await worker.fetch(new Request('https://test/catalog.json'),env)
  assert.equal(r.status,200);assert.equal(await r.text(),'{"total":1}');assert.equal(r.headers.get('Access-Control-Allow-Origin'),'*')
  assert.equal((await worker.fetch(new Request('https://test/sync'),env)).status,404)
  assert.equal((await worker.fetch(new Request('https://test/catalog.json',{method:'POST'}),env)).status,405)
})
