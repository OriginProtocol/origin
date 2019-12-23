const openpgp = require('openpgp')

openpgp.config.show_comment = false
openpgp.config.show_version = false

async function generate(name, passphrase) {
  const key = await openpgp.generateKey({
    userIds: [{ name, email: `${name.toLowerCase()}@example.com` }],
    curve: 'ed25519',
    passphrase
  })
  console.log(`Pass phrase: ${passphrase}\n`)
  console.log('Public key:')
  console.log(key.publicKeyArmored)
  console.log('\nPrivate key:')
  console.log(key.privateKeyArmored)

  console.log('Public key:')
  console.log(JSON.stringify(key.publicKeyArmored).replace(/\\r/g, ''))
  console.log('\nPrivate key:')
  console.log(JSON.stringify(key.privateKeyArmored).replace(/\\r/g, ''))
}

generate('test', 'abc123')
