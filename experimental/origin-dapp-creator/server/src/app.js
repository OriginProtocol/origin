const express = require('express')
const cors = require('cors')
const bodyParser = require('body-parser')
const Web3 = require('web3')
const web3 = new Web3()

const app = express()
const port = process.env.PORT || 4321

app.use(bodyParser.json())
app.use(bodyParser.urlencoded({ extended: true }))
app.use(cors())

app.post('/config', (req, res) => {
  const { config, signature, address } = req.body

  // Validate signature
  const signer = web3.eth.accounts.recover(JSON.stringify(config), signature)
  // Address from recover is checksummed so lower case it
  if (signer.toLowerCase() !== address) {
    res.status(400).send('Invalid signature')
    return
  }

  // Retrieve DNS settings

  res.send('Upload complete')
})

app.listen(port, () => console.log(`Listening on port ${port}`))
