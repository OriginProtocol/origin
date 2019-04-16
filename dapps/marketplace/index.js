import express from 'express'
import serveStatic from 'serve-static'
import { spawn } from 'child_process'
import opener from 'opener'
import fs from 'fs'

import services from '@origin/services'

const HOST = process.env.HOST || 'localhost'
const app = express()

app.get('/:net([a-z]+)?', (req, res) => {
  const config = req.params.net || 'localhost'
  let html = fs.readFileSync(__dirname + '/public/dev.html').toString()
  html = html.replace(/\{HOST\}/g, `http://${HOST}:8083/`)
  html = html.replace(/\{NET\}/g, config)
  html = html.replace(/\{MM_ENABLED\}/g, config === 'test' ? 'false' : 'true')
  res.send(html)
})

app.use(serveStatic('public'))

async function start() {
  await services({
    ganache: true,
    deployContracts: true,
    ipfs: true,
    populate: true,
    skipContractsIfExists: process.env.CLEAN ? false : true,
    writeTruffle: true
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
