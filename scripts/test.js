const chalk = require('chalk')
const testJavascript = require('./helpers/test-javascript')
const testFormat = require('./helpers/test-format')

const start = async () => {
  try {
    console.log(chalk`\n{bold.hex('#6e3bea') ⬢  Testing Formatting }\n`)
    await testFormat()
    console.log(chalk`\n{bold.hex('#1a82ff') ⬢  Testing Javascript }\n`)
    await testJavascript()
    console.log(chalk`\n{bold ✅  Tests passed. :) }\n`)
    process.exit()
  } catch (error) {
    console.log(chalk`\n{bold ⚠️  Tests failed. :( }\n`)
    console.error(error)
    process.exit(1)
  }
}

start()
