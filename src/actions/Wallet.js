import keyMirror from 'utils/keyMirror'

import origin from '../services/origin'

export const WalletConstants = keyMirror(
  {
    INIT: null,
    INIT_SUCCESS: null,
    INIT_ERROR: null,

    BALANCE: null,
    BALANCE_SUCCESS: null,
    BALANCE_ERROR: null
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

export function getBalance() {
  return async function(dispatch) {
    const { web3 } = origin.contractService
    const account = await origin.contractService.currentAccount()
    const balance = account ? await web3.eth.getBalance(account) : "0"

    dispatch({
      type: WalletConstants.BALANCE_SUCCESS,
      balance: web3.utils.fromWei(balance, 'ether')
    })
  }
}
