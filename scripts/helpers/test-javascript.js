const { spawn } = require('child_process')

const testJavascript = () => {
  return new Promise((resolve, reject) => {
    const mocha = spawn('./node_modules/.bin/mocha', ['--compilers', 'js:babel-core/register', '--require', 'babel-polyfill'])
    mocha.stdout.pipe(process.stdout)
    mocha.stderr.pipe(process.stderr)

    mocha.on('exit', code => {
      if (code !== 0) {
        return reject()
      }
      resolve()
    })
  })
}

module.exports = testJavascript
