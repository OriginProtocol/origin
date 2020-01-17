const fs = require('fs')
const fetch = require('node-fetch')

async function getVariant({ PrintfulURL, apiAuth, OutputDir, id }) {
  const res = await fetch(`${PrintfulURL}/products/variant/${id}`, {
    headers: {
      'content-type': 'application/json',
      authorization: `Basic ${apiAuth}`
    },
    method: 'GET'
  })
  const json = await res.json()
  const data = json.result

  fs.writeFileSync(
    `${OutputDir}/data-printful/variant-${id}.json`,
    JSON.stringify(data, null, 2)
  )
  console.log(`Wrote variant ${id}`)
}

module.exports = getVariant
