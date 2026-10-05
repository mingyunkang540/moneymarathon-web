import { describe, expect, it } from 'vitest'
import { buildPlayStoreUrl } from './config'

describe('Play Store destination', () => {
  it('uses the owner-provided listing by default', () => {
    const url = new URL(buildPlayStoreUrl()!)
    expect(url.searchParams.get('id')).toBe('com.minigyunilab.moneymarathon')
  })
  it('has no invented URL and rejects invalid destinations', () => {
    for (const url of [null, '', 'TODO', 'https://example.com', 'javascript:alert(1)', 'https://play.google.com.evil.test/store/apps/details?id=example.test', 'https://play.google.com/store/apps/details']) expect(buildPlayStoreUrl(url)).toBeNull()
  })
  it('preserves the configured listing and includes conventional and install-referrer UTM', () => {
    const url = new URL(buildPlayStoreUrl('https://play.google.com/store/apps/details?id=example.test')!)
    expect(url.searchParams.get('id')).toBe('example.test')
    expect(url.searchParams.get('utm_source')).toBe('moneymarathon_web')
    expect(url.searchParams.get('utm_medium')).toBe('calculator')
    expect(new URLSearchParams(url.searchParams.get('referrer')!).get('utm_campaign')).toBe('100million')
  })
})
