const fs = require('fs')
const sharp = require('sharp')
const https = require('https')

async function downloadPrintfulMockups({ OutputDir, png }) {
  const filesRaw = fs.readFileSync(`${OutputDir}/printful-images.json`)
  const files = JSON.parse(filesRaw)
  console.log(`Downloading ${files.length} mockups...`)

  for (const file of files) {
    const prefix = `${OutputDir}/data/${file.id}/orig`
    fs.mkdirSync(prefix, { recursive: true })
    const filename = `${prefix}/${file.file}`
    const filenameOut = png ? filename : filename.replace('.png', '.jpg')
    // console.log(filenameOut)
    if (!fs.existsSync(filenameOut)) {
      await new Promise(resolve => {
        const f = fs.createWriteStream(filename).on('finish', resolve)
        https.get(file.url, response => response.pipe(f))
      })
      let resizedFile
      if (png) {
        resizedFile = await sharp(filename).toBuffer()
        fs.writeFileSync(filenameOut, resizedFile)
      } else {
        resizedFile = await sharp(filename)
          .jpeg()
          .toBuffer()
        fs.writeFileSync(filenameOut, resizedFile)
        fs.unlinkSync(filename)
      }
    }
  }
}

module.exports = downloadPrintfulMockups
