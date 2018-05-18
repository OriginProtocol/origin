const chalk = require('chalk');
const startGanache = require('./helpers/start-ganache')
const deployContracts = require('./helpers/deploy-contracts')
const testContracts = require('./helpers/test-contracts')
const startIpfs = require('./helpers/start-ipfs')
const testJavascript = require('./helpers/test-javascript')
const testFormat = require('./helpers/test-format')

const start = async () => {
  try {
    console.log(chalk`\n{bold.hex('#6e3bea') ⬢  Testing Formatting }\n`);
    await testFormat()
    console.log(chalk`\n{bold.hex('#26d198') ⬢  Starting Local Blockchain }\n`);
    await startGanache()
    console.log(chalk`\n{bold.hex('#1a82ff') ⬢  Testing Smart Contracts }\n`);
    await testContracts()
    console.log(chalk`\n{bold.hex('#6e3bea') ⬢  Deploying Smart Contracts }\n`);
    await deployContracts()
    console.log(chalk`\n{bold.hex('#26d198') ⬢  Starting Local IPFS }\n`);
    await startIpfs()
    console.log(chalk`\n{bold.hex('#1a82ff') ⬢  Testing Javascript }\n`);
    await testJavascript()
    console.log(chalk`\n{bold ✅  Tests passed. :) }\n`);
    process.exit()
  }
  catch(error) {
    console.log(chalk`\n{bold ⚠️  Tests failed. :( }\n`);
    console.error(error)
    process.exit(1)
  }
}

start()
