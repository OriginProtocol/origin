const { spawn } = require('child_process')

const testJavascript = () => {
  return new Promise((resolve, reject) => {
    const mocha = spawn(
      './node_modules/.bin/mocha',
      [
        '-r',
        'babel-core/register',
        '-r',
        'babel-polyfill',
        '--timeout',
        '10000',
        '--exit'
      ],
      {
        stdio: 'inherit',
        env: process.env
      }
    )

    mocha.on('exit', code => {
      if (code !== 0) {
        return reject()
      }
      resolve()
    })
  })
}

module.exports = testJavascript
