const fs = require('fs')
const sharp = require('sharp')
const uniq = require('lodash/uniq')

async function resizePrintfulMockups({ OutputDir }) {
  const filesRaw = fs.readFileSync(`${OutputDir}/printful-images.json`)
  const files = JSON.parse(filesRaw)
  const fileIds = uniq(files.map(f => f.id))
  console.log(`Resizing mockups for ${fileIds.length} products...`)

  for (const fileId of fileIds) {
    const inputDir = `${OutputDir}/data/${fileId}/orig`
    const outputFileDir = `${OutputDir}/data/${fileId}/520`

    fs.mkdirSync(outputFileDir, { recursive: true })
    const images = fs.readdirSync(inputDir)
    for (const image of images) {
      const filename = `${inputDir}/${image}`
      if (!fs.existsSync(filename)) {
        const resizedFile = await sharp()
          .resize(520)
          .toBuffer()

        fs.writeFileSync(`${outputFileDir}/${image}`, resizedFile)
      }
    }
  }
}

module.exports = resizePrintfulMockups
