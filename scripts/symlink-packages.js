// Symlinks packages for origin-js that don't play nicely with lerna --hoist

const { exec } = require('child_process')

exec('ln -s ../../node_modules/scrypt origin-js/node_modules/scrypt')
exec('ln -s ../../node_modules/got origin-js/node_modules/got')

