const fs = require('fs')
const https = require('https')

async function downloadPrintfulMockups({ OutputDir }) {
  const filesRaw = fs.readFileSync(`${OutputDir}/printful-images.json`)
  const files = JSON.parse(filesRaw)
  console.log(`Downloading ${files.length} mockups...`)

  for (const file of files) {
    const prefix = `${OutputDir}/data/${file.id}/orig`
    fs.mkdirSync(prefix, { recursive: true })
    await new Promise(resolve => {
      const f = fs
        .createWriteStream(`${prefix}/${file.file}`)
        .on('finish', resolve)
      https.get(file.url, response => response.pipe(f))
    })
  }
}

module.exports = downloadPrintfulMockups
