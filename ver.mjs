import { chromium } from '@playwright/test'
const b = await chromium.launch()
const ctx = await b.newContext({ baseURL: 'https://eduardo.ustymkushnir.com', viewport: { width: 1280, height: 1000 }, deviceScaleFactor: 2 })
const p = await ctx.newPage()
await p.goto('/')
await p.waitForTimeout(2500)
await p.screenshot({ path: 'ver-inicio.png', clip: { x: 0, y: 0, width: 1280, height: 860 } })
await b.close()
