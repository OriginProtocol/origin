const chalk = require('chalk')
const startGanache = require('./helpers/start-ganache')
const deployContracts = require('./helpers/deploy-contracts')
const startIpfs = require('./helpers/start-ipfs')
const debugOutput = require('./helpers/debug-output')

const args = process.argv.slice(2)
const noGanache = args.length && args[0] === 'no-ganache'

const start = async () => {
  if (!noGanache) {
    console.log(chalk`\n{bold.hex('#1a82ff') ⬢  Starting Local Blockchain }\n`)
    await startGanache()
  }
//  console.log(chalk`\n{bold.hex('#26d198') ⬢  Deploying Smart Contracts }\n`)
//  await deployContracts()
 // console.log(chalk`\n{bold.hex('#6e3bea') ⬢  Starting Local IPFS }\n`)
//  await startIpfs()

//  await debugOutput()
}

start()
