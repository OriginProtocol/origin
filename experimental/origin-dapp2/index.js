import express from 'express'
import serveStatic from 'serve-static'
import { spawn } from 'child_process'
import Ganache from 'ganache-core'
import HttpIPFS from 'ipfs/src/http'
import ipfsAPI from 'ipfs-api'
import opener from 'opener'
import fs from 'fs'
// import Web3 from 'web3'

// import simpleIssuer from './issuer-services/_simple'

const HOST = process.env.HOST || 'localhost'
const app = express()

app.get('/', (req, res) => {
  const html = fs.readFileSync(__dirname + '/public/dev.html').toString()
  res.send(html.replace(/\{HOST\}/g, `http://${HOST}:8083/`))
})
app.use(serveStatic('public'))

// try {
//   var { simpleApp } = require('./issuer-services/config.json')
//   simpleIssuer(app, { web3: new Web3(), simpleApp })
// } catch(e) {
//   /* Ignore */
// }

const startGanache = () =>
  new Promise((resolve, reject) => {
    try {
      fs.mkdirSync('./data/db')
    } catch (e) {
      /* Ignore */
    }
    const server = Ganache.server({
      total_accounts: 5,
      default_balance_ether: 100,
      db_path: 'data/db',
      network_id: 999,
      seed: 123
      // blockTime: 3
    })
    server.listen(8545, err => {
      if (err) {
        return reject(err)
      }
      console.log('Ganache listening. Starting webpack...')
      resolve()
    })
  })

const startIpfs = (opts = {}) =>
  new Promise((resolve, reject) => {
    const httpAPI = new HttpIPFS('./data/ipfs', {
      Addresses: {
        API: '/ip4/0.0.0.0/tcp/5002',
        Gateway: '/ip4/0.0.0.0/tcp/9090'
      }
    })
    console.log('Start IPFS')
    httpAPI.start(true, async err => {
      if (err) {
        return reject(err)
      }
      console.log('Started IPFS')

      if (opts.populate) {
        await populateIpfs()
      }
      resolve()
    })
  })

const populateIpfs = () =>
  new Promise((resolve, reject) => {
    const ipfs = ipfsAPI('localhost', '5002', { protocol: 'http' })
    console.log('Populate IPFS:')
    ipfs.util.addFromFs(
      '../../origin-js/test/fixtures',
      { recursive: true },
      (err, result) => {
        if (err) {
          return reject(err)
        }
        result.forEach(r => console.log(`  ${r.hash} ${r.path}`))
        resolve(result)
      }
    )
  })

async function start() {
  // await startGanache()
  // await startIpfs({ populate: true })
  const webpackDevServer = spawn('./node_modules/.bin/webpack-dev-server', [
    '--info=false',
    '--port=8083',
    '--host=0.0.0.0'
  ])
  webpackDevServer.stdout.pipe(process.stdout)
  webpackDevServer.stderr.pipe(process.stderr)
  process.on('exit', () => webpackDevServer.kill())

  const PORT = process.env.PORT || 3001
  app.listen(PORT, () => {
    console.log(`\nListening on port ${PORT}\n`)
    setTimeout(() => {
      opener(`http://${HOST}:${PORT}`)
    }, 2000)
  })
}

start()
