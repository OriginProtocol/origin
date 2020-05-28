const fs = require('fs')
const fetch = require('node-fetch')

// Example cookie: '_csrf=0cfc5262c022ad00f7a06203095947325bda19c2f5e43e41a0adb0c36887c134a%3A2%3A%7Bi%3A0%3Bs%3A5%3A%22_csrf%22%3Bi%3A1%3Bs%3A32%3A%22GQnd1KiBQyp_2LToNQMZPSvtxjtn7ke6%22%3B%7D; _login=f8dd194ba6638a9de53374a412c22a2963cac23e4fec799e4f2ae7ed8a7c162ba%3A2%3A%7Bi%3A0%3Bs%3A6%3A%22_login%22%3Bi%3A1%3Bs%3A52%3A%22%5B1699989%2C%22zfZO3KBWvE82AILvetxdZrYsWa7aPrSF%22%2C2592000%5D%22%3B%7D'
// Example CSRF: 'FUoA6YcY49AmA8M7tPeK1TW0kxxZgoYY99_lv3mmEKRSG26NtlOKknd6s2SGu966e-XeRgnR8GyPtZHRTs11kg=='
async function writeInternalData({ OutputDir }) {
  const productsRaw = fs.readFileSync(`${OutputDir}/printful-products.json`)
  const products = JSON.parse(productsRaw)
  const authRaw = fs.readFileSync(`${OutputDir}/printful-auth.json`)
  const auth = JSON.parse(authRaw)
  for (const row of products) {
    const res = await fetch('https://www.printful.com/rpc/sync-rpc/variants', {
      headers: {
        'content-type': 'application/x-www-form-urlencoded',
        'x-csrf-token': auth.csrf,
        cookie: Object.keys(auth.cookie)
          .map(k => `${k}=${auth.cookie[k]}`)
          .join('; ')
      },
      body: `syncProductId=${row.id}&syncedOnly=0&currency=USD&currentPage=1`,
      method: 'POST'
    })
    const json = await res.json()
    fs.writeFileSync(
      `${OutputDir}/data-printful/product-${row.id}-internal.json`,
      JSON.stringify(json, null, 2)
    )
    console.log(`Wrote product ${row.id}`)
  }
}

module.exports = writeInternalData
