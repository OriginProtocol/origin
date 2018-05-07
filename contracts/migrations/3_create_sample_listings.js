var ListingsRegistry = artifacts.require("./ListingsRegistry.sol");
var Listing = artifacts.require("./Listing.sol");
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
    const info = await listingsRegistry.getListing(index)
    const address = info[0]
    return Listing.at(address)
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
    "0x4f32f7a7d40b4d65a917926cbfd8fd521483e7472bcc4d024179735622447dc9",
    web3.toWei(3, "ether"),
    1,
    { from: a_seller_account, gas: 4476768 }
  )

  await listingsRegistry.create(
    "0xa183d4eb3552e730c2dd3df91384426eb88879869b890ad12698320d8b88cb48",
    web3.toWei(0.6, "ether"),
    1,
    { from: default_account, gas: 4476768 }
  )
  await listingsRegistry.create(
    "0xab92c0500ba26fa6f5244f8ba54746e15dd455a7c99a67f0e8f8868c8fab4a1a",
    web3.toWei(8.5, "ether"),
    1,
    { from: a_seller_account, gas: 4476768 }
  )
  await listingsRegistry.create(
    "0x6b14cac30356789cd0c39fec0acc2176c3573abdb799f3b17ccc6972ab4d39ba",
    web3.toWei(1.5, "ether"),
    1,
    { from: default_account, gas: 4476768 }
  )
  const ticketsTransaction = await listingsRegistry.create(
    "0xff5957ff4035d28dcee79e65aa4124a4de4dcc8cb028faca54c883a5497d8917",
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
    await purchase.buyerConfirmReceipt({ from: another_buyer_account })

    purchase = await buyListing(ticketsListing, 1, another_buyer_account)
    await purchase.sellerConfirmShipped({ from: default_account })
    await purchase.buyerConfirmReceipt({ from: another_buyer_account })
    await purchase.sellerCollectPayout({ from: default_account })
  }
}
