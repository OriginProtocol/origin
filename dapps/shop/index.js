import { spawn } from 'child_process'

import services from '@origin/services'

async function start() {
  await services({
    ganache: true,
    deployContracts: true,
    ipfs: true,
    skipContractsIfExists: process.env.CLEAN ? false : true
  })

  const devServerArgs = ['--info=false', '--host=0.0.0.0', '--open']
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
  process.on('exit', () => {
    webpackDevServer.kill()
    backend.kill()
  })
}

start()
