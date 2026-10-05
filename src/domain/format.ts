export function formatAmount(won: number): string {
  const eok = Math.floor(won / 100_000_000)
  const man = Math.round((won % 100_000_000) / 10_000)
  if (eok && !man) return `${eok.toLocaleString('ko-KR')}억원`
  if (eok) return `${eok.toLocaleString('ko-KR')}억 ${man.toLocaleString('ko-KR')}만원`
  return `${Math.round(won / 10_000).toLocaleString('ko-KR')}만원`
}

export function formatDuration(months: number): string {
  if (months === 0) return '이미 목표 달성'
  const years = Math.floor(months / 12)
  const remainder = months % 12
  return [years ? `${years}년` : '', remainder ? `${remainder}개월` : ''].filter(Boolean).join(' ')
}

export function arrivalMonth(months: number, now = new Date()): string {
  const date = new Date(now.getFullYear(), now.getMonth() + months, 1)
  return `${date.getFullYear()}년 ${date.getMonth() + 1}월`
}

export function parseInput(value: string): number {
  // Reject invalid notation rather than silently converting negatives or exponents.
  const clean = value.trim()
  if (!/^(?:\d+|\d{1,3}(?:,\d{3})+)(?:\.\d+)?$/.test(clean)) return Number.NaN
  return Number(clean.replaceAll(',', ''))
}

