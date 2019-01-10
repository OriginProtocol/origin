const chalk = require('chalk')

const testSolidityFormat = require('./test-solidity-format')
const testContracts = require('./test-contracts')
const startGanache = require('./start-ganache')
const testTruffle = require('./test-truffle')

const start = async () => {
  try {
    console.log(chalk`\n{bold.hex('#c63197') ⬢  Testing Solidity Formatting }`)
    await testSolidityFormat()

    console.log(chalk`\n{bold.hex('#1a82ff') ⬢  Testing Smart Contracts }`)
    await testContracts()

    console.log(chalk`\n{bold.hex('#26d198') ⬢  Starting Local Blockchain }\n`)
    await startGanache()

    console.log(
      chalk`\n{bold.hex('#1a82ff') ⬢  Testing Smart Contracts using Truffle }\n`
    )
    await testTruffle()

    console.log(chalk`\n{bold ✅  Tests passed. :) }\n`)
    process.exit()
  } catch (error) {
    console.log(chalk`\n{bold ⚠️  Tests failed. :( }\n`)
    console.error(error)
    process.exit(1)
  }
}

start()
