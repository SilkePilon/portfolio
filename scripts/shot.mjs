// usage: node scripts/shot.mjs <path> <name> [cssSelector] [baseUrl] [widths]
//   → qa/<name>-{1440,1024,390}.png. Full pages are captured viewport by viewport and stitched (Playwright's
//     fullPage mode breaks on very tall pages with smooth scrolling); with a selector only that element is captured.
import { chromium } from 'playwright-core'
import { mkdirSync, writeFileSync, unlinkSync } from 'node:fs'
import { execFileSync } from 'node:child_process'

const exe = process.env.CHROME_PATH || chromium.executablePath()
const [, , path = '/', name = 'home', selector = '', base = 'http://localhost:3000', widthsArg = '1440,1024,390'] = process.argv
const widths = widthsArg.split(',').map(Number)
mkdirSync('qa', { recursive: true })

const browser = await chromium.launch({ executablePath: exe, headless: true, args: ['--no-sandbox', '--use-gl=angle', '--use-angle=swiftshader'] })
for (const width of widths) {
  const vh = width < 810 ? 844 : 900
  const page = await browser.newPage({ viewport: { width, height: vh } })
  page.on('pageerror', (e) => console.log('  pageerror:', e.message.slice(0, 200)))
  await page.goto(base + path, { waitUntil: 'networkidle', timeout: 60000 })
  await page.waitForTimeout(3500)
  const jump = (y) => page.evaluate((v) => { const l = window.__lenis; if (l) l.scrollTo(v, { immediate: true, force: true }); else window.scrollTo(0, v) }, y)
  const total = await page.evaluate(() => document.documentElement.scrollHeight)
  for (let y = 0; y < total; y += 400) { await jump(y); await page.waitForTimeout(100) }   // fire appear animations
  await page.waitForTimeout(800)
  await jump(0)
  await page.waitForTimeout(500)
  const out = `qa/${name}-${width}.png`
  if (selector) {
    const el = page.locator(selector).first()
    await el.scrollIntoViewIfNeeded()
    await page.waitForTimeout(800)
    await el.screenshot({ path: out })
  } else {
    const parts = []
    const n = Math.ceil(total / vh)
    for (let i = 0; i < n; i++) {
      const y = Math.min(i * vh, total - vh)
      await jump(y)
      if (i === 1) await page.evaluate(() => { const nav = document.querySelector('nav[aria-label="Main"]'); if (nav) nav.style.visibility = 'hidden' })
      await page.waitForTimeout(250)
      const file = `qa/.${name}-${width}-${i}.png`
      await page.screenshot({ path: file })
      parts.push({ file, y, top: i * vh - y }) // `top` = rows of overlap to skip for the last segment
    }
    writeFileSync(`qa/.${name}-${width}.json`, JSON.stringify({ parts, total, width }))
    execFileSync('python3', ['scripts/stitch.py', `qa/.${name}-${width}.json`, out])
    for (const p of parts) unlinkSync(p.file)
    unlinkSync(`qa/.${name}-${width}.json`)
  }
  console.log('saved', out, 'page height', total)
  await page.close()
}
await browser.close()
