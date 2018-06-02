export default async function asAccount(web3, account, fn) {
  const accounts = await web3.eth.getAccounts()
  const accountBefore = web3.eth.defaultAccount || accounts[0]
  web3.eth.defaultAccount = account
  const result = await fn()
  web3.eth.defaultAccount = accountBefore
  return result
}
