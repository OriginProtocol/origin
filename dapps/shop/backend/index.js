// const cp = require('child_process')

require('./app')
require('./listener')
if (process.env.PGP_PRIVATE_KEY) require('./tstEnc')

// const stripeCli = cp.spawn(
//   'stripe',
//   ['listen', '--forward-to', 'localhost:3000/webhook'],
//   {
//     env: process.env
//   }
// )

// stripeCli.stdout.on('data', data => {
//   console.log(`stripe: ${data}`)
// })

// stripeCli.stderr.on('data', data => {
//   console.log(`stripe: ${data}`)
//   const secret =
//   if (data.match())
// })

// process.on('exit', () => stripeCli.kill())
