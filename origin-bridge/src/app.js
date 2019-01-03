const express = require('express')
const app = express()

app.use(express.json())
app.use(require('./controllers'))

app.listen(5000, () => {
  console.log('Origin-bridge listening on port 5000...')
})
