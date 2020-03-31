const fs = require('fs')
const https = require('https')

async function downloadMockups({ OutputDir, id, taskJson }) {
  const files = []
  taskJson.result.mockups.forEach(mockup => {
    files.push({
      name: `${mockup.placement}.jpg`,
      url: mockup.mockup_url
    })
    mockup.extra.forEach(extra => {
      files.push({
        name: `${mockup.placement}-${extra.option_group
          .toLowerCase()
          .replace(/ +/g, '-')
          .replace(/[^0-9a-z-]/g, '')}-${extra.option
          .toLowerCase()
          .replace(/ +/g, '-')
          .replace(/[^0-9a-z-]/g, '')}.jpg`,
        url: extra.url
      })
    })
  })
  const prefix = `${OutputDir}/images-printful/product-${id}`
  for (const file of files) {
    fs.mkdirSync(prefix, { recursive: true })
    await new Promise(resolve => {
      const f = fs
        .createWriteStream(`${prefix}/${file.name}`)
        .on('finish', resolve)
      https.get(file.url, response => response.pipe(f))
    })
  }
}

module.exports = downloadMockups
