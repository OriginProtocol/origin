const fetch = require('node-fetch')
const fs = require('fs')

function getOldData(body) {
  const dataMatch = body.match(/sizeGuideTablePar.data = (.*);/)
  const sizesMatch = body.match(/sizeGuideTablePar.productSizes = (.*);/)
  const [, dataRaw] = dataMatch
  const [, productSizesRaw] = sizesMatch

  const data = JSON.parse(dataRaw)
  const productSizes = JSON.parse(productSizesRaw)
  return { data, productSizes }
}

function getNewData(body) {
  const dataMatch = body.match(/pmSizeTableParams.data = (.*);/)
  const sizesMatch = body.match(/mySizeTableParams.productSizes = (.*);/)
  const [, dataRaw] = dataMatch
  const [, productSizesRaw] = sizesMatch

  const data = JSON.parse(dataRaw)
  const productSizes = JSON.parse(productSizesRaw)
  return { data, productSizes }
}

async function getSizeGuide({ OutputDir, productId }) {
  const sizePath = `${OutputDir}/data-printful/size-guide-${productId}.json`

  if (fs.existsSync(sizePath)) {
    const resultRaw = fs.readFileSync(sizePath)
    const result = JSON.parse(resultRaw)
    return result
  }

  try {
    const url = 'https://www.printful.com/custom-products/size-guide'
    const res = await fetch(`${url}?productId=${productId}`)
    const body = await res.text()
    const isOld = body.match(/sizeGuideTablePar.isOldSizeGuide = true;/)
    const { data, productSizes } = isOld ? getOldData(body) : getNewData(body)

    const measurements = Object.keys(data).map(key => ({
      name: key,
      type: productId === 186 ? '' : data[key].type // Exclude socks
    }))
    const sizes = productSizes.map(size => {
      const values = measurements.reduce((m, key) => {
        m[key.name] = data[key.name].values[size].join(' - ')
        return m
      }, {})
      return { size, ...values }
    })

    const result = { sizes, measurements }

    fs.writeFileSync(sizePath, JSON.stringify(result, null, 2))

    return result
  } catch (e) {
    return null
  }
}

module.exports = getSizeGuide
