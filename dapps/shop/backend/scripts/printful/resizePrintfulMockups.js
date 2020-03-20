const fs = require('fs')
const sharp = require('sharp')

async function resizePrintfulMockups({ OutputDir }) {
  console.log('Resizing mockups...')
  const filesRaw = fs.readFileSync(`${OutputDir}/printful-images.json`)
  const files = JSON.parse(filesRaw)

  for (const file of files) {
    const inputDir = `${OutputDir}/data/${file.id}/orig`
    const outputFileDir = `${OutputDir}/data/${file.id}/520`

    fs.mkdirSync(outputFileDir, { recursive: true })
    const images = fs.readdirSync(inputDir)
    for (const image of images) {
      if (!fs.existsSync(`${outputFileDir}/${image}`)) {
        const resizedFile = await sharp(`${inputDir}/${image}`)
          .resize(520)
          .toBuffer()

        fs.writeFileSync(`${outputFileDir}/${image}`, resizedFile)
      }
    }
  }
}

module.exports = resizePrintfulMockups