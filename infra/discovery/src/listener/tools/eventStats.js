// Tool for dumping stats about Marketplace and Identity events
// recorded on the blockchain.
// Can be used for validating data recorded in the DB by the listener
// does not have any holes.
//
// Usage: node tools/eventStats.js --network=mainnet
//

const countBy = require('lodash/countBy')
const esmImport = require('esm')(module)
const contractsContext = esmImport('@origin/graphql/src/contracts').default
const { setNetwork } = esmImport('@origin/graphql/src/contracts')

const args = {}
process.argv.forEach(arg => {
  const t = arg.split('=')
  const argVal = t.length > 1 ? t[1] : true
  args[t[0]] = argVal
})

const config = {
  // Possible values: origin, rinkeby, mainnet, ...
  network: args['--network'] || process.env.NETWORK || 'docker'
}

async function main() {
  // Load events from the blockchain.
  const marketplaceEvents = await contractsContext.marketplace.eventCache.allEvents()
  console.log(
    `Retrieved a total of ${marketplaceEvents.length} marketplace events`
  )
  const identityEvents = await contractsContext.identityEvents.eventCache.allEvents()
  console.log(`Retrieved a total of ${identityEvents.length} identity events`)

  // Count events, grouped by event name.
  const marketplaceCount = countBy(marketplaceEvents, 'event')
  const identityCount = countBy(identityEvents, 'event')

  // Dump stats.
  console.log('Marketplace events count by event name:')
  console.log(marketplaceCount)
  console.log('Identity events count by event name:')
  console.log(identityCount)
}

console.log(
  `Starting stats tool with config: ${JSON.stringify(
    config,
    (k, v) => (v === undefined ? null : v),
    2
  )}`
)

setNetwork(config.network)
main().then(() => {
  console.log('Done')
  process.exit(0)
})
