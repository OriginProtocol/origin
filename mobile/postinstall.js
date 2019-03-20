const { exec } = require('child_process')

exec('rm -rf node_modules/websocket/.git')
exec('npx install-local -S ../packages/contracts ../packages/origin-js')
exec('ln -s ../node_modules/scrypt node_modules/@origin/js/node_modules/scrypt')
exec('ln -s ../node_modules/got node_modules/@origin/js/node_modules/got')
