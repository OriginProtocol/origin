import contracts from '../../contracts'
import balancesFromWei from '../../utils/balancesFromWei'

export default (_, { address }) => {
  const web3 = contracts.web3
  web3.eth.defaultAccount = window.localStorage.defaultAccount = address
  return {
    id: address,
    balance: balancesFromWei(address)
  }
}
