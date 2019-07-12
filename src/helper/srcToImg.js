const http = require('http')
const https = require('https')
const fs = require('fs')
const path = require('path')
const { promisify } = require('util')
const writeFile = promisify(fs.writeFile) // 将fs.writeFile包装成peomise

module.exports = async (src, dir) => {
  console.log(src)
  const re = /\.(jpg|png|gif)$/
  if (re.test(src)) {
    console.log(src)
    await urlToImg(src, dir) // 因为urlToImg是promise，需要使用async/await
  } else {
    await base64ToImg(src, dir)
  }
}

// url => img；发送http请求获取到图片信息
const urlToImg = promisify((url, dir, callback) => {
  // 1. 判断url的协议，从而决定使用http或https
  const mod = /^https:/.test(url) ? https : http
  // 2. 获取文件的扩展名
  const extname = path.extname(url)
  // 3. 拼接文件存储的位置
  const filepath = path.join(dir, `${Date.now()}${extname}`)
  mod.get(url, res => {
    // 4. 将res即图片二进制流写入到相应的文件中，实现保存图片
    res.pipe(fs.createWriteStream(filepath)).on('finish', () => {
      // 5. 回调，通知已经完成图片下载 -----> 为将回调函数转化为promise做准备
      callback()
    })
  })
})
// 6. promisify包住一个函数，那么urlToImg就是一个promise

//base64 => img；获取img的内容 + writeFile直接写入文件就可以保存图片了
const base64ToImg = async function(base64Str, dir) {
  //1. base64的格式：data:image/ipeg;base64,图片内容的编码content
  const re = /^data:(.+?);base64,(.+)$/ // ⚠️：'(.+?);'中的'?'代表，匹配到第一个';'就停止，默认会一直匹配到最后一个';'停止
  const matches = base64Str.match(re)
  try {
    // 2. 获取扩展名
    const ext = matches[1].split('/')[1].replace('jpeg', 'jpg')
    const filepath = path.join(dir, `${Date.now()}.${ext}`)

    // 3. 获取图片内容
    const content = matches[2]
    await writeFile(filepath, content, 'base64') // 写文件是异步操作，需要使用async/await
  } catch (error) {
    console.log('非法 base64 字符串')
  }
}
