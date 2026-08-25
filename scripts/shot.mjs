// usage: node scripts/shot.mjs <path> <name> [baseUrl] [widths]
//   → qa/<name>-{1440,1024,390}.png (full page, after scrolling through so appear animations fire)
import { chromium } from 'playwright-core'
import { mkdirSync } from 'node:fs'

const exe = `${process.env.HOME}/.cache/ms-playwright/chromium-1234/chrome-linux64/chrome`
const [, , path = '/', name = 'home', base = 'http://localhost:5173', widthsArg = '1440,1024,390'] = process.argv
const widths = widthsArg.split(',').map(Number)
mkdirSync('qa', { recursive: true })

const browser = await chromium.launch({ executablePath: exe, headless: true, args: ['--no-sandbox'] })
for (const width of widths) {
  const page = await browser.newPage({ viewport: { width, height: width <= 500 ? 844 : 900 } })
  page.on('pageerror', e => console.log('  pageerror:', e.message))
  await page.goto(base + path, { waitUntil: 'networkidle', timeout: 60000 }).catch(e => console.log('  goto:', e.message))
  await page.waitForTimeout(3500)
  const total = await page.evaluate(() => document.body.scrollHeight)
  for (let y = 0; y < total; y += 400) {
    await page.evaluate(v => window.scrollTo(0, v), y)
    await page.waitForTimeout(120)
  }
  await page.waitForTimeout(1200)
  await page.evaluate(() => window.scrollTo(0, 0))
  await page.waitForTimeout(600)
  await page.screenshot({ path: `qa/${name}-${width}.png`, fullPage: true })
  console.log('saved', `qa/${name}-${width}.png`, 'height', total)
  await page.close()
}
await browser.close()
