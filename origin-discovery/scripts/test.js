const chalk = require('chalk')
const testJavascript = require('./helpers/test-javascript')
const testJSFormat = require('./helpers/test-js-format')

const start = async () => {
  try {
    console.log(chalk`\n{bold.hex('#6e3bea') ⬢  Testing JS Formatting }\n`)
    await testJSFormat()
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
