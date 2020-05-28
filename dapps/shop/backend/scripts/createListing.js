const { Network } = require('../models')
const createListing = require('../utils/createListing')

const pk = '0xAE6AE8E5CCBFB04590405997EE2D52D2B330726137B875053C36D94E974D162F'

async function go() {
  const network = await Network.findOne({ where: { networkId: '999' } })
  const listingId = await createListing({ network, pk, title: 'Test Shop' })
  console.log(`Created listing ${listingId}`)
}

go()
