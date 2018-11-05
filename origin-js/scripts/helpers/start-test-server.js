const { spawn } = require('child_process')

// Serve webpack dev server for browser testing
const startTestServer = () => {
  console.log('Serving origin.js tests from http://localhost:8081')
  spawn(
    './node_modules/.bin/webpack-dev-server',
    ['--hot', '--config', 'test/webpack.config.js', '--host', '0.0.0.0'],
    {
      stdio: 'inherit',
      env: process.env
    }
  )
}

module.exports = startTestServer
