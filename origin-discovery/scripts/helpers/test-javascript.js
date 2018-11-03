const { spawn } = require('child_process')

const testJavascript = () => {
  return new Promise((resolve, reject) => {
    const mocha = spawn('./node_modules/.bin/mocha', [
      '--timeout',
      '10000',
      '--exit'
    ])
    mocha.stdout.pipe(process.stdout)
    mocha.stderr.pipe(process.stderr)

    mocha.on('exit', code => {
      if (code !== 0) {
        return reject(new Error(`Exit code ${code}`))
      }
      resolve()
    })
  })
}

module.exports = testJavascript
