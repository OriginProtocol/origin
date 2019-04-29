import contracts from '../../contracts'

export default async (_, { address, message }) => {
  if (window.ReactNativeWebView) {
    return await contracts.web3Exec.eth.sign(message, address)
  } else {
    return await contracts.web3Exec.eth.personal.sign(message, address)
  }
}
