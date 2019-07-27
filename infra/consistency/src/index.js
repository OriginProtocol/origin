#!/usr/bin/env node
/**
 * Sanity checker to verify all past events are in the database
 *
 * Blame: Mike Shultz
 */
const esmImport = require('esm')(module)
const contractsContext = esmImport('@origin/graphql/src/contracts').default
const { setNetwork } = esmImport('@origin/graphql/src/contracts')

const { log } = require('./logger')
const { validateIdentities } = require('./validators/ident')
const { validateListings } = require('./validators/listing')
const { validateOffers } = require('./validators/offer')

async function main(config) {
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

if (require.main === module) {
  const args = {}
  process.argv.forEach(arg => {
    const t = arg.split('=')
    const argVal = t.length > 1 ? t[1] : true
    args[t[0]] = argVal
  })

  if (args['--help'] || args['help']) {
    console.log('Usage')
    console.log('-----')
    console.log('origin-check --network=[network] [--identity] [--listings] [--offers] [--ipfs-gateway=[gateway_url]] [--from-block=[block_number]]')
    console.log('')
    process.exit(0)
  }

  const config = {
    // Possible values: origin, rinkeby, mainnet, ...
    network: args['--network'] || process.env.NETWORK || 'docker',
    identity: args['--identity'] || false,
    listings: args['--listings'] || false,
    offers: args['--offers'] || false,
    ipfsGateway: args['--ipfs-gateway'] || 'https://ipfs.originprotocol.com',
    fromBlock: args['--from-block'] || 0
  }

  log.debug('config: ', config)

  setNetwork(config.network, { useCustomProvider: true })
  main(config).then(res => {
    log.info(`Fin. ${res} checks run.`)
    process.exit()
  }).catch(err => {
    log.error('Unhandled error in main()')
    log.critical(err)
  })
}
