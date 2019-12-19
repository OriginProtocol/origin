/**
 * Useful to test encryption is correctly setup on Heroku.
 * Run `heroku run bash` then `node` then paste the contents of this script.
 */

const config = require('./config')
const openpgp = require('openpgp')

async function start() {
  const msg = 'Testing 123'
  const siteConf = await config.getSiteConfig()

  console.log('Public key:')
  console.log(siteConf.pgpPublicKey)
  console.log('Private key:')
  console.log(process.env.PGP_PRIVATE_KEY)
  console.log('Private key pass:')
  console.log(process.env.PGP_PRIVATE_KEY_PASS)

  const pubKeyObj = await openpgp.key.readArmored(siteConf.pgpPublicKey)
  const encrypted = await openpgp.encrypt({
    message: openpgp.message.fromText(msg),
    publicKeys: pubKeyObj.keys
  })

  console.log('Encrypted')

  const privateKey = await openpgp.key.readArmored(process.env.PGP_PRIVATE_KEY)
  const privateKeyObj = privateKey.keys[0]
  await privateKeyObj.decrypt(process.env.PGP_PRIVATE_KEY_PASS)

  console.log('Decrypted Key OK')

  const message = await openpgp.message.readArmored(encrypted.data)
  const options = { message, privateKeys: [privateKeyObj] }

  const plaintext = await openpgp.decrypt(options)

  console.log('Decrypted Message OK')

  console.log(plaintext)
}

start()
