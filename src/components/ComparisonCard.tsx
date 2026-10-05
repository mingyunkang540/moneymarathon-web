import type { GoalCalculationInput, GoalCalculationResult } from '../domain/goalCalculator'
import { formatAmount, formatDuration } from '../domain/format'
import { ArrowIcon } from './Icons'

interface Props { input: GoalCalculationInput; result: GoalCalculationResult; comparison: GoalCalculationResult }

export default function ComparisonCard({ input, result, comparison }: Props) {
  let summary = '두 조건 모두 계산 가능한 기간 안에 도달하기 어려워요.'
  if (comparison.status === 'invalid') summary = '추가 납입액이 계산 한도를 넘어 비교할 수 없어요.'
  else if (result.status === 'achieved' && comparison.status === 'achieved') {
    const saved = result.months - comparison.months
    summary = saved > 0 ? `${saved.toLocaleString('ko-KR')}개월 빨라져요` : result.months === 0 ? '이미 목표에 도착했어요' : '도달 개월은 같지만, 더 여유롭게 도착해요'
  } else if (comparison.status === 'achieved') summary = '월 20만원을 더하면 목표에 도달할 수 있어요'
  return <article className="comparison-card">
    <div><span className="pill">작은 변화, 다른 도착점</span><h3>매달 20만원을 더 모으면?</h3><p className="comparison-summary">{summary}</p></div>
    <div className="comparison-options">
      <div><span>현재 · 월 {formatAmount(input.monthlyContribution)}</span><strong>{result.status === 'achieved' ? formatDuration(result.months) : '도달 어려움'}</strong></div>
      <ArrowIcon />
      <div className="comparison-improved"><span>월 +20만원</span><strong>{comparison.status === 'achieved' ? formatDuration(comparison.months) : comparison.status === 'invalid' ? '한도 초과' : '도달 어려움'}</strong></div>
    </div>
  </article>
}

