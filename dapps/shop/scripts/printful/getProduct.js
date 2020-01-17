const fs = require('fs')

async function getProduct({ PrintfulURL, apiAuth, OutputDir, id }) {
  const res = await fetch(`${PrintfulURL}/sync/products/${id}`, {
    headers: {
      'content-type': 'application/json',
      authorization: `Basic ${apiAuth}`
    },
    method: 'GET'
  })
  const json = await res.json()
  const data = json.result

  fs.writeFileSync(
    `${OutputDir}/data-printful/product-${id}.json`,
    JSON.stringify(data, null, 2)
  )
  console.log(`Wrote product ${id}`)
}

module.exports = getProduct
