const express = require('express')
const cors = require('cors')
const app = express()

app.use(cors({ origin: true, credentials: true }))

app.get('/', (req, res) => {
  res.send('')
})

require('./routes/auth')(app)
require('./routes/orders')(app)
require('./routes/stripe')(app)
require('./routes/discounts')(app)

const PORT = process.env.PORT || 3000
app.listen(PORT, () => {
  console.log(`\nListening on port ${PORT}\n`)
})
