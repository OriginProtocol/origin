const fetch = require('node-fetch')
const fs = require('fs')
const express = require('express')
const session = require('express-session')
const SequelizeStore = require('connect-session-sequelize')(session.Store)
const cors = require('cors')
const bodyParser = require('body-parser')
const serveStatic = require('serve-static')
const { IS_PROD } = require('./utils/const')
const { findShopByHostname } = require('./utils/shop')
const { sequelize } = require('./models')
const encConf = require('./utils/encryptedConfig')
const app = express()

require('./queues').runProcessors()

const ORIGIN_WHITELIST_ENABLED = false
const ORIGIN_WHITELIST = []
const BODYPARSER_EXCLUDES = ['/webhook']

// TODO: Restrict this more? See: https://expressjs.com/en/guide/behind-proxies.html
app.set('trust proxy', true)

const sessionStore = new SequelizeStore({ db: sequelize })

app.use(
  cors({
    origin: (origin, cb) => {
      if (ORIGIN_WHITELIST_ENABLED && !ORIGIN_WHITELIST.includes(origin)) {
        cb(new Error('Not allowed by CORS'))
      }
      // if (!origin) console.debug('No Origin header provided')
      cb(null, origin || '*')
    },
    credentials: true
  })
)

app.use(
  session({
    secret: 'keyboard cat', // TODO
    resave: true,
    saveUninitialized: false,
    cookie: {
      secure: IS_PROD
    },
    store: sessionStore
  })
)

// Custom middleware to exclude some specific endpoints from the JSON bodyParser
const jsonBodyParser = bodyParser.json()
app.use((req, res, next) => {
  if (BODYPARSER_EXCLUDES.includes(req.originalUrl)) return next()
  return jsonBodyParser(req, res, next)
})

// Error handler (needs 4 arg signature apparently)
// eslint-disable-next-line no-unused-vars
app.use((err, req, res, next) => {
  console.trace(err)
  return res.status(err.status || 500).json({
    error: {
      name: err.name,
      message: err.message,
      text: err.toString()
    }
  })
})

require('./routes/networks')(app)
require('./routes/auth')(app)
require('./routes/shops')(app)
require('./routes/affiliate')(app)
require('./routes/uphold')(app)
require('./routes/orders')(app)
require('./routes/printful')(app)
require('./routes/stripe')(app)
require('./routes/discounts')(app)
require('./routes/tx')(app)
require('./queues/ui.js')(app)

app.get(
  '(/collections/:collection)?/products/:product',
  findShopByHostname,
  async (req, res) => {
    if (!res.shop) {
      return res.send('')
    }
    let html
    try {
      html = fs.readFileSync(`${__dirname}/public/index.html`).toString()
    } catch (e) {
      return res.send('')
    }

    const dataUrl = await encConf.get(req.shop.id, 'dataUrl')

    const url = `${dataUrl}${req.params.product}/data.json`
    const dataRaw = await fetch(url)

    if (dataRaw.ok) {
      const data = await dataRaw.json()
      let modifiedHtml = html
      if (data.title) {
        modifiedHtml = modifiedHtml.replace(
          /<title>.*<\/title>/,
          `<title>${data.title}</title>`
        )
      }
      if (data.head) {
        modifiedHtml = modifiedHtml
          .replace('</head>', data.head.join('\n') + '\n</head>')
          .replace('DATA_URL', dataUrl)
      }
      res.send(modifiedHtml)
    } else {
      res.send(html)
    }
  }
)

app.use(serveStatic(`${__dirname}/dist`, { index: false }))
app.get('/', (req, res) => {
  let html
  try {
    html = fs.readFileSync(`${__dirname}/dist/index.html`).toString()
  } catch (e) {
    return res.send('')
  }
  html = html.replace('DATA_DIR', '').replace('TITLE', 'Origin Dshop')
  res.send(html)
})

app.get('*', (req, res, next) => {
  serveStatic(`${__dirname}/public/${req.hostname}`)(req, res, next)
})

const PORT = process.env.PORT || 3000
app.listen(PORT, () => {
  console.log(`\nListening on port ${PORT}\n`)
})
