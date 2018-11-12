const chalk = require('chalk')
const { spawn } = require('child_process')
const deployContracts = require('./helpers/deploy-contracts')
const startIpfs = require('./helpers/start-ipfs')

const startGanache = require('./helpers/start-ganache')

const runTests = async watch => {
  return new Promise(() => {
    const args = ['-r', 'babel-register', '-r', 'babel-polyfill', '-t', '10000']
    if (watch) {
      args.push('--watch')
    } else {
      args.push('--exit')
    }
    args.push('test')
    console.log('running mocha with args:', args.join(' '))

    const contractTest = spawn('./node_modules/.bin/mocha', args, {
      stdio: 'inherit',
      env: process.env
    })
    contractTest.on('exit', code => {
      if (code === 0) {
        console.log(chalk`\n{bold ✅  JavaScript tests passed. :) }\n`)
        process.exit(0)
      } else {
        console.log(chalk`\n{bold ⚠️  JavaScript tests failed. :( }\n`)
        process.exit(1)
      }
    })
  })
}

const start = async () => {
  console.log(chalk`\n{bold.hex('#26d198') ⬢  Starting Local Blockchain }\n`)
  await startGanache()
  console.log(chalk`\n{bold.hex('#1a82ff') ⬢  Starting Local IPFS }\n`)
  await startIpfs()
  console.log(chalk`\n{bold.hex('#6e3bea') ⬢  Deploying Smart Contracts }\n`)
  await deployContracts()

  const watch = process.argv[2] && process.argv[2] == '--watch'
  await runTests(watch)
}

start()
