import express from 'express'
import serveStatic from 'serve-static'
import { spawn } from 'child_process'
import opener from 'opener'
import fs from 'fs'
import bodyParser from 'body-parser'

import services from '@origin/services'

const HOST = process.env.HOST || 'localhost'
const app = express()

app.use(bodyParser())

app.get('/', (req, res) => {
  const html = fs.readFileSync(__dirname + '/public/dev.html').toString()
  res.send(html.replace(/\{HOST\}/g, `http://${HOST}:8082/`))
})

app.use(serveStatic('public'))

async function start() {
  await services({
    ganache: true,
    ipfs: true,
    populate: true,
    deployContracts: true,
    skipContractsIfExists: true,
    writeTruffle: true
  })
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
