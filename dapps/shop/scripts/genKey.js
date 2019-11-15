const openpgp = require('openpgp')
const fs = require('fs')

openpgp.config.show_comment = false
openpgp.config.show_version = false

async function generate(name, passphrase) {
  const key = await openpgp.generateKey({
    userIds: [{ name, email: `${name.toLowerCase()}@example.com` }],
    curve: 'ed25519',
    passphrase
  })
  fs.writeFileSync(`${__dirname}/../data/public-pgp.key`, key.publicKeyArmored)
  console.log('\nWrote public key.')
  console.log('Keep this private key safe:\n')
  console.log(key.privateKeyArmored)
  console.log(`Pass phrase: ${passphrase}\n`)
}

generate('nick', 'abc123')
