const fs = require('fs')
const { get } = require('./_api')

async function getProduct({ apiAuth, OutputDir, id }) {
  const json = await get(`/sync/products/${id}`, { auth: apiAuth })
  const data = json.result

  fs.writeFileSync(
    `${OutputDir}/data-printful/product-${id}.json`,
    JSON.stringify(data, null, 2)
  )
  console.log(`Wrote product ${id}`)
}

module.exports = getProduct
