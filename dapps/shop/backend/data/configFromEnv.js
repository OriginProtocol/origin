const program = require('commander')
const enc = require('../utils/encryptedConfig')

async function main() {
  program
    .option('-s, --shop-id <id>', 'shop ID to configure (default: 1)', '1')
    .requiredOption('-e, --env <file>', '.env file to use')
  program.parse(process.argv)

  console.log(`shopId: ${program.shopId}`)
  console.log(`env file: ${program.env}`)

  const { shopId, env } = program

  const existing = await enc.load(shopId)

  if (existing) {
    console.error('config exists')
    process.exit(1)
  }

  await enc.loadFromEnv(shopId, env)
}

if (require.main === module) {
  main()
    .then(() => {
      process.exit()
    })
    .catch(err => {
      console.error(err)
      process.exit(1)
    })
}
