const puppeteer = require('puppeteer')
const { screenShotPath } = require('./config/default')
;(async () => {
  const browser = await puppeteer.launch()
  const page = await browser.newPage()
  await page.goto('https://www.baidu.com/')
  await page.screenshot({
    path: `${screenShotPath}/${Date.now()}.jpg`
  })
  await browser.close()
})()
