export default async function asAccount(web3, account, fn) {
  const accountBefore = web3.eth.defaultAccount
  web3.eth.defaultAccount = account
  const result = await fn()
  web3.eth.defaultAccount = accountBefore
  return result
}
