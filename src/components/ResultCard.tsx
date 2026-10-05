import { forwardRef } from 'react'
import type { GoalCalculationInput, GoalCalculationResult } from '../domain/goalCalculator'
import { arrivalMonth, formatAmount, formatDuration } from '../domain/format'
import { FlagIcon } from './Icons'

interface Props { input: GoalCalculationInput; result: GoalCalculationResult }

const ResultCard = forwardRef<HTMLHeadingElement, Props>(function ResultCard({ input, result }, ref) {
  const achieved = result.status === 'achieved'
  return <article className="result-card">
    <span className="eyebrow">YOUR FINISH LINE</span>
    <div className="result-flag"><FlagIcon width="28" height="28" /></div>
    <p className="result-intro">현재 조건이라면</p>
    <h2 ref={ref} tabIndex={-1} id="result-title" className="result-heading">
      {achieved ? result.months === 0 ? '이미 목표를 달성했어요!' : <><span>{formatDuration(result.months)} 후</span><br />목표에 도달할 수 있어요.</>
        : '현재 조건에서는 계산 가능한 기간 안에 목표에 도달하기 어려워요.'}
    </h2>
    {achieved ? <p className="arrival">예상 시점 <strong>{arrivalMonth(result.months)}</strong>{result.months === 0 && ' · 지금부터 다음 목표를 준비해보세요.'}</p>
      : <p className="arrival">최대 100년까지 계산했어요. 월 저축액이나 목표 금액을 조정해보세요.</p>}
    <dl className="result-facts">
      <div><dt>현재 모은 돈</dt><dd>{formatAmount(input.currentAmount)}</dd></div>
      <div><dt>월 저축·투자</dt><dd>{formatAmount(input.monthlyContribution)}</dd></div>
      <div><dt>목표 금액</dt><dd>{formatAmount(input.targetAmount)}</dd></div>
      <div><dt>기대 연수익률</dt><dd>{input.annualRate}%</dd></div>
    </dl>
    <p className="result-note">매달 기존 자산에 수익을 반영한 뒤, 월말에 저축·투자금을 더하는 기준이에요.</p>
  </article>
})
export default ResultCard

