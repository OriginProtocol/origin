const fs = require('fs')
const sortBy = require('lodash/sortBy')

async function writeProductData({ OutputDir }) {
  const productsRaw = fs.readFileSync(`${OutputDir}/printful-products.json`)
  const products = JSON.parse(productsRaw).reverse()
  let productsOut = []
  const downloadImages = []
  const allImages = {}

  for (const row of products) {
    const syncProductRaw = fs.readFileSync(
      `${OutputDir}/data-printful/sync-product-${row.id}.json`
    )
    const syncProduct = JSON.parse(syncProductRaw)
    const productId = syncProduct.sync_variants[0].product.product_id

    const productRaw = fs.readFileSync(
      `${OutputDir}/data-printful/product-${productId}.json`
    )
    const product = JSON.parse(productRaw)

    let handle = syncProduct.sync_product.name
      .toLowerCase()
      .replace(/[^0-9a-z -]/g, '')
      .replace(/ +/g, '-')
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
    syncProduct.sync_variants.forEach((syncVariant, idx) => {
      const vId = syncVariant.product.variant_id
      const v = product.variants.find(v => v.id === vId)
      const color = v.color
      const size = v.size
      if (color && colors.indexOf(color) < 0) {
        colors.push(color)
      }
      if (size && sizes.indexOf(size) < 0) {
        sizes.push(size)
      }
      const img = syncVariant.files.find(f => f.type === 'preview')
      if (img) {
        if (allImages[img.preview_url] === undefined) {
          const splitImg = img.preview_url.split('/')
          const file = splitImg[splitImg.length - 1].replace('_preview', '')
          downloadImages.push({
            id: `${handle}`,
            file,
            url: img.preview_url
          })
          allImages[img.preview_url] = file
          images.push(file)
        }
        variantImages[idx] = allImages[img.preview_url]
      }
    })

    const options = []
    if (colors.length > 1) {
      options.push('Color')
    }
    if (sizes.length > 1) {
      options.push('Size')
    }

    const variants = syncProduct.sync_variants.map((variant, idx) => {
      const id = variant.product.variant_id
      const v = product.variants.find(v => v.id === id)
      const options = []
      if (colors.length > 1) {
        options.push(v.color)
      }
      if (sizes.length > 1) {
        options.push(v.size)
      }
      return {
        id,
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
      title: syncProduct.sync_product.name,
      description: product.product.description.replace(/\r\n/g, '<br/>'),
      price: Number(syncProduct.sync_variants[0].retail_price.replace('.', '')),
      available: true,
      options,
      images,
      image: images[0],
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

  // Keep original products.json order
  try {
    const existingProductsRaw = fs.readFileSync(
      `${OutputDir}/data/products.json`
    )
    const existingProductIds = JSON.parse(existingProductsRaw).map(p => p.id)

    if (existingProductIds.length) {
      productsOut = sortBy(productsOut, p => {
        const idx = existingProductIds.indexOf(p.id)
        return idx < 0 ? Infinity : idx
      })
    }
  } catch (e) {
    /* Ignore */
  }

  fs.writeFileSync(
    `${OutputDir}/data/products.json`,
    JSON.stringify(productsOut, null, 2)
  )

  let collections = []
  const collectionsPath = `${OutputDir}/data/collections.json`
  try {
    const existingCollections = JSON.parse(fs.readFileSync(collectionsPath))
    const productIds = productsOut.map(p => p.id)
    let productsInCollection = []
    collections = existingCollections.map(c => {
      const products = c.products.filter(p => productIds.indexOf(p) >= 0)
      productsInCollection = [...productsInCollection, ...c.products]
      return { ...c, products }
    })
    if (productsInCollection.length) {
      const newProductIds = productIds.filter(
        p => productsInCollection.indexOf(p) < 0
      )
      const other = collections.find(c => c.id === 'other')
      if (other) {
        other.products = [...other.products, ...newProductIds]
      } else if (newProductIds.length) {
        collections.push({
          id: 'other',
          title: 'Other',
          products: newProductIds
        })
      }
    }
  } catch (e) {
    collections = [
      {
        id: 'all',
        title: 'All',
        products: productsOut.map(p => p.id)
      }
    ]
  }

  fs.writeFileSync(collectionsPath, JSON.stringify(collections, null, 2))

  fs.writeFileSync(
    `${OutputDir}/printful-images.json`,
    JSON.stringify(downloadImages, null, 4)
  )
}

module.exports = writeProductData
