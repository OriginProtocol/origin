const esmImport = require('esm')(module)
const context = esmImport('@origin/graphql/src/contracts').default
const { setNetwork } = esmImport('@origin/graphql/src/contracts')
const ipfs = esmImport('@origin/ipfs')

const IPFS_GATEWAY = process.env.IPFS_GATEWAY || 'http://localhost:5002'
const TEST_LISTING_ID = process.env.LISTING_ID || 1

function createOfferJSON(netId, listingId, finalizes, offerValueEth) {
  return JSON.parse(`{
    "listingId": "${netId}-000-${listingId}",
    "listingType": "unit",
    "unitsPurchased": 1,
    "totalPrice": {
      "amount": "${offerValueEth}",
      "currency": "ETH"
    },
    "commission": {
      "amount": "0",
      "currency": "OGN"
    },
    "finalizes": ${finalizes},
    "schemaId": "http://schema.originprotocol.com/offer_v1.0.0"
  }`)
}

async function addOfferToIPFS(jason) {
  return await ipfs.post(IPFS_GATEWAY, jason)
}

async function main() {
  const web3 = context.web3
  const netId = await web3.eth.net.getId()

  if (netId < 100) {
    console.log(
      '!!!!!!!!!!!! DO NOT RUN THIS ON A PRODUCTION NETWORK !!!!!!!!!!!!'
    )
    process.exit(1)
  }

  const marketplace = context.marketplace
  const accounts = await web3.eth.getAccounts()
  const sender = process.env.ACCOUNT || accounts[0]
  const finalizes = new Date() / 1000 + 60 * 60 * 12 // 12 hours from now
  const offerValue = 2 * 1e18

  const offerObj = createOfferJSON(
    netId,
    TEST_LISTING_ID,
    finalizes,
    offerValue
  )
  const ipfsHash = await addOfferToIPFS(offerObj)

  const txHash = await marketplace.methods
    .makeOffer(
      TEST_LISTING_ID,
      ipfsHash,
      finalizes,
      '0x0',
      0,
      offerValue,
      '0x0',
      '0x0'
    )
    .send({
      from: sender,
      gas: 3e6,
      gasPrice: 1e9,
      value: offerValue
    })
  console.log('txHash: ', txHash.transactionHash)
}

// eslint-disable-next-line no-extra-semi
;(async function() {
  setNetwork(process.env.NETWORK || 'localhost')
  console.log('network: ', context.net)
  await main().then(() => {
    process.exit()
  })
})()
