const fs = require('fs')
const { get } = require('./_api')

async function getVariant({ apiAuth, OutputDir, id }) {
  const json = await get(`/products/variant/${id}`, { auth: apiAuth })
  const data = json.result

  fs.writeFileSync(
    `${OutputDir}/data-printful/variant-${id}.json`,
    JSON.stringify(data, null, 2)
  )
  console.log(`Wrote variant ${id}`)
}

module.exports = getVariant
