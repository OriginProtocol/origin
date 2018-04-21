const { spawn } = require('child_process')

const testFormat = () => {
  return new Promise((resolve, reject) => {
    const prettier = spawn('./node_modules/.bin/prettier', ['--list-different', 'test/*.js', 'src/**.js', 'contracts/test/**.js'])
    prettier.stdout.on('data', data => {
      reject(`Code formatter inspection failed:\n${String(data)}`)
    })
    prettier.on('exit', code => {
      if (code === 0) {
        console.log('Code formatter inspection passed.')
      }
      resolve()
    })
  })
}

module.exports = testFormat
