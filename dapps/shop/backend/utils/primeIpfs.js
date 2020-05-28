const fs = require('fs')
const https = require('https')
const Bottleneck = require('bottleneck')
const limiter = new Bottleneck({ maxConcurrent: 10 })
const { readdir } = fs.promises
const { resolve } = require('path')

async function getFiles(dir) {
  const dirents = await readdir(dir, { withFileTypes: true })
  const files = await Promise.all(
    dirents.map(dirent => {
      const res = resolve(dir, dirent.name)
      return dirent.isDirectory() ? getFiles(res) : res
    })
  )
  return Array.prototype.concat(...files)
}

async function download(url) {
  await new Promise(resolve => {
    const f = fs.createWriteStream('/dev/null').on('finish', resolve)
    console.log(`Priming ${url}`)
    https.get(url, response => response.pipe(f))
  })
}

async function prime(urlPrefix, dir) {
  const filesWithPath = await getFiles(dir)
  const files = filesWithPath.map(f => f.split('public/')[1])
  for (const file of files) {
    const url = `${urlPrefix}/${file}`
    limiter.schedule(url => download(url), url)
  }
}

module.exports = prime
