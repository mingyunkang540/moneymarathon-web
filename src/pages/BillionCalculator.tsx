import { useRef, useState } from 'react'
import type { FormEvent } from 'react'
import Header from '../components/Header'
import MoneyInput from '../components/MoneyInput'
import ResultCard from '../components/ResultCard'
import ComparisonCard from '../components/ComparisonCard'
import AppCTA from '../components/AppCTA'
import Disclaimer from '../components/Disclaimer'
import { ArrowIcon, FlagIcon, ShareIcon, ShieldIcon } from '../components/Icons'
import { calculateGoalDuration, MAX_AMOUNT_KRW, MAX_ANNUAL_RATE_PERCENT } from '../domain/goalCalculator'
import type { GoalCalculationInput, GoalCalculationResult } from '../domain/goalCalculator'
import { formatAmount, formatDuration, parseInput } from '../domain/format'

type Fields = 'current' | 'monthly' | 'target' | 'rate'
type Snapshot = { input: GoalCalculationInput; result: GoalCalculationResult; comparison: GoalCalculationResult }
const faq = [
  ['기대수익률은 얼마로 넣어야 하나요?', '미래 수익률은 확정할 수 없어요. 본인이 가정하고 싶은 연수익률을 입력하고, 여러 조건을 비교해보세요. 기본값 5%는 계산 예시이며 추천 수익률이 아닙니다.'],
  ['투자를 하지 않으면 어떻게 계산하나요?', '기대 연수익률을 0%로 입력하세요. 현재 모은 돈에 매달 저축하는 금액만 더해서 목표까지 걸리는 기간을 계산합니다.'],
  ['월 저축액을 늘리면 얼마나 빨라지나요?', '현재 자산과 목표, 수익률에 따라 달라져요. 계산 결과 아래에서 월 20만원을 더 모으는 경우를 자동으로 비교할 수 있어요. 같은 달에 도달하면 단축되는 개월은 0입니다.'],
  ['계산 결과와 실제 결과가 다른 이유는 무엇인가요?', '이 계산은 매달 같은 금액을 모으고 수익률이 일정하다고 가정해요. 실제로는 시장 변동, 납입 시점, 세금, 수수료, 물가, 저축액의 변화에 따라 결과가 달라질 수 있습니다.'],
]

function RouteIllustration() {
  return <div className="hero-route" aria-hidden="true">
    <svg viewBox="0 0 420 125" fill="none"><path d="M20 96C84 96 77 30 151 48S255 122 315 67 374 21 397 25" stroke="#d5e3d9" strokeWidth="17" strokeLinecap="round" /><path d="M20 96C84 96 77 30 151 48S255 122 315 67 374 21 397 25" stroke="#7caa99" strokeWidth="1.5" strokeDasharray="4 6" /><circle cx="20" cy="96" r="7" fill="#236c5e" /><circle cx="397" cy="25" r="8" fill="#236c5e" /><path d="M397 25V1l17 5-17 7" fill="#236c5e" stroke="#236c5e" strokeWidth="2" /></svg>
    <span className="route-start">지금의 나</span><span className="route-end">목표에 도착한 나</span>
  </div>
}

export default function BillionCalculator() {
  const [values, setValues] = useState<Record<Fields, string>>({ current: '3,000', monthly: '150', target: '10,000', rate: '5' })
  const [errors, setErrors] = useState<Partial<Record<Fields, string>>>({})
  const [snapshot, setSnapshot] = useState<Snapshot | null>(null)
  const [shareMessage, setShareMessage] = useState('')
  const [copyUrl, setCopyUrl] = useState('')
  const headingRef = useRef<HTMLHeadingElement>(null)

  const change = (field: Fields, value: string) => {
    setValues((previous) => ({ ...previous, [field]: value }))
    setErrors((previous) => ({ ...previous, [field]: undefined }))
  }

  function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    const parsed = Object.fromEntries(Object.entries(values).map(([key, value]) => [key, parseInput(value)])) as Record<Fields, number>
    const nextErrors: Partial<Record<Fields, string>> = {}
    for (const key of ['current', 'monthly', 'target'] as const) {
      if (!Number.isFinite(parsed[key]) || parsed[key] < 0 || !Number.isInteger(parsed[key])) nextErrors[key] = '0 이상의 정수를 만원 단위로 입력해주세요.'
      else if (parsed[key] * 10_000 > MAX_AMOUNT_KRW) nextErrors[key] = '1억 만원(1조원) 이하로 입력해주세요.'
    }
    if (parsed.target === 0) nextErrors.target = '목표 금액은 0보다 커야 해요.'
    if (!Number.isFinite(parsed.rate) || parsed.rate < 0 || parsed.rate > MAX_ANNUAL_RATE_PERCENT) nextErrors.rate = '0~100 사이의 연수익률을 입력해주세요.'
    setErrors(nextErrors)
    if (Object.keys(nextErrors).length) {
      document.getElementById(Object.keys(nextErrors)[0])?.focus()
      return
    }
    const input = { currentAmount: parsed.current * 10_000, monthlyContribution: parsed.monthly * 10_000, targetAmount: parsed.target * 10_000, annualRate: parsed.rate }
    const result = calculateGoalDuration(input)
    if (result.status === 'invalid') return
    const comparison = calculateGoalDuration({ ...input, monthlyContribution: input.monthlyContribution + 200_000 })
    setSnapshot({ input, result, comparison })
    setShareMessage('')
    setCopyUrl('')
    requestAnimationFrame(() => {
      headingRef.current?.focus({ preventScroll: true })
      document.getElementById('result')?.scrollIntoView({ behavior: matchMedia('(prefers-reduced-motion: reduce)').matches ? 'instant' : 'smooth', block: 'start' })
    })
  }

  async function share() {
    if (!snapshot) return
    // A clean public URL, never financial input, even when the visitor arrived with a query/hash.
    const url = `${window.location.origin}/`
    setCopyUrl('')
    const { input, result } = snapshot
    if (navigator.share) {
      const outcome = result.status === 'achieved' ? result.months === 0 ? '이미 목표 달성 🏁' : `${formatAmount(input.targetAmount)}까지 약 ${formatDuration(result.months)} 🏁` : `${formatAmount(input.targetAmount)}까지 걸리는 기간을 계산해봤어요.`
      const text = `현재 ${formatAmount(input.currentAmount)}, 월 ${formatAmount(input.monthlyContribution)}씩 모으면\n${outcome}\n\n나도 계산해보기`
      try {
        await navigator.share({ title: '1억 모으기 계산기 | 머니마라톤', text, url })
        setShareMessage('공유했어요.')
        return
      } catch (error) {
        if (error instanceof Error && error.name === 'AbortError') { setShareMessage('공유를 취소했어요.'); return }
      }
    }
    try {
      await navigator.clipboard.writeText(url)
      setShareMessage('계산기 링크를 복사했어요. 입력 금액은 포함되지 않아요.')
    } catch {
      setCopyUrl(url)
      setShareMessage('아래 계산기 링크를 선택해 복사해주세요.')
    }
  }

  return <div id="top">
    <a className="skip-link" href="#calculator">계산기로 바로 가기</a>
    <Header />
    <main className="wrap">
      <section className="hero" aria-labelledby="hero-title">
        <div className="hero-copy"><span className="hero-eyebrow"><span /> 나의 목표를 위한 첫 걸음</span>
          <h1 id="hero-title">1억 모으려면<br /><em>얼마나</em> 걸릴까요?</h1>
          <p className="hero-description">현재 모은 돈과 매달 저축·투자할 금액을 입력하면<br className="desktop-break" /> 목표까지 걸리는 시간을 바로 계산해드려요.</p>
          <div className="hero-tags"><span>회원가입 없이</span><span>무료로 바로 계산</span></div>
          <RouteIllustration />
          <p className="hero-caption">멀게 느껴지는 목표도, 시작은 작은 한 걸음.</p>
        </div>
        <section id="calculator" className="calculator-card" aria-labelledby="calculator-title">
          <div className="calculator-top"><span className="pill">1억 모으기 계산기</span><span className="calculator-step">01 / START</span></div>
          <h2 id="calculator-title">나의 출발점을 알려주세요.</h2><p className="calculator-description">금액은 <strong>만원 단위</strong>로 입력해주세요.</p>
          <form onSubmit={submit} noValidate>
            <div className="input-grid">
              <MoneyInput id="current" label="현재 모은 돈" value={values.current} onChange={(v) => change('current', v)} unit="만원" hint="지금까지 모은 저축·투자금" error={errors.current} />
              <MoneyInput id="monthly" label="매달 저축·투자" value={values.monthly} onChange={(v) => change('monthly', v)} unit="만원" hint="매달 꾸준히 모을 금액" error={errors.monthly} />
              <MoneyInput id="target" label="목표 금액" value={values.target} onChange={(v) => change('target', v)} unit="만원" hint="10,000만원 = 1억원 · 수정 가능" error={errors.target} />
              <MoneyInput id="rate" label="기대 연수익률" value={values.rate} onChange={(v) => change('rate', v)} unit="%" hint="투자를 반영하지 않으려면 0%" error={errors.rate} decimal />
            </div>
            <button className="button calculate-button" type="submit">목표까지 얼마나 걸릴까? <ArrowIcon /></button>
            <p className="form-note">연수익률은 가정값이며, 실제 수익을 보장하지 않아요.</p>
          </form>
          <p className="privacy-note"><ShieldIcon /><span>입력한 금액은 서버로 전송하거나 저장하지 않습니다.<br />모든 계산은 현재 브라우저에서 처리됩니다.</span></p>
        </section>
      </section>
      {snapshot && <section id="result" className="results" aria-labelledby="result-title">
        <ResultCard ref={headingRef} input={snapshot.input} result={snapshot.result} />
        <ComparisonCard {...snapshot} />
        <div className="share-area"><button className="button share-button" type="button" onClick={share}><ShareIcon /> 결과 공유하기</button><p>공유할 때만 입력 금액이 공유 문구에 포함돼요.<br />링크에는 금융정보가 포함되지 않아요.</p></div>
        <p role="status" className="share-status">{shareMessage}</p>
        {copyUrl && <div className="copy-fallback"><label htmlFor="share-url">복사할 계산기 링크</label><input id="share-url" value={copyUrl} readOnly onFocus={(event) => event.target.select()} /></div>}
      </section>}
      <div className="benefit-strip"><div><ShieldIcon /><span>나의 금융정보는 <strong>내 브라우저에만</strong></span></div><div><span className="benefit-symbol">↗</span><span>막연한 목표를 <strong>구체적인 시간으로</strong></span></div><div><FlagIcon /><span>나의 속도로 <strong>목표까지 한 걸음</strong></span></div></div>
      <AppCTA />
      <section className="explanation" aria-labelledby="explanation-title">
        <div className="section-heading"><span className="eyebrow">A LITTLE MONEY KNOWLEDGE</span><h2 id="explanation-title">1억원을 모으는 기간은<br />무엇에 따라 달라질까요?</h2><p>같은 목표라도 출발점과 매달의 한 걸음에 따라 도착하는 시간은 달라져요.</p></div>
        <div className="factor-grid"><article><span className="factor-number">01</span><h3>지금의 출발점</h3><p>현재 가진 자산이 많을수록 목표까지 남은 거리는 짧아져요. 지금 모은 돈부터 확인해보세요.</p></article><article><span className="factor-number">02</span><h3>매달의 꾸준함</h3><p>매달 저축·투자하는 금액이 목표에 가까워지는 속도를 결정해요. 작은 증액도 차이를 만들 수 있어요.</p></article><article><span className="factor-number">03</span><h3>시간과 수익률</h3><p>수익이 쌓이면 다음 달에는 그 수익에도 수익이 붙어요. 다만 기대수익률은 가정이고 실제 결과는 달라요.</p></article></div>
      </section>
      <section className="faq" aria-labelledby="faq-title"><div className="section-heading"><span className="eyebrow">GOOD QUESTIONS</span><h2 id="faq-title">궁금한 점이 있나요?</h2></div><div className="faq-items">{faq.map(([question, answer]) => <details key={question}><summary><span><span className="faq-q">Q.</span>{question}</span><span className="faq-plus" aria-hidden="true">+</span></summary><p>{answer}</p></details>)}</div></section>
      <div className="closing-note"><FlagIcon /><p>중요한 건 빠른 속도보다,<br /><strong>나에게 맞는 방향으로 꾸준히 가는 것.</strong></p></div>
    </main>
    <Disclaimer />
  </div>
}

