import { describe, expect, it } from 'vitest'
import { isTheme, themes } from './themes'
const luminance = (hex: string) => {
  const channels = hex.slice(1).match(/../g)!.map(v => parseInt(v,16)/255).map(v => v <= .04045 ? v/12.92 : ((v+.055)/1.055)**2.4)
  return channels[0]*.2126 + channels[1]*.7152 + channels[2]*.0722
}
const contrast = (a:string,b:string) => (Math.max(luminance(a),luminance(b))+.05)/(Math.min(luminance(a),luminance(b))+.05)
describe('shared themes', () => {
  it('rejects unknown and prototype keys', () => { expect(isTheme('constructor')).toBe(false); expect(isTheme('nope')).toBe(false); expect(isTheme(null)).toBe(false) })
  for (const [id, theme] of Object.entries(themes)) it(`${id} has readable foreground colours`, () => { expect(contrast(theme.ink,theme.paper)).toBeGreaterThanOrEqual(7); expect(contrast(theme.ink,theme.accent)).toBeGreaterThanOrEqual(4.5); expect(contrast(theme.flare,theme.paper)).toBeGreaterThanOrEqual(4.5) })
})
