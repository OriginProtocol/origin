import keyMirror from 'utils/keyMirror'

import origin from '../services/origin'

export const WalletConstants = keyMirror(
  {
    INIT: null,
    INIT_SUCCESS: null,
    INIT_ERROR: null,

    ETH_BALANCE_SUCCESS: null,
    ETH_BALANCE_ERROR: null,
  },
  'WALLET'
)

export function init() {
  return async function(dispatch) {
    const address = await origin.contractService.currentAccount()

    dispatch({
      type: WalletConstants.INIT_SUCCESS,
      address
    })
  }
}

export function getEthBalance() {
  return async function(dispatch) {
    const { web3 } = origin.contractService
    const account = await origin.contractService.currentAccount()
    const balance = await web3.eth.getBalance(account)

    dispatch({
      type: WalletConstants.ETH_BALANCE_SUCCESS,
      ethBalance: web3.utils.fromWei(balance, 'ether')
    })
  }
}
