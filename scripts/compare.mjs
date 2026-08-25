// Local vs original full-page screenshots, side by side.
// usage: node scripts/compare.mjs [localBase] [originalBase]
//   defaults: http://localhost:3000 (next dev / next start) and https://eliankent.framer.website
// output: qa/cmp-<name>-<width>.png (local | original) for every template at 1440 / 1024 / 390.
import { chromium } from 'playwright-core'
import { mkdirSync } from 'node:fs'
import { execFileSync } from 'node:child_process'

const [, , localBase = 'http://localhost:3000', origBase = 'https://eliankent.framer.website'] = process.argv
const PAGES = [
  ['/', 'home'],
  ['/works', 'works'],
  ['/works/destello', 'destello'],
  ['/blogs', 'blogs'],
  ['/blogs/the-roadmap-behind-great-design', 'blog'],
  ['/this-page-does-not-exist', '404'],
]
const WIDTHS = [1440, 1024, 390]
mkdirSync('qa', { recursive: true })
const exe = process.env.CHROME_PATH || chromium.executablePath()
const browser = await chromium.launch({ executablePath: exe, headless: true, args: ['--no-sandbox', '--use-gl=angle', '--use-angle=swiftshader'] })

async function capture(url, width, out) {
  const page = await browser.newPage({ viewport: { width, height: width < 810 ? 844 : 900 } })
  await page.goto(url, { waitUntil: 'networkidle', timeout: 60000 }).catch(() => {})
  await page.waitForTimeout(4000)
  const total = await page.evaluate(() => document.body.scrollHeight)
  for (let y = 0; y < total; y += 400) {
    await page.evaluate((v) => window.scrollTo(0, v), y)
    await page.waitForTimeout(120)
  }
  await page.waitForTimeout(1000)
  await page.evaluate(() => window.scrollTo(0, 0))
  await page.waitForTimeout(700)
  await page.screenshot({ path: out, fullPage: true })
  await page.close()
}

for (const [path, name] of PAGES) {
  for (const width of WIDTHS) {
    const a = `qa/${name}-${width}-local.png`
    const b = `qa/${name}-${width}-orig.png`
    await capture(localBase + path, width, a)
    await capture(origBase + path, width, b)
    execFileSync('python3', ['scripts/sbs.py', a, b, `qa/cmp-${name}-${width}.png`])
    console.log('wrote', `qa/cmp-${name}-${width}.png`)
  }
}
await browser.close()
