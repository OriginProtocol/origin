const { spawn } = require('child_process')

const testJSFormat = () => {
  return new Promise((resolve, reject) => {
    const eslint = spawn(
      './node_modules/.bin/eslint',
      [
        'src/**/*.js',
        'test/**/*test.js',
        'contracts/test/**/*.js',
        'scripts/**/*.js'
      ],
      {
        stdio: 'inherit',
        env: process.env
      }
    )
    eslint.on('exit', code => {
      if (code === 0) {
        console.log('JS formatter inspection passed.')
        resolve()
      } else {
        console.log('JS formatter inspection failed.')
        reject()
      }
    })
  })
}

module.exports = testJSFormat
