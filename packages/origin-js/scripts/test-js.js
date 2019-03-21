const chalk = require('chalk')
const { spawn } = require('child_process')
const deployContracts = require('./helpers/deploy-contracts')
const startIpfs = require('./helpers/start-ipfs')

const startGanache = require('./helpers/start-ganache')

const runTests = async cmdLineArgs => {
  return new Promise(() => {
    const args = [
      '-r', '@babel/register',
      '-r', '@babel/polyfill',
      '-t', '10000'].concat(cmdLineArgs)
    if (!cmdLineArgs.includes('--watch')) {
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

  // Pass to runTests any argument specified on the command line
  // except argv[0] = <path>/node and argv[1] = <path>/test-js.js
  await runTests(process.argv.slice(2))
}

start()
