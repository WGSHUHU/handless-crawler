const puppeteer = require('puppeteer')
const { mn } = require('./config/default')
const srcToImg = require('./helper/srcToImg')

;(async () => {
  const browser = await puppeteer.launch()
  const page = await browser.newPage()
  // 1.打开百度图片的地址
  await page.goto('https://image.baidu.com/')
  console.log('go to https://image.baidu.com/')

  // 2. 设置浏览器窗口大小
  await page.setViewport({
    width: 1920,
    height: 1080
  })
  console.log('reset viewport ')

  // 3. 搜索框得到焦点 ---> 输入搜索的内容 --> 点击搜索按钮
  await page.focus('#kw')
  await page.keyboard.sendCharacter('狗')
  await page.click('.s_search')
  console.log('go to search list')

  // 4. 等待网页加载完成 ---> 获取页面上的图片元素；因为是获取元素，要使用async/await异步操作
  page.on('load', async () => {
    console.log('page loading done, start fetch')

    const srcs = await page.evaluate(() => {
      //获取所有的img元素
      const images = document.querySelectorAll('img.img-hover')
      //images是类数组
      return Array.prototype.map.call(images, img => img.src)
    })
    srcs.forEach(async src => {
      await page.waitFor(200) // sleep ---------> 为了反作弊，等待一段时间再进行操作
      await srcToImg(src, mn)
    })
    // 5. 关闭浏览器
    await browser.close()
  })
})()

/**
 * 如何不断的加载图片？
 * 法1. 不断触发浏览器的滚动事件
 * 法2. 设置浏览器的窗口无限大(⚠️：不要设置很离谱)
 */
