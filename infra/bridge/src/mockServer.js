// A simple bridge mock server that can be used for integration tests.

const express = require('express')
const cors = require('cors')
const bodyParser = require('body-parser')

const app = express()
app.use(cors({ origin: true, credentials: true }))
app.use(bodyParser.json())
app.use(bodyParser.urlencoded({ extended: true }))

// In-memory storage.
const storage = {}

// Write identity route.
app.post('/api/identity', (req, res) => {
  const ethAddress = req.query.ethAddress.toLowerCase()
  const data = req.body || {}
  const ipfsData = data.ipfsData
  const ipfsHash = data.ipfsHash

  storage[ethAddress] = { ipfsData, ipfsHash }
  console.log('Wrote identity for', ethAddress)

  res.status(200).send({ ethAddress })
})

// Read identity route.
app.get('/api/identity', (req, res) => {
  const ethAddress = req.query.ethAddress.toLowerCase()
  const data = storage[ethAddress]
  if (!data) {
    console.log('No identity found for', ethAddress)
    return res.status(204).end()
  }

  console.log('Read identity for', ethAddress, data)
  return res.status(200).send({
    ethAddress,
    identity: data.ipfsData,
    ipfsHash: data.ipfsHash
  })
})

// Start the server.
app.listen(5000, () => console.log('Bridge mock server started on port 5000'))
