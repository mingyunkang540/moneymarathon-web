import { buildPlayStoreUrl } from '../config'
import { ArrowIcon, FlagIcon } from './Icons'

export default function AppCTA() {
  const url = buildPlayStoreUrl()
  return <section id="app" className="app-cta" aria-labelledby="app-title">
    <div className="app-copy"><span className="eyebrow">YOUR MONEY, YOUR PACE</span>
      <h2 id="app-title">계산에서 한 걸음 더,<br />나만의 돈의 내비게이션.</h2>
      <p>내 자산·부채·지출까지 반영해서<br />더 자세한 목표 계획을 만들고 싶다면.</p>
      <div className="app-brand"><FlagIcon /><strong>머니마라톤</strong><span>나의 속도로, 나의 목표까지</span></div>
      {url ? <a className="button app-button" href={url} target="_blank" rel="noopener noreferrer">Google Play에서 무료로 시작하기 <ArrowIcon /></a>
        : <><button className="button app-button" type="button" disabled>Google Play에서 무료로 시작하기 <ArrowIcon /></button><p className="cta-pending">앱 링크 준비 중 · 곧 Google Play에서 만나요.</p></>}
    </div>
    <div className="app-preview" aria-hidden="true"><span className="preview-heading">오늘도, 나의 속도로.</span>
      <div className="preview-item"><span className="preview-icon">01</span><div><strong>흩어진 자산을 한눈에</strong><span>나의 출발점 확인하기</span></div><span className="preview-check">✓</span></div>
      <div className="preview-item"><span className="preview-icon">02</span><div><strong>일상 속 지출 돌아보기</strong><span>내 돈의 흐름 이해하기</span></div><span className="preview-check">✓</span></div>
      <div className="preview-item"><span className="preview-icon">03</span><div><strong>목표까지 꾸준히 한 걸음</strong><span>나에게 맞는 계획 세우기</span></div><FlagIcon /></div>
      <div className="preview-route"><span /><span /><span /><FlagIcon /></div>
    </div>
  </section>
}

