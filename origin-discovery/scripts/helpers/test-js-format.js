const { spawn } = require('child_process')

const testJSFormat = () => {
  return new Promise((resolve, reject) => {
    const eslint = spawn('./node_modules/.bin/eslint', [
      'src/*/*.js',
      'test/**/*test.js',
      'scripts/**/*.js'
    ])
    eslint.stdout.on('data', data => {
      reject(new Error(`JS formatter inspection failed:\n${String(data)}`))
    })
    eslint.stderr.on('data', data => {
      reject(new Error(`JS formatter inspection FAILED:\n${String(data)}`))
    })
    eslint.on('exit', code => {
      if (code === 0) {
        console.log('JS formatter inspection passed.')
      } else {
        reject(new Error(`JS Formatter inspection failed with exit code ${code}`))
      }
      resolve()
    })
  })
}

module.exports = testJSFormat
