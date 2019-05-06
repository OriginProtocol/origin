/**
 * Sanity checker to verify all past events are in the database
 *
 * Blame: Mike Shultz
 */
const esmImport = require('esm')(module)
const contractsContext = esmImport('@origin/graphql/src/contracts').default
const { setNetwork } = esmImport('@origin/graphql/src/contracts')

const log = require('../logger')
const { validateIdentities } = require('./consistency/ident')
const { validateListings } = require('./consistency/listing')
const { validateOffers } = require('./consistency/offer')

const args = {}
process.argv.forEach(arg => {
  const t = arg.split('=')
  const argVal = t.length > 1 ? t[1] : true
  args[t[0]] = argVal
})

const config = {
  // Possible values: origin, rinkeby, mainnet, ...
  network: args['--network'] || process.env.NETWORK || 'docker',
  identity: args['--identity'] || false,
  listings: args['--listings'] || false,
  offers: args['--offers'] || false,
  ipfsGateway: args['--ipfs-gateway'] || 'https://ipfs.originprotocol.com',
  fromBlock: args['--from-block'] || 0
}

async function main() {
  let commands = 0

  log.info(`Performing consistency check on network ${config.network}`)
  if (config.identity) {
    commands += 1
    log.info('Validating Identities...')
    try {
      await validateIdentities({
        contractsContext,
        ...config
      })
    } catch (err) {
      log.error('Unable to verify identities due to an unhandled error!')
      log.error(err)
    }
  }

  if (config.listings) {
    commands += 1
    log.info('Validating Listings...')
    await validateListings({
      contractsContext,
      ...config
    })
  }

  if (config.offers) {
    commands += 1
    log.info('Validating Offers...')
    await validateOffers({
      contractsContext,
      ...config
    })
  }
  return commands
}

setNetwork(config.network)
main().then(res => {
  log.info(`Fin. ${res} checks run.`)
  process.exit()
})
