const { spawn } = require('child_process')

const testFormat = () => {
  return new Promise((resolve, reject) => {
    const eslint = spawn('./node_modules/.bin/eslint', [
      'src/**/*.js',
      'test/**/*test.js',
      'contracts/test/**/*.js',
      'scripts/**/*.js'
    ])
    eslint.stdout.on('data', data => {
      reject(`Code formatter inspection failed:\n${String(data)}`)
    })
    eslint.on('exit', code => {
      if (code === 0) {
        console.log('Code formatter inspection passed.')
      }
      resolve()
    })
  })
}

module.exports = testFormat
