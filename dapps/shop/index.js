import { spawn } from 'child_process'

import services from '@origin/services'

async function start() {
  let shuttingDown = false

  process.on('SIGINT', async () => {
    if (shuttingDown) return
    shuttingDown = true

    if (shutdown) {
      await shutdown()
    }
    if (webpackDevServer) {
      webpackDevServer.kill()
    }
    if (backend) {
      backend.kill()
    }
    console.log('Shut down ok.')
  })

  const shutdown = await services({
    ganache: true,
    deployContracts: true,
    ipfs: true,
    skipContractsIfExists: process.env.CLEAN ? false : true
  })

  const devServerArgs = ['--host=0.0.0.0']
  if (process.env.NODE_ENV === 'production') {
    devServerArgs.push('--info=false')
  }
  if (process.env.NOOPENER !== 'true') {
    devServerArgs.push('--open')
  }
  const webpackDevServer = spawn(
    './node_modules/.bin/webpack-dev-server',
    devServerArgs,
    {
      stdio: 'inherit',
      env: process.env
    }
  )
  const backend = spawn('node', ['backend'], {
    stdio: 'inherit',
    env: process.env
  })
}

start()
