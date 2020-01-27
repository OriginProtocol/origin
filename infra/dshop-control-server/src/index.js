const axios = require('axios')
const express = require('express')
const cors = require('cors')
const tmp = require('tmp')
const bodyParser = require('body-parser')
const sharp = require('sharp')
const slugify = require('slugify')
const fs = require('fs')

const {
  getCollections: getShopifyCollections,
  getProducts: getShopifyProducts,
  convertCollectionUrlsToIds: convertShopifyCollectionUrlsToIds
} = require('./lib/shopify')
const {
  getDshopCollections,
  getDshopProducts,
  getDshopConfig
} = require('./lib/dshop')
const { linkDir } = require('./lib')

const app = express()

if (app.get('env') !== 'production') {
  app.use(
    cors({
      origin: '*',
      credentials: true
    })
  )
}

// Parse request bodies
app.use(bodyParser.json({ limit: '100mb' }))
app.use(bodyParser.urlencoded({ extended: true }))

app.get('/ingest/:url', async (req, res) => {
  const isShopify = req.query.datadir === undefined
  if (isShopify) {
    console.log('Fetching Shopify data for', req.params.url)

    // Disable eslint because can't destructure to different variable types,
    // i.e. let and const
    // eslint-disable-next-line
    let [collections, products] = await Promise.all([
      getShopifyCollections(req.params.url),
      getShopifyProducts(req.params.url)
    ])

    collections = collections.map(c =>
      convertShopifyCollectionUrlsToIds(c, products)
    )

    return res.json({
      collections,
      products
    })
  } else {
    console.log(
      'Fetching dShop data for',
      `${req.params.url}/${req.query.datadir}`
    )

    const [collections, products, config] = await Promise.all([
      getDshopCollections(req.params.url, req.query.datadir),
      getDshopProducts(req.params.url, req.query.datadir),
      getDshopConfig(req.params.url, req.query.datadir)
    ])

    return res.json({
      collections,
      products,
      config
    })
  }
})

app.post('/deploy', async (req, res) => {
  const tmpDir = tmp.dirSync()

  // Directory of products
  const products = []

  // Parse each product in the request, writing out images to the file system
  // and the JSON data
  for (const product of req.body.products) {
    product.id = slugify(product.title, '-')
      .toLowerCase()
      .replace(/[^a-zA-Z0-9-_]/g, '')

    const productPath = `${tmpDir.name}/${product.id}`
    const imgPath = `${productPath}/orig`
    const resizedImgPath = `${productPath}/520`

    if (fs.existsSync(productPath)) {
      continue
    }

    // Create necessary directories
    fs.mkdirSync(productPath)
    fs.mkdirSync(imgPath)
    fs.mkdirSync(resizedImgPath)

    const imageFileMap = {}

    // Write out all the images
    product.images = await Promise.all(
      product.images.map(async (imgUrl, index) => {
        let imgBuffer
        let imgFilename
        if (imgUrl.startsWith('data:')) {
          // Handle imgUrl URI
          const [type, uri] = imgUrl.split(';base64,')
          if (!uri) return imgUrl
          const [, format] = type.split('/')
          imgBuffer = Buffer.from(uri.toString(), 'base64')
          imgFilename = `img-${index}.${format}`
        } else {
          // Handle regular URI
          const filename = imgUrl
            .substring(imgUrl.lastIndexOf('/') + 1)
            .split(/[?#]/)[0]
          const format = filename.substring(filename.lastIndexOf('.') + 1)
          const response = await axios.get(imgUrl, {
            responseType: 'arraybuffer'
          })
          imgBuffer = response.data
          imgFilename = `img-${index}.${format}`
        }

        const imgLocation = `${imgPath}/${imgFilename}`
        fs.writeFileSync(imgLocation, imgBuffer)
        imageFileMap[imgUrl] = imgFilename

        // Resize img to 520 wide
        await sharp(imgBuffer)
          .resize(520)
          .toFile(`${resizedImgPath}/${imgFilename}`)
        // Replace default image if it is the currently processed image
        if (product.image === imgUrl) {
          product.image = imgFilename
        }
        return imgFilename
      })
    )

    // Replace the featured image with the filesystem path
    product.image = imageFileMap[product.image]

    // Replace the images for all the variants with the filesystem path
    product.variants = product.variants.map(variant => {
      return {
        ...variant,
        image: imageFileMap[variant.image]
      }
    })

    // Write the product JSON
    fs.writeFileSync(
      `${productPath}/data.json`,
      Buffer.from(JSON.stringify(product))
    )

    products.push({
      id: product.id,
      title: product.title,
      price: product.price,
      image: product.images.length > 0 ? product.images[0] : null
    })
  }

  req.body.collections.map(collection => {
    collection.id = slugify(collection.title).toLowerCase()
    collection.products = collection.products.map(
      // Convert from a bare index to the id of the product
      productIndex => req.body.products[productIndex].id
    )
    return collection
  })

  // Write product directory JSON
  fs.writeFileSync(
    `${tmpDir.name}/products.json`,
    Buffer.from(JSON.stringify(products))
  )
  // Write collections JSON
  fs.writeFileSync(
    `${tmpDir.name}/collections.json`,
    Buffer.from(JSON.stringify(req.body.collections))
  )
  // Write config file
  fs.writeFileSync(
    `${tmpDir.name}/config.json`,
    Buffer.from(JSON.stringify(req.body.settings))
  )

  // Write data dir to IPFS
  const hash = await linkDir(process.env.IPFS_ROOT_HASH, tmpDir.name, 'data')

  res.send(hash)
})

const port = process.env.PORT || 3000

app.listen(port, () => console.log(`Origin dShop server running on ${port}!`))
