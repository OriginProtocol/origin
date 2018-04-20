const { spawn } = require('child_process')

// Serve webpack dev server for browser testing
const startTestServer = () => {
  console.log('Serving origin.js tests from http://localhost:8081')
  const webpackDevServer = spawn('./node_modules/.bin/webpack-dev-server', ['--hot', '--config', 'test/webpack.config.js'])
  webpackDevServer.stderr.pipe(process.stderr)
}

module.exports = startTestServer
