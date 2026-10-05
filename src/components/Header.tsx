import { ArrowIcon, FlagIcon } from './Icons'

export default function Header() {
  return <header className="site-header wrap">
    <a className="brand" href="#top" aria-label="머니마라톤 홈"><span className="brand-mark"><FlagIcon /></span><span>머니마라톤<span className="brand-english">MONEY MARATHON</span></span></a>
    <nav aria-label="주요 메뉴"><a className="nav-calculator" href="#calculator">무료 계산기</a><a href="#app" className="nav-app">앱 알아보기 <ArrowIcon /></a></nav>
  </header>
}

