/**
 * This script pulls stats for the relayer accounts from etherscan
 *
 * Example tx result
 * -----------------
 * {
 *    "blockNumber":"65204",
 *    "timeStamp":"1439232889",
 *    "hash":"0x98beb27135aa0a25650557005ad962919d6a278c4b3dde7f4f6a3a1e65aa746c",
 *    "nonce":"0",
 *    "blockHash":"0x373d339e45a701447367d7b9c7cef84aab79c2b2714271b908cda0ab3ad0849b",
 *    "transactionIndex":"0",
 *    "from":"0x3fb1cd2cd96c6d5c0b5eb3322d807b34482481d4",
 *    "to":"0xde0b295669a9fd93d5f28d9ec85e40f4cb697bae",
 *    "value":"0",
 *    "gas":"122261",
 *    "gasPrice":"50000000000",
 *    "isError":"0",
 *    "txreceipt_status":"",
 *    "input":"0xf00d4b5d000000000000000000000000036c8cecce8d8bbf0831d840d7f29c9e3ddefa63000000000000000000000000c5a96db085dda36ffbe390f455315d30d6d3dc52",
 *    "contractAddress":"",
 *    "cumulativeGasUsed":"122207",
 *    "gasUsed":"122207",
 *    "confirmations":"8056319"
 * }
 */
const fetch = require('cross-fetch')
const BN = require('bn.js')
const Web3 = require('web3')

const API_ROOT = 'http://api.etherscan.io/api'
const API_KEY = process.env.API_KEY

function accountTransactionURL(address) {
  return (
    `${API_ROOT}?module=account&action=txlist&address=${address}&startblock=0` +
    `&endblock=99999999&sort=asc&apikey=${API_KEY}`
  )
}

async function getAccountStats(address) {
  address = Web3.utils.toChecksumAddress(address)
  const url = accountTransactionURL(address)
  //console.log(`Requesting url: ${url}`)
  const res = await fetch(url)
  if (res.status !== 200) {
    console.debug(res)
    throw new Error('Invalid response')
  }
  const jason = await res.json()
  //console.log('res', jason)

  let cumulativeGasUsed = new BN('0')
  let totalFees = new BN('0')
  let totalReverts = 0
  let totalErrors = 0
  let totalTransactions = 0
  let highestGas = new BN('0')
  let lowestGas = new BN('0')

  for (const tx of jason.result) {
    // ignore incoming
    if (Web3.utils.toChecksumAddress(tx.from) !== address) continue

    totalTransactions += 1
    const gas = new BN(tx.gasUsed)
    const gasPrice = new BN(tx.gasPrice)
    const fee = gasPrice.mul(gas)
    totalFees = totalFees.add(fee)
    cumulativeGasUsed = cumulativeGasUsed.add(gas)
    if (highestGas.lt(gas)) {
      highestGas = gas
    }
    if (lowestGas.gt(gas) || lowestGas.eq(new BN('0'))) {
      lowestGas = gas
    }
    if (tx.isError === '1') {
      totalErrors += 1
    }
    if (tx.txreceipt_status === '0') {
      totalReverts += 1
    }
  }

  return {
    cumulativeGasUsed,
    totalFees,
    totalReverts,
    totalErrors,
    totalTransactions,
    highestGas,
    lowestGas
  }
}

async function displayAllStats(accounts) {
  let cumulativeGasUsed = new BN('0')
  let highestGas = new BN('0')
  let lowestGas = new BN('0')
  let totalFees = new BN('0')
  let totalReverts = 0
  let totalErrors = 0
  let totalTransactions = 0

  for (const account of accounts) {
    const stats = await getAccountStats(account)
    cumulativeGasUsed = cumulativeGasUsed.add(stats.cumulativeGasUsed)
    totalFees = totalFees.add(stats.totalFees)
    totalReverts += stats.totalReverts
    totalErrors += stats.totalErrors
    totalTransactions += stats.totalTransactions

    if (highestGas.lt(stats.highestGas)) {
      highestGas = stats.highestGas
    }
    if (lowestGas.gt(stats.lowestGas) || lowestGas.eq(new BN('0'))) {
      lowestGas = stats.lowestGas
    }

    console.log(``)
    console.log(`Account ${account} Statistics`)
    console.log(`-----------------------------`)
    console.log(`Total Gas Used: ${stats.cumulativeGasUsed}`)
    console.log(`Highest Gas: ${stats.highestGas}`)
    console.log(`Lowest Gas: ${stats.lowestGas}`)
    console.log(
      `Total Fees: ${Web3.utils.fromWei(stats.totalFees, 'ether')} Ether`
    )
    console.log(`Total Reverts: ${stats.totalReverts}`)
    //console.log(`Total Errors: ${stats.totalErrors}`)
    console.log(`Total Transactions: ${stats.totalTransactions}`)
    console.log(
      `Error Rate: ${(
        (stats.totalErrors / stats.totalTransactions) *
        100
      ).toPrecision(2)}%`
    )
    console.log(``)
  }

  console.log(``)
  console.log(`Relayer Statistics`)
  console.log(`-----------------------------`)
  console.log(`Total Gas Used: ${cumulativeGasUsed}`)
  console.log(`Highest Gas: ${highestGas}`)
  console.log(`Lowest Gas: ${lowestGas}`)
  console.log(`Total Fees: ${Web3.utils.fromWei(totalFees, 'ether')} Ether`)
  console.log(`Total Reverts: ${totalReverts}`)
  //console.log(`Total Errors: ${totalErrors}`)
  console.log(`Total Transactions: ${totalTransactions}`)
  console.log(
    `Error Rate: ${((totalErrors / totalTransactions) * 100).toPrecision(2)}%`
  )
  console.log(``)
}

if (require.main === module && process.stdin.isTTY) {
  const accounts = process.argv.slice(2)
  if (accounts.length < 1) {
    console.log('No accounts provided')
    process.exit(0)
  }
  displayAllStats(accounts)
}
