// usage: node scripts/shot.mjs <path> <name> [cssSelector] [baseUrl] [widths]
//   → qa/<name>-{1440,1024,390}.png (full page after scrolling through so appear animations fire;
//     with a selector only that element is captured, e.g. node scripts/shot.mjs / hero '#hero')
import { chromium } from 'playwright-core'
import { mkdirSync } from 'node:fs'

const exe = process.env.CHROME_PATH || chromium.executablePath()
const [, , path = '/', name = 'home', selector = '', base = 'http://localhost:5173', widthsArg = '1440,1024,390'] = process.argv
const widths = widthsArg.split(',').map(Number)
mkdirSync('qa', { recursive: true })

const browser = await chromium.launch({ executablePath: exe, headless: true, args: ['--no-sandbox', '--use-gl=angle', '--use-angle=swiftshader'] })
for (const width of widths) {
  const page = await browser.newPage({ viewport: { width, height: width < 810 ? 844 : 900 } })
  page.on('pageerror', (e) => console.log('  pageerror:', e.message))
  await page.goto(base + path, { waitUntil: 'networkidle', timeout: 60000 })
  await page.waitForTimeout(3500)
  const total = await page.evaluate(() => document.body.scrollHeight)
  for (let y = 0; y < total; y += 400) {
    await page.evaluate((v) => window.scrollTo(0, v), y)
    await page.waitForTimeout(120)
  }
  await page.waitForTimeout(1000)
  await page.evaluate(() => window.scrollTo(0, 0))
  await page.waitForTimeout(600)
  const out = `qa/${name}-${width}.png`
  if (selector) {
    const el = page.locator(selector).first()
    await el.scrollIntoViewIfNeeded()
    await page.waitForTimeout(800)
    await el.screenshot({ path: out })
  } else {
    await page.screenshot({ path: out, fullPage: true })
  }
  console.log('saved', out, 'page height', total)
  await page.close()
}
await browser.close()
