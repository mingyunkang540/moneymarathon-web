import { expect, test, type Page } from '@playwright/test'

const calculateButton = '목표까지 얼마나 걸릴까?'

async function replace(page: Page, label: string, value: string) {
  await page.getByLabel(label, { exact: true }).fill(value)
}

async function calculate(page: Page) {
  await page.getByRole('button', { name: calculateButton }).click()
}

test.beforeEach(async ({ page }) => {
  await page.goto('/')
})

test('does not show a result before the calculator is submitted', async ({ page }) => {
  await expect(page.locator('#result')).toHaveCount(0)
})

test('calculates the default inputs and the monthly 200,000 won comparison', async ({ page }) => {
  await calculate(page)

  await expect(page.getByRole('heading', { name: /3년 4개월 후/ })).toBeVisible()
  await expect(page.getByText('4개월 빨라져요')).toBeVisible()
  await expect(page.getByText('3년', { exact: true })).toBeVisible()
})

test('calculates 47 months when the annual return is zero', async ({ page }) => {
  await replace(page, '기대 연수익률', '0')
  await calculate(page)

  await expect(page.getByRole('heading', { name: /3년 11개월 후/ })).toBeVisible()
})

test('reports an already achieved goal', async ({ page }) => {
  await replace(page, '현재 모은 돈', '10,000')
  await calculate(page)

  await expect(page.getByRole('heading', { name: '이미 목표를 달성했어요!' })).toBeVisible()
})

test('reports a goal that cannot be reached within the calculation period', async ({ page }) => {
  await replace(page, '매달 저축·투자', '0')
  await replace(page, '기대 연수익률', '0')
  await calculate(page)

  await expect(page.getByRole('heading', { name: /목표에 도달하기 어려워요/ })).toBeVisible()
})

for (const invalidCase of [
  { name: 'empty amount', label: '현재 모은 돈', value: '', message: '0 이상의 정수를 만원 단위로 입력해주세요.' },
  { name: 'negative amount', label: '매달 저축·투자', value: '-1', message: '0 이상의 정수를 만원 단위로 입력해주세요.' },
  { name: 'amount over one trillion won', label: '목표 금액', value: '100,000,001', message: '1억 만원(1조원) 이하로 입력해주세요.' },
  { name: 'annual return above 100 percent', label: '기대 연수익률', value: '101', message: '0~100 사이의 연수익률을 입력해주세요.' },
]) {
  test(`rejects ${invalidCase.name}`, async ({ page }) => {
    const input = page.getByLabel(invalidCase.label, { exact: true })
    await input.fill(invalidCase.value)
    await calculate(page)

    await expect(page.getByText(`! ${invalidCase.message}`)).toBeVisible()
    await expect(input).toBeFocused()
    await expect(page.locator('#result')).toHaveCount(0)
  })
}

test('keeps the displayed result unchanged while inputs are edited', async ({ page }) => {
  await calculate(page)
  const result = page.locator('#result')
  await expect(result).toContainText('3년 4개월 후')

  await replace(page, '현재 모은 돈', '9,999')

  await expect(result).toContainText('3년 4개월 후')
  await expect(result).toContainText('3,000만원')
  await expect(result).not.toContainText('9,999만원')
})

test('submits with Enter and moves focus to the result heading', async ({ page }) => {
  const rate = page.getByLabel('기대 연수익률', { exact: true })
  await rate.focus()
  await rate.press('Enter')

  await expect(page.getByRole('heading', { name: /3년 4개월 후/ })).toBeFocused()
})

test('expands an FAQ answer', async ({ page }) => {
  const question = page.locator('summary').filter({ hasText: '투자를 하지 않으면 어떻게 계산하나요?' })
  await question.click()

  await expect(page.getByText(/기대 연수익률을 0%로 입력하세요/)).toBeVisible()
})

test('uses Web Share and announces success', async ({ page }) => {
  await page.addInitScript(() => {
    Object.defineProperty(navigator, 'share', {
      configurable: true,
      value: async (data: ShareData) => { (window as Window & { shared?: ShareData }).shared = data },
    })
  })
  await page.reload()
  await calculate(page)
  await page.getByRole('button', { name: '결과 공유하기' }).click()

  await expect(page.getByRole('status')).toHaveText('공유했어요.')
  const shared = await page.evaluate(() => (window as Window & { shared?: ShareData }).shared)
  expect(shared?.title).toContain('1억 모으기 계산기')
  expect(shared?.url).toBe(`${new URL(page.url()).origin}/`)
  expect(shared?.text).toContain('현재 3,000만원, 월 150만원씩 모으면')
})

test('announces a cancelled Web Share without copying', async ({ page }) => {
  await page.addInitScript(() => {
    Object.defineProperty(navigator, 'share', {
      configurable: true,
      value: async () => { throw new DOMException('cancelled', 'AbortError') },
    })
    Object.defineProperty(navigator, 'clipboard', {
      configurable: true,
      value: { writeText: async () => { (window as Window & { copied?: boolean }).copied = true } },
    })
  })
  await page.reload()
  await calculate(page)
  await page.getByRole('button', { name: '결과 공유하기' }).click()

  await expect(page.getByRole('status')).toHaveText('공유를 취소했어요.')
  expect(await page.evaluate(() => (window as Window & { copied?: boolean }).copied)).toBeUndefined()
})

test('clipboard fallback copies a clean URL without financial or location data', async ({ page }) => {
  await page.addInitScript(() => {
    Object.defineProperty(navigator, 'share', { configurable: true, value: undefined })
    Object.defineProperty(navigator, 'clipboard', {
      configurable: true,
      value: { writeText: async (value: string) => { (window as Window & { copied?: string }).copied = value } },
    })
  })
  await page.goto('/?current=3000&monthly=150#private-result')
  await calculate(page)
  await page.getByRole('button', { name: '결과 공유하기' }).click()

  const copied = await page.evaluate(() => (window as Window & { copied?: string }).copied)
  expect(copied).toBe(`${new URL(page.url()).origin}/`)
  expect(copied).not.toMatch(/[?#]|3000|150|10000/)
  await expect(page.getByRole('status')).toContainText('입력 금액은 포함되지 않아요')
})

test('shows a selectable URL when Web Share and clipboard are unavailable', async ({ page }) => {
  await page.addInitScript(() => {
    Object.defineProperty(navigator, 'share', { configurable: true, value: undefined })
    Object.defineProperty(navigator, 'clipboard', {
      configurable: true,
      value: { writeText: async () => { throw new Error('clipboard unavailable') } },
    })
  })
  await page.reload()
  await calculate(page)
  await page.getByRole('button', { name: '결과 공유하기' }).click()

  await expect(page.getByRole('status')).toHaveText('아래 계산기 링크를 선택해 복사해주세요.')
  await expect(page.getByLabel('복사할 계산기 링크')).toHaveValue(`${new URL(page.url()).origin}/`)
})

test('calculation does not fetch, beacon, or use browser storage', async ({ page }) => {
  await page.evaluate(() => {
    const activity: string[] = []
    ;(window as Window & { activity?: string[] }).activity = activity
    window.fetch = async () => { activity.push('fetch'); return new Response() }
    Object.defineProperty(navigator, 'sendBeacon', { configurable: true, value: () => { activity.push('beacon'); return true } })
    for (const name of ['localStorage', 'sessionStorage'] as const) {
      const storage = window[name]
      for (const method of ['getItem', 'setItem', 'removeItem', 'clear'] as const) {
        const original = storage[method].bind(storage)
        Object.defineProperty(storage, method, {
          configurable: true,
          value: (...args: unknown[]) => { activity.push(`${name}.${method}`); return Reflect.apply(original, storage, args) },
        })
      }
    }
  })
  await calculate(page)

  expect(await page.evaluate(() => (window as Window & { activity?: string[] }).activity)).toEqual([])
})

test('connects the owner-provided Play Store listing with campaign attribution', async ({ page }) => {
  await calculate(page)
  const cta = page.getByRole('link', { name: /Google Play에서 무료로 시작하기/ })
  await expect(cta).toHaveCount(1)
  const url = new URL((await cta.getAttribute('href'))!)
  expect(url.origin).toBe('https://play.google.com')
  expect(url.searchParams.get('id')).toBe('com.minigyunilab.moneymarathon')
  expect(url.searchParams.get('utm_campaign')).toBe('100million')
  expect([...url.searchParams.keys()].sort()).toEqual(['id', 'referrer', 'utm_campaign', 'utm_medium', 'utm_source'])
  await expect(page.getByText(/앱 링크 준비 중/)).toHaveCount(0)
})

for (const width of [320, 360, 390, 430, 768, 1024, 1440]) {
  test(`has no horizontal overflow at ${width}px before and after calculation`, async ({ page }, testInfo) => {
    test.skip(testInfo.project.name !== 'desktop', 'Responsive matrix runs once in the desktop project')
    await page.setViewportSize({ width, height: 900 })
    await page.reload()

    expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBeLessThanOrEqual(width)
    await testInfo.attach(`initial-${width}px`, { body: await page.screenshot({ fullPage: true }), contentType: 'image/png' })
    await calculate(page)
    expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBeLessThanOrEqual(width)
    await testInfo.attach(`result-${width}px`, { body: await page.screenshot({ fullPage: true }), contentType: 'image/png' })
  })
}
