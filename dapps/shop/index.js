import express from 'express'
import serveStatic from 'serve-static'
import { spawn } from 'child_process'
import opener from 'opener'

// import services from '@origin/services'

const sslProxy = process.env.SSL_PROXY ? true : false
const HOST = process.env.HOST || 'localhost'
const app = express()

app.use(serveStatic('public'))

async function start() {
  // await services({
  //   ganache: true,
  //   deployContracts: true,
  //   ipfs: true,
  //   populate: true,
  //   graphqlServer: process.env.PERFORMANCE ? true : false,
  //   skipContractsIfExists: process.env.CLEAN ? false : true,
  //   relayer: process.env.RELAYER ? true : false,
  //   sslProxy
  // })

  const devServerArgs = ['--info=false', '--port=8083', '--host=0.0.0.0']
  if (sslProxy) {
    devServerArgs.push('--https')
    devServerArgs.push('--key=../../packages/services/data/localhost.key')
    devServerArgs.push('--cert=../../packages/services/data/localhost.cert')
  }
  const webpackDevServer = spawn(
    './node_modules/.bin/webpack-dev-server',
    devServerArgs,
    {
      stdio: 'inherit',
      env: process.env
    }
  )
  process.on('exit', () => webpackDevServer.kill())

  const PORT = process.env.PORT || 3000
  app.listen(PORT, () => {
    console.log(`\nListening on port ${PORT}\n`)
    if (!process.env.NOOPENER) {
      setTimeout(() => opener(`http://${HOST}:${PORT}`), 2000)
    }
  })
}

start()
