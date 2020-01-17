const fs = require('fs')

async function writeProductData({ OutputDir }) {
  const productsRaw = fs.readFileSync(`${OutputDir}/printful-products.json`)
  const products = JSON.parse(productsRaw)
  const productsOut = []
  const downloadImages = []
  for (const row of products) {
    const productRaw = fs.readFileSync(
      `${OutputDir}/data-printful/product-${row.id}.json`
    )
    const product = JSON.parse(productRaw)
    const firstVariantId = product.sync_variants[0].product.variant_id
    const variantRaw = fs.readFileSync(
      `${OutputDir}/data-printful/variant-${firstVariantId}.json`
    )
    const variant = JSON.parse(variantRaw)

    let handle = product.sync_product.name
      .toLowerCase()
      .replace(/[^0-9a-z]/g, '-')
      .replace(/^-+/, '')
      .replace(/--+/g, '-')
    const origHandle = handle

    for (let n = 1; productsOut.find(p => p.id === handle); n++) {
      handle = `${origHandle}-${n}`
    }

    const img = product.sync_variants[0].files.find(f => f.type === 'preview')
      .preview_url

    downloadImages.push({ id: `${handle}`, file: `img-0.png`, url: img })

    const out = {
      id: handle,
      title: product.sync_product.name,
      description: variant.product.description.replace(/\r\n/g, '<br/>'),
      price: Number(product.sync_variants[0].retail_price.replace('.', '')),
      available: true,
      options: ['Color', 'Size'],
      images: ['img-0.png'],
      image: 'img-0.png',
      variants: product.sync_variants.map((variant, idx) => {
        const optionsRaw = variant.product.name.match(/\((.*)\)/)
        let options = []
        if (optionsRaw && optionsRaw.length) {
          options = optionsRaw[1].split(' / ')
        }
        return {
          id: idx,
          title: variant.name,
          option1: options[0] || null,
          option2: options[1] || null,
          option3: null,
          image: 'img-0.png',
          available: true,
          name: variant.name,
          options: [options[0], options[1]],
          price: Number(variant.retail_price.replace('.', ''))
        }
      })
    }

    productsOut.push({
      id: out.id,
      title: out.title,
      price: out.price,
      image: out.image
    })

    fs.mkdirSync(`${OutputDir}/data/${handle}`, { recursive: true })
    fs.writeFileSync(
      `${OutputDir}/data/${handle}/data.json`,
      JSON.stringify(out, null, 2)
    )
  }
  if (!fs.existsSync(`${OutputDir}/data/products.json`)) {
    fs.writeFileSync(
      `${OutputDir}/data/products.json`,
      JSON.stringify(productsOut, null, 2)
    )
  }
  if (!fs.existsSync(`${OutputDir}/data/collections.json`)) {
    const collections = [
      {
        id: 'all',
        title: 'All',
        products: productsOut.map(p => p.id)
      }
    ]
    fs.writeFileSync(
      `${OutputDir}/data/collections.json`,
      JSON.stringify(collections, null, 2)
    )
  }
  fs.writeFileSync(
    `${OutputDir}/printful-images.json`,
    JSON.stringify(downloadImages, null, 4)
  )
}

module.exports = writeProductData
