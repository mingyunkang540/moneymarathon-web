# 검증 기록

검증일: **2026-10-05 (Asia/Seoul)**. Node 22.17.1, production static build, 로컬 Chromium 환경입니다.

## 기능과 계산

- `npm run build`: TypeScript 검사, Vite production 번들, 정적 프리렌더 통과.
- `npm test`: 3개 파일, **26개 테스트 통과**. 기본 수익률 0%는 47개월, 5%는 40개월, +20만원은 36개월로 4개월 단축.
- 계산 기준: 유효 월 수익률 → 기존 잔액 수익 → 월말 기여금 → 최초 목표 도달 확인. 0개월 달성, 1200개월 한도, 도달 불가, 음수·NaN·Infinity·상한 검증 포함.
- `npm run typecheck`, `npm run lint`: 통과.
- `npm audit --omit=dev`: 취약점 0건. 전체 npm install 감사도 0건.

## 브라우저

- 계산기 Playwright: **61개 통과**, 14개 의도적 중복 실행 제외. 각 너비 검사는 desktop 프로젝트에서만 한 번 실행하므로 mobile 두 프로젝트의 동일 검사를 skip합니다.
- 보안 헤더·접근성 Playwright: **3개 통과** (360×800, 390×844, 1440×900).
- 총 실행 성공: **64개**, 실패 0개.
- 테스트 대상: 처음에는 결과 없음, 정상 계산, 수익률 0, 이미 달성, 도달 불가, 오류 입력과 포커스, Enter 제출, 결과 스냅샷, FAQ, Web Share 성공/취소, 클립보드 대체/미지원, 앱 CTA. 실제 앱 주소 연결 후 CTA 테스트를 갱신하고 3개 기기 프로젝트에서 실제 package ID와 UTM, 금융정보 미포함을 재검증했습니다.
- 320 / 360 / 390 / 430 / 768 / 1024 / 1440px에서 초기·결과 화면 가로 넘침 없음.
- production hydration 및 Content-Security-Policy 적용 상태에서 console/page 오류 0건.
- axe-core WCAG 2 A/AA, 2.1 AA, 2.2 AA 검사: 초기와 결과 모두 자동 감지 위반 0건. 자동 검사가 모든 접근성 문제를 보증하지는 않습니다.

## 개인정보

- 계산 중 fetch, sendBeacon, localStorage, sessionStorage 호출 없음 확인.
- 실제 앱 소스에 서버 요청, 저장소 기록, Analytics SDK, service worker 없음 확인.
- 공유 URL에서 query/hash 제거 확인. Web Share 공유 텍스트는 사용자의 명시적 클릭 후에만 생성됩니다.
- 브라우저/운영체제의 실제 공유 상대 선택은 자동화로 대신하지 않고 API 호출 데이터를 검증했습니다.

## SEO와 성능

- 초기 정적 HTML에 H1, 설명, FAQ 답변과 입력 기본값 포함 확인. 서버 번들은 dist에 포함되지 않습니다.
- robots, sitemap, canonical, Open Graph, Twitter card, WebApplication JSON-LD 제공.
- OG: 1200×630 PNG, 27,052 bytes.
- 로컬 production preview / Lighthouse 13.5 Mobile: **Performance 100, Accessibility 100, Best Practices 100, SEO 100**.
- 보고서는 로컬 `artifacts/lighthouse.report.html`과 `.json`에 있습니다. `artifacts/`는 생성물이라 Git에서 제외됩니다. Lighthouse CLI는 프로젝트 runtime 의존성으로 설치하지 않았습니다.
- screenshots: `artifacts/desktop.png`, `artifacts/mobile.png`, `artifacts/mobile-result.png`. 화면을 직접 확인했습니다.

## 공개 배포와 남은 확인

1. **Play Store 연결 완료**: 소유자가 제공한 실제 앱 주소를 src/config.ts에 연결했습니다. 실제 앱 이동은 공개 배포 후 휴대폰에서도 확인하세요.
2. **실제 도메인 반영**: `https://moneymarathon-web.pages.dev`에 공개 배포되었으며 HTTP 200과 Cloudflare 보안 헤더를 확인했습니다. index metadata/JSON-LD, robots, sitemap을 실제 주소로 수정했습니다.
3. **실제 웹 배포 완료**: GitHub 저장소 mingyunkang540/moneymarathon-web의 main 브랜치와 Cloudflare Pages를 연결했습니다. README에 main / npm run build / dist / Node 환경설정을 문서화했습니다.
4. HTTPS 운영 도메인에서 OS 공유 동작, 앱 설치 이동, Lighthouse, 검색 도구 sitemap 등록을 확인하세요.
