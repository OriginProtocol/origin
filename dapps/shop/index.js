import { spawn } from 'child_process'

import services from '@origin/services'
let localContractAddress
try {
  const Addresses = require(`@origin/contracts/build/contracts.json`)
  localContractAddress = Addresses.Marketplace_V01
} catch (e) {
  /* Ignore */
}

async function start() {
  let shuttingDown = false

  const shutdownAll = async () => {
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
  }

  process.on('SIGINT', shutdownAll)
  process.on('SIGTERM', shutdownAll)

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
    env: {
      ...process.env,
      MARKETPLACE_CONTRACT: localContractAddress,
      DATA_URL:
        process.env.DATA_URL || `http://0.0.0.0:8081/${process.env.DATA_DIR}/`
    }
  })
}

start()
