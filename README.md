# Money Marathon Web

검색·SNS에서 유입된 사용자가 **1억 모으기 계산기**로 목표까지 걸리는 시간을 확인하고, Android 앱 **머니마라톤**으로 이어지는 무료 정적 웹사이트입니다. 앱 전체 기능을 복제하지 않습니다.

## 기술과 실행

Vite 8 · React 19 · TypeScript 6 · 순수 CSS. UI 프레임워크, 라우터, 서버, DB, 로그인, PWA, Analytics SDK가 없습니다. TypeScript 6은 현재 ESLint 도구 호환성을 위해 선택했습니다.

Node **22.17.1 이상**을 사용하세요. `.nvmrc`는 검증한 버전입니다.

```sh
npm install
npm run dev
```

개발 URL은 터미널에 표시됩니다. 기본값은 `http://127.0.0.1:5173`입니다.

```sh
npm run build
npm run preview
npm test
npm run typecheck
npm run lint
```

브라우저 테스트:

```sh
npx playwright install chromium
npm run test:e2e
```

`package-lock.json`을 함께 커밋하세요. CI에서는 `npm ci`를 사용하세요.

## 구조

```text
public/                 robots, sitemap, favicon, 1200×630 OG, Cloudflare headers
src/components/         입력, 결과, 비교, 앱 CTA, 공통 UI
src/domain/             순수 계산 함수, 형식 변환, 단위 테스트
src/pages/              단일 계산기 페이지
src/styles/             색상 토큰과 반응형 CSS
src/config.ts           Play Store 주소 검증, UTM 생성
scripts/                빌드 도구, OG 생성
e2e/                    Playwright 기능·모바일·개인정보 검증
DESIGN.md               제품·브랜드·접근성 기준
```

## 계산 기준

금액 입력은 **만원 단위의 0 이상 정수**이며, 내부에서는 `입력값 × 10,000`원으로 계산합니다. 목표는 0보다 커야 합니다. 금액 상한은 항목당 **1조원**, 기대 연수익률은 **0~100%**입니다. 상한은 입력 오류 방어용이며 투자 추천 범위가 아닙니다. 소수 연수익률을 입력할 수 있습니다.

```text
monthlyRate = (1 + annualRate / 100)^(1 / 12) - 1
balance = balance * (1 + monthlyRate) + monthlyContribution
```

매달 기존 자산에 수익 반영 → 월말 납입 → 목표 도달 확인 순서입니다. 최초 도달 월을 찾으며 최대 **1,200개월(100년)**까지 계산합니다. 이미 달성한 경우 0개월입니다. 세금·수수료·물가·불규칙 납입은 반영하지 않습니다. 실제 수익을 보장하지 않습니다.

기본 예시 `3,000만원 / 월 150만원 / 목표 1억원 / 연 5%`는 **40개월(3년 4개월)**이며, 연 0%일 때는 **47개월**입니다. 비교는 같은 조건에서 월 납입액에 **20만원**을 더해 실제 차이를 계산합니다. 추가 납입이 계산 상한을 넘으면 비교 불가 안내를 표시합니다.

## 개인정보와 공유

- 금융 입력은 React 메모리에서만 처리하며 서버에 전송하거나 브라우저 저장소에 기록하지 않습니다. 새로고침하면 초기화됩니다.
- 결과는 계산 시점의 입력을 보관한 화면 내 스냅샷입니다. 입력을 수정한 뒤에는 다시 계산하세요.
- 공유 버튼을 직접 누른 경우에만 금융 금액을 포함한 공유 텍스트를 만들고 운영체제 공유창에 넘깁니다. 사용자가 선택한 공유 상대에게는 이 텍스트가 전달될 수 있습니다.
- 공유 URL은 `현재 origin + /`이며 query/hash/입력 금액을 포함하지 않습니다. Web Share 미지원 시에는 **계산기 링크만** 클립보드로 복사합니다. 클립보드도 사용할 수 없으면 복사 가능한 링크 필드를 제공합니다.
- HTTP로 정적 파일을 제공하는 호스팅 사업자의 접속 로그와 별개로, 이 앱은 금융 입력을 요청 URL·body·Analytics에 싣지 않습니다.
- Analytics는 설치하지 않았습니다. Cloudflare Web Analytics를 추후 별도로 활성화할 경우 개인정보 안내와 CSP를 다시 확인하세요.

## Play Store CTA 설정

실제 머니마라톤 앱 주소가 `src/config.ts`에 기본값으로 연결되어 있습니다. 기본 배포에는 별도 URL 환경변수가 필요하지 않습니다. 주소를 변경할 때만 `.env.example`을 `.env.local`로 복사하고 아래 값을 설정하세요.

```dotenv
VITE_PLAY_STORE_URL=실제_Google_Play_앱_상세_URL
```

소유자가 제공한 실제 앱 주소를 사용하며 **임의 package ID는 사용하지 않습니다.** 환경변수를 잘못된 주소로 덮어쓰면 버튼은 비활성화되고 준비 중 문구가 나타납니다. HTTPS의 `play.google.com/store/apps/details?id=...` 주소만 허용합니다.

`src/config.ts`의 `PLAY_STORE_URL` 한 곳에서 관리합니다. `buildPlayStoreUrl()`은 아래 UTM을 일반 query와 Google Play 설치용 `referrer`에 넣습니다. 금융 입력값은 포함되지 않습니다.

```text
utm_source=moneymarathon_web
utm_medium=calculator
utm_campaign=100million
```

Vite 환경변수는 빌드 시점에 적용됩니다. 변경 후 **다시 빌드·배포**해야 합니다. Cloudflare Pages에도 Production/Preview 환경변수를 설정하세요.

## SEO와 도메인

한 개의 h1, 한국어 title/description, canonical, OG/Twitter 카드, WebApplication 구조화 데이터, 설명 콘텐츠, FAQ, robots, sitemap을 제공합니다. 빌드 시 `react-dom/server`로 초기 화면을 정적 HTML에 포함하므로 검색엔진이 JavaScript 실행 없이도 내용을 읽을 수 있습니다. 브라우저는 이를 hydrate하여 계산 기능을 연결합니다. 이 과정은 빌드 시에만 수행되며 배포되는 서버는 없습니다. OG 이미지는 1200×630 PNG이며 약 27KB입니다. 외부 폰트나 대형 Hero 이미지는 없습니다.

초기 도메인은 요구사항의 가정인 **`https://moneymarathon.pages.dev`**입니다. 실제 호스팅 주소와 다를 경우 다음을 **모두** 수정하세요.

1. `index.html`: canonical, `og:url`, `og:image`, `twitter:image`, JSON-LD의 `url`.
2. `public/robots.txt`: Sitemap 주소.
3. `public/sitemap.xml`: `<loc>`.

필요하면 Windows에서 `powershell -ExecutionPolicy Bypass -File scripts/generate-og.ps1`로 OG 이미지를 다시 생성할 수 있습니다. 생성된 PNG는 이미 포함되어 있어 Cloudflare/Linux 빌드에는 이 스크립트 실행이 필요하지 않습니다.

## Cloudflare Pages 배포

1. GitHub에 `moneymarathon-web` 저장소를 만들고 프로젝트와 lockfile을 `main`에 push합니다. `.env.local`이나 `node_modules`, `dist`는 커밋하지 않습니다.
2. Cloudflare Pages에서 GitHub 저장소를 연결합니다.
3. Production branch: **`main`**, Build command: **`npm run build`**, Build output directory: **`dist`**, Root directory: 프로젝트 루트.
4. 빌드 환경변수 `NODE_VERSION=22.17.1`을 설정합니다. `VITE_PLAY_STORE_URL`은 주소를 변경하는 경우에만 설정합니다.
5. 배포 후 실제 도메인과 위 SEO URL을 맞추고 다시 배포합니다.
6. 휴대폰에서 계산, 공유, 실제 앱 상세 페이지 이동을 확인하고 Google Search Console/Naver Search Advisor에 sitemap을 제출합니다.

GitHub 저장소는 `https://github.com/mingyunkang540/moneymarathon-web`입니다. Cloudflare 계정에서 저장소를 연결해 배포하세요. 배포 결과물은 정적 `dist`뿐이며 Cloudflare Functions가 필요 없습니다. `public/_headers`는 보안 헤더를 제공합니다.

## 반응형·접근성·성능

320 / 360 / 390 / 430 / 768 / 1024 / 1440px 너비에서 가로 넘침과 입력→결과를 검증합니다. 주요 버튼과 입력 높이는 48px 이상입니다. label, 오류 텍스트, 키보드 제출/포커스, 감소된 모션, FAQ의 native details/summary를 사용합니다. 결과는 초기 화면에 나타나지 않습니다.

Lighthouse는 **production build의 preview 또는 실제 배포 URL**을 사용해 확인하세요. Chrome 개발자 도구 Lighthouse에서 Mobile, Performance/Accessibility/Best Practices/SEO를 선택합니다. 네 항목 모두 90+가 목표이며 실측값은 실행 조건에 따라 달라집니다.

2026-10-05 로컬 production preview 검증: 단위 테스트 **26개**, 계산기 E2E **61개**, 보안 헤더·axe 접근성 E2E **3개** 통과. 실제 Play Store 주소 연결 후 CTA를 3개 기기 프로젝트에서 재검증했습니다. lint/typecheck/build 통과. 초기 Lighthouse Mobile은 **Performance 100 / Accessibility 100 / Best Practices 100 / SEO 100**입니다. 배포 네트워크·호스팅 설정·기기에서는 점수가 달라질 수 있습니다. 자세한 검증 범위는 `docs/VALIDATION.md`에 있습니다.

## 다음 확장

다음 추천은 **목표기간에 맞는 월 저축액 계산기**입니다. `calculateGoalDuration()`의 월 수익·납입 기준을 유지하면서 별도 순수 domain 함수를 추가하세요. 이후 복리, 하루 지출 계산기를 고려할 수 있습니다. 실제 여러 페이지가 생겼을 때만 라우터, 페이지별 metadata, sitemap URL을 추가합니다. 미래 기능을 미리 구현하지 않습니다.
