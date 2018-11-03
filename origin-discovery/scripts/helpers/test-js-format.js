const { spawn } = require('child_process')

const testJSFormat = () => {
  return new Promise((resolve, reject) => {
    const eslint = spawn('./node_modules/.bin/eslint', [
      'src/**/*.js',
      'test/**/*test.js',
      'scripts/**/*.js'
    ])
    eslint.stdout.on('data', data => {
      reject(`JS formatter inspection failed:\n${String(data)}`)
    })
    eslint.on('exit', code => {
      if (code === 0) {
        console.log('JS formatter inspection passed.')
      }
      resolve()
    })
  })
}

module.exports = testJSFormat
