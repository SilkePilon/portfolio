import { chromium } from 'playwright-core'
import { mkdirSync } from 'node:fs'
const exe = process.env.CHROME_PATH || chromium.executablePath()
const widths = (process.argv[2] || '1440,390').split(',').map(Number)
const stops = [0.3, 0.65, 1]
mkdirSync('qa/lab', { recursive: true })
const browser = await chromium.launch({ executablePath: exe, headless: true, args: ['--no-sandbox', '--use-gl=angle', '--use-angle=swiftshader'] })
for (const width of widths) {
  const vh = width < 810 ? 844 : 900
  const page = await browser.newPage({ viewport: { width, height: vh } })
  page.on('pageerror', (e) => console.log('  pageerror:', e.message.slice(0, 300)))
  page.on('console', (m) => m.type() === 'error' && console.log('  console:', m.text().slice(0, 200)))
  await page.goto('http://localhost:3000/lab/showcase', { waitUntil: 'networkidle', timeout: 90000 })
  await page.waitForTimeout(3000)
  const jump = (y) => page.evaluate((v) => { const l = window.__lenis; if (l) l.scrollTo(v, { immediate: true, force: true }); else window.scrollTo(0, v) }, y)
  const secs = await page.evaluate(() => [...document.querySelectorAll('[data-lab-option]')].map((s) => ({ id: s.id, top: s.offsetTop, h: s.offsetHeight })))
  for (const [i, s] of secs.entries()) {
    for (const st of stops) {
      const y = s.top + (s.h - vh) * st
      await jump(y); await page.waitForTimeout(150); await jump(y + 1); await page.waitForTimeout(400)
      await page.screenshot({ path: `qa/lab/${String(i + 1).padStart(2, '0')}-${s.id}-${st}-${width}.png` })
    }
  }
  console.log('done', width, secs.length)
  await page.close()
}
await browser.close()
