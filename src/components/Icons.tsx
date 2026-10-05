import type { SVGProps } from 'react'
type Props = SVGProps<SVGSVGElement>

export function FlagIcon(props: Props) {
  return <svg width="22" height="22" viewBox="0 0 24 24" fill="none" aria-hidden="true" {...props}><path d="M5 21V4m0 0c4-5 9 5 14 0v10c-5 5-10-5-14 0" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" /></svg>
}
export function ArrowIcon(props: Props) {
  return <svg width="20" height="20" viewBox="0 0 24 24" fill="none" aria-hidden="true" {...props}><path d="M5 12h14m-6-6 6 6-6 6" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" /></svg>
}
export function ShieldIcon(props: Props) {
  return <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden="true" {...props}><path d="m12 3 8 3v6c0 5-8 9-8 9s-8-4-8-9V6l8-3Z" stroke="currentColor" strokeWidth="1.6" /><path d="m8 12 3 3 5-6" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" /></svg>
}
export function ShareIcon() {
  return <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden="true"><path d="M12 15V3m-4 4 4-4 4 4M5 11v9h14v-9" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" /></svg>
}

