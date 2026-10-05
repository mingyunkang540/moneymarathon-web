import { FlagIcon } from './Icons'

export default function Disclaimer() {
  return <footer className="site-footer wrap">
    <div className="disclaimer"><strong>계산 결과를 확인하기 전에 알아두세요.</strong><p>이 계산 결과는 사용자가 입력한 금액과 기대수익률을 기준으로 한 단순 예상입니다. 실제 투자 성과를 보장하지 않으며, 특정 금융상품이나 투자행위를 권유하지 않습니다. 세금·수수료·물가 변동은 반영하지 않습니다.</p><p>입력한 금액은 서버로 전송하거나 저장하지 않습니다. 모든 계산은 현재 브라우저에서 처리됩니다.</p></div>
    <div className="footer-bottom"><a href="#top" className="footer-brand"><FlagIcon /> 머니마라톤</a><span>나의 속도로, 나의 목표까지.</span><small>© 2026 Money Marathon</small></div>
  </footer>
}
