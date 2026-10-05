import AxeBuilder from '@axe-core/playwright'
import { expect, test } from '@playwright/test'
import { readFileSync } from 'node:fs'

test('static hydration and calculator remain accessible with deployment security headers', async ({ page }) => {
  const consoleErrors: string[] = []
  page.on('pageerror', (error) => consoleErrors.push(error.message))
  page.on('console', (message) => { if (message.type() === 'error') consoleErrors.push(message.text()) })
  const policy = readFileSync('public/_headers', 'utf8').split('\n').find((line) => line.includes('Content-Security-Policy:'))!.split('Content-Security-Policy:')[1].trim()
  await page.route('http://127.0.0.1:4173/', async (route) => {
    const response = await route.fetch()
    await route.fulfill({ response, headers: { ...response.headers(), 'content-security-policy': policy } })
  })
  await page.goto('/')
  const audit = () => new AxeBuilder({ page }).withTags(['wcag2a', 'wcag2aa', 'wcag21aa', 'wcag22aa']).analyze()
  expect((await audit()).violations).toEqual([])
  await page.getByRole('button', { name: '목표까지 얼마나 걸릴까?' }).click()
  await expect(page.getByRole('heading', { name: /3년 4개월 후/ })).toBeVisible()
  expect((await audit()).violations).toEqual([])
  expect(consoleErrors).toEqual([])
})
