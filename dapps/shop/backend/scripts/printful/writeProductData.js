const fs = require('fs')

function getVariant({ OutputDir, id }) {
  const variantRaw = fs.readFileSync(
    `${OutputDir}/data-printful/variant-${id}.json`
  )
  return JSON.parse(variantRaw)
}

async function writeProductData({ OutputDir }) {
  const productsRaw = fs.readFileSync(`${OutputDir}/printful-products.json`)
  const products = JSON.parse(productsRaw)
  const productsOut = []
  const downloadImages = []
  const allImages = {}
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

    const colors = [],
      sizes = [],
      images = [],
      variantImages = {}
    product.sync_variants.forEach((variant, idx) => {
      const v = getVariant({ OutputDir, id: variant.product.variant_id })
      const color = v.variant.color
      const size = v.variant.size
      if (color && colors.indexOf(color) < 0) {
        colors.push(color)
      }
      if (size && sizes.indexOf(size) < 0) {
        sizes.push(size)
      }
      const img = variant.files.find(f => f.type === 'preview')
      if (allImages[img.preview_url] === undefined) {
        downloadImages.push({
          id: `${handle}`,
          file: `img-${images.length}.png`,
          url: img.preview_url
        })
        allImages[img.preview_url] = `img-${images.length}.png`
        images.push(`img-${images.length}.png`)
      }
      variantImages[idx] = allImages[img.preview_url]
    })

    const options = []
    if (colors.length > 1) {
      options.push('Color')
    }
    if (sizes.length > 1) {
      options.push('Size')
    }

    const variants = product.sync_variants.map((variant, idx) => {
      const v = getVariant({ OutputDir, id: variant.product.variant_id })
      const options = []
      if (colors.length > 1) {
        options.push(v.variant.color)
      }
      if (sizes.length > 1) {
        options.push(v.variant.size)
      }
      return {
        id: idx,
        title: variant.name,
        option1: options[0] || null,
        option2: options[1] || null,
        option3: null,
        image: variantImages[idx],
        available: true,
        name: variant.name,
        options,
        price: Number(variant.retail_price.replace('.', ''))
      }
    })

    const out = {
      id: handle,
      title: product.sync_product.name,
      description: variant.product.description.replace(/\r\n/g, '<br/>'),
      price: Number(product.sync_variants[0].retail_price.replace('.', '')),
      available: true,
      options,
      images: images.map((img, idx) => `img-${idx}.png`),
      image: 'img-0.png',
      variants
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
