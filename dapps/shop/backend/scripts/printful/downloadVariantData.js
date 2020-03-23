const fs = require('fs')

const getVariant = require('./getVariant')
const getProductIds = require('./getProductIds')

async function downloadVariantData({ OutputDir, PrintfulURL, apiAuth }) {
  const ids = await getProductIds({ OutputDir })
  for (const id of ids) {
    const productDataRaw = fs.readFileSync(
      `${OutputDir}/data-printful/product-${id}.json`
    )
    const productData = JSON.parse(productDataRaw)
    console.log(productData.sync_variants[0].product.variant_id)
    const firstVariantId = productData.sync_variants[0].product.variant_id
    await getVariant({ PrintfulURL, apiAuth, OutputDir, id: firstVariantId })
    // for (const variant of productData.sync_variants) {
    //   const id = variant.product.variant_id
    //   await getVariant({ PrintfulURL, apiAuth, OutputDir, id })
    // }
  }
}

module.exports = downloadVariantData
