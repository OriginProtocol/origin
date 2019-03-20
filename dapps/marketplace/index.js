import express from 'express'
import serveStatic from 'serve-static'
import { spawn } from 'child_process'
import opener from 'opener'
import fs from 'fs'

import services from '@origin/services'

const HOST = process.env.HOST || 'localhost'
const app = express()

app.get('/:net(mainnet|rinkeby|kovan|docker|origin|truffle)?', (req, res) => {
  let html = fs.readFileSync(__dirname + '/public/dev.html').toString()
  html = html.replace(/\{HOST\}/g, `http://${HOST}:8083/`)
  html = html.replace(/\{NET\}/g, req.params.net || 'localhost')
  res.send(html)
})

app.use(serveStatic('public'))

async function start() {
  await services({
    ganache:
      process.env.START_GANACHE !== undefined
        ? process.env.START_GANACHE
        : true,
    deployContracts:
      process.env.DEPLOY_CONTRACTS !== undefined
        ? process.env.DEPLOY_CONTRACTS
        : false,
    ipfs: process.env.START_IPFS !== undefined ? process.env.START_IPFS : true,
    populate:
      process.env.POPULATE_IPFS !== undefined ? process.env.POPULATE_IPFS : true
  })

  const webpackDevServer = spawn(
    './node_modules/.bin/webpack-dev-server',
    ['--info=false', '--port=8083', '--host=0.0.0.0'],
    {
      stdio: 'inherit',
      env: process.env
    }
  )
  process.on('exit', () => webpackDevServer.kill())

  const PORT = process.env.PORT || 3000
  app.listen(PORT, () => {
    console.log(`\nListening on port ${PORT}\n`)
    setTimeout(() => opener(`http://${HOST}:${PORT}`), 2000)
  })
}

start()
