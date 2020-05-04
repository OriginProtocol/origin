const fs = require('fs')
const sortBy = require('lodash/sortBy')
const get = require('lodash/get')

async function writeProductData({ OutputDir, png }) {
  const productsRaw = fs.readFileSync(`${OutputDir}/printful-products.json`)
  const products = JSON.parse(productsRaw).reverse()
  let customImages = {}
  try {
    const customImagesRaw = fs.readFileSync(`${OutputDir}/custom-images.json`)
    customImages = JSON.parse(customImagesRaw)
  } catch (e) {
    /* Ignore */
  }

  let existingProducts = []
  try {
    const existingProductsRaw = fs.readFileSync(
      `${OutputDir}/data/products.json`
    )
    existingProducts = JSON.parse(existingProductsRaw)
  } catch (e) {
    /* Ignore */
  }
  let productsOut = existingProducts.filter(p => p.keep)
  const downloadImages = []
  const allImages = {}
  const printfulIds = {}

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
    const externalId = syncProduct.sync_product.id

    const existingProduct = existingProducts.find(
      p => p.externalId === externalId
    )

    let handle
    if (existingProduct) {
      handle = existingProduct.id
    } else {
      handle = syncProduct.sync_product.name
        .toLowerCase()
        .replace(/[^0-9a-z -]/g, '')
        .replace(/ +/g, '-')
        .replace(/--+/g, '-')
        .replace(/^-+/, '')
        .replace(/-$/, '')
      const origHandle = handle

      for (let n = 1; productsOut.find(p => p.id === handle); n++) {
        handle = `${origHandle}-${n}`
      }
    }

    const colors = [],
      sizes = [],
      images = get(customImages, `[${handle}].images`, []),
      variantImages = {},
      printfulSyncIds = {}
    syncProduct.sync_variants.forEach((syncVariant, idx) => {
      const vId = syncVariant.product.variant_id
      printfulSyncIds[vId] = syncVariant.id
      const v = product.variants.find(v => v.id === vId)
      if (!v) {
        console.log(`Could not find variant ${vId} on product ${row.id}`)
        return
      }
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
          const url = img.preview_url
          downloadImages.push({ id: `${handle}`, file, url })
          const fileWithExt = png ? file : file.replace('.png', '.jpg')
          allImages[img.preview_url] = fileWithExt
          images.push(fileWithExt)
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
        externalId: variant.id,
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

    printfulIds[handle] = printfulSyncIds

    const out = {
      id: handle,
      externalId,
      title: syncProduct.sync_product.name,
      description: product.product.description.replace(/\r\n/g, '<br/>'),
      price: Number(syncProduct.sync_variants[0].retail_price.replace('.', '')),
      available: true,
      options,
      images,
      image: images[0],
      variants,
      sizeGuide: product.sizeGuide
    }

    productsOut.push({
      id: out.id,
      externalId: out.externalId,
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
  const existingProductSlugs = existingProducts.map(p => p.id)
  const existingProductExternalIds = existingProducts
    .map(p => p.externalId)
    .filter(i => i)

  if (existingProductSlugs.length) {
    productsOut = sortBy(productsOut, p => {
      let idx
      if (p.externalId && existingProductExternalIds.length) {
        idx = existingProductExternalIds.indexOf(p.externalId)
      } else {
        idx = existingProductSlugs.indexOf(p.id)
      }
      return idx < 0 ? Infinity : idx
    })
  }

  fs.writeFileSync(
    `${OutputDir}/data/products.json`,
    JSON.stringify(productsOut, null, 2)
  )

  fs.writeFileSync(
    `${OutputDir}/data/printful-ids.json`,
    JSON.stringify(printfulIds, null, 2)
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
