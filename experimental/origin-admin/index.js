import express from 'express'
import serveStatic from 'serve-static'
import { spawn } from 'child_process'
import opener from 'opener'
import fs from 'fs'
import bodyParser from 'body-parser'

import services from 'origin-services'

const HOST = process.env.HOST || 'localhost'
const app = express()

app.use(bodyParser())

app.get('/', (req, res) => {
  const html = fs.readFileSync(__dirname + '/public/dev.html').toString()
  res.send(html.replace(/\{HOST\}/g, `http://${HOST}:8082/`))
})

app.post('/update-truffle', (req, res) => {
  try {
    if (req.body.marketplace) {
      writeContractNetwork('V00_Marketplace', req.body.marketplace)
    }
    if (req.body.token) {
      writeContractNetwork('OriginToken', req.body.token)
    }
    res.send({ success: true })
  } catch (e) {
    console.log(e)
    res.send({ success: false })
  }
})

app.use(serveStatic('public'))

async function start() {
  await services({ ganache: true, ipfs: true, populate: true })
  const webpackDevServer = spawn(
    './node_modules/.bin/webpack-dev-server',
    ['--info=false', '--port=8082', '--host=0.0.0.0'],
    { stdio: 'inherit' }
  )
  process.on('exit', () => webpackDevServer.kill())

  const PORT = process.env.PORT || 3001
  app.listen(PORT, () => {
    console.log(`\nListening on port ${PORT}\n`)
    setTimeout(() => opener(`http://${HOST}:${PORT}`), 2000)
  })
}

start()

const contractsPath = `${__dirname}/../../origin-contracts/build/contracts/`
function writeContractNetwork(contractName, address) {
  const path = `${contractsPath}/${contractName}.json`
  const contractRaw = fs.readFileSync(path)
  const contract = JSON.parse(contractRaw)
  const addr = address.toLowerCase()
  contract.networks = contract.networks || {}
  contract.networks['999'] = contract.networks['999'] || {}
  if (contract.networks['999'].address !== addr) {
    contract.networks['999'].address = addr
    const output = JSON.stringify(contract, null, 4)
    fs.writeFileSync(path, output)
    console.log(`Set ${contractName} address to ${addr}`)
  } else {
    console.log(`${contractName} address is already ${addr}`)
  }
}
