var ListingsRegistry = artifacts.require("./ListingsRegistry.sol");
var UnitListing = artifacts.require("./UnitListing.sol");
var Purchase = artifacts.require("./Purchase.sol");

module.exports = function(deployer, network) {
  return deployer.then(() => {
    return deploy_sample_contracts(network)
  })
}

async function deploy_sample_contracts(network) {
  let accounts = await new Promise((resolve, reject) => {
    web3.eth.getAccounts((error, result) => {
      if (error) {
        reject(err)
      }
      resolve(result)
    })
  })

  const default_account = accounts[0]
  const a_seller_account = accounts[1]
  const a_buyer_account = accounts[2]
  const another_buyer_account = accounts[3]

  const listingsRegistry = await ListingsRegistry.deployed()

  const getListingContract = async transaction => {
    const index = transaction.logs.find(x => x.event == "NewListing").args._index
    const address = await listingsRegistry.getListingAddress(index)
    return UnitListing.at(address)
  }

  const buyListing = async (listing, qty, from) => {
    const price = await listing.price()
    const transaction = await listing.buyListing(qty, { from: from, value: price, gas: 4476768 })
    const address = transaction.logs.find(x => x.event == "ListingPurchased").args._purchaseContract
    return Purchase.at(address)
  }

  console.log(`default_account:       ${default_account}`)
  console.log(`a_seller_account:      ${a_seller_account}`)
  console.log(`a_buyer_account:       ${a_buyer_account}`)
  console.log(`another_buyer_account: ${another_buyer_account}`)

  await listingsRegistry.create(
    "0x036f2436e88d1a49fd41ed843bd531ee2ea234b247ad826c602c730aaf5dca7c",
    web3.toWei(3, "ether"),
    1,
    { from: a_seller_account, gas: 4476768 }
  )

  await listingsRegistry.create(
    "0x8c95c2b29113de838c6e68f552e5c31797c98d6eee55681fffeb26193a7577e6",
    web3.toWei(0.6, "ether"),
    1,
    { from: default_account, gas: 4476768 }
  )
  await listingsRegistry.create(
    "0xeef630a340410c4ca88cfeeb105fcb1e7720d44f9c1b0e9c8e0998ccfecffcbb",
    web3.toWei(8.5, "ether"),
    1,
    { from: a_seller_account, gas: 4476768 }
  )
  await listingsRegistry.create(
    "0x67c16c669097b9b091af42979a58859ba160a5b8861dc8cb62345375deabbe11",
    web3.toWei(1.5, "ether"),
    1,
    { from: default_account, gas: 4476768 }
  )
  const ticketsTransaction = await listingsRegistry.create(
    "0xbae479bb1f26346c313fda2fd91cc8a5dfe0286c3240fddf68b1b049cbb980ce",
    web3.toWei(0.3, "ether"),
    27,
    { from: default_account, gas: 4476768 }
  )

  if (network === "development") {
    // Creating ticket purchases at different stages
    const ticketsListing = await getListingContract(ticketsTransaction)
    let purchase

    purchase = await buyListing(ticketsListing, 1, a_buyer_account)

    purchase = await buyListing(ticketsListing, 1, a_buyer_account)
    await purchase.sellerConfirmShipped({ from: default_account })

    purchase = await buyListing(ticketsListing, 1, another_buyer_account)
    await purchase.sellerConfirmShipped({ from: default_account })
    await purchase.buyerConfirmReceipt(5, "", { from: another_buyer_account })

    purchase = await buyListing(ticketsListing, 1, another_buyer_account)
    await purchase.sellerConfirmShipped({ from: default_account })
    await purchase.buyerConfirmReceipt(3, "", { from: another_buyer_account })
    await purchase.sellerCollectPayout(4,"",{ from: default_account })
  }
}
