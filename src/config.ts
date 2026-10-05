// Verified listing supplied by the owner. Optional build-time override.
const configuredUrl = import.meta.env.VITE_PLAY_STORE_URL?.trim()
  || 'https://play.google.com/store/apps/details?id=com.minigyunilab.moneymarathon'

function validatePlayStoreUrl(value: string | undefined): string | null {
  if (!value) return null
  try {
    const url = new URL(value)
    return url.protocol === 'https:' && url.hostname === 'play.google.com'
      && url.pathname === '/store/apps/details' && /^[A-Za-z0-9_]+(?:\.[A-Za-z0-9_]+)+$/.test(url.searchParams.get('id') ?? '')
      && !url.username && !url.password && !url.port
      ? url.toString() : null
  } catch { return null }
}

export const PLAY_STORE_URL = validatePlayStoreUrl(configuredUrl)

export function buildPlayStoreUrl(base: string | null = PLAY_STORE_URL): string | null {
  const validated = validatePlayStoreUrl(base ?? undefined)
  if (!validated) return null
  const url = new URL(validated)
  const campaign = new URLSearchParams({
    utm_source: 'moneymarathon_web', utm_medium: 'calculator', utm_campaign: '100million',
  })
  campaign.forEach((value, key) => url.searchParams.set(key, value))
  url.searchParams.set('referrer', campaign.toString())
  return url.toString()
}
