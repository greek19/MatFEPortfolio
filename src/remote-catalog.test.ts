import {describe,it,expect} from 'vitest'
import {validateSnapshot} from './remote-catalog'
import snapshot from './content/vimeo.json'
import {projectsFromSnapshot} from './data'
describe('remote catalog',()=>{
  it('accepts current content and retains verified credits',()=>{
    const result=projectsFromSnapshot(validateSnapshot(snapshot))
    expect(result.length).toBe(snapshot.videos.length)
    expect(result.find(p=>p.video.id==='1209869703')?.credits.director).toBe('Younuts!')
  })
  it('rejects incomplete, empty and unsafe responses',()=>{
    expect(()=>validateSnapshot({...snapshot,total:0})).toThrow()
    expect(()=>validateSnapshot({...snapshot,total:0,videos:[]})).toThrow()
    expect(()=>validateSnapshot({...snapshot,videos:snapshot.videos.map((v,i)=>i? v:{...v,poster:'javascript:alert(1)'})})).toThrow()
  })
})
