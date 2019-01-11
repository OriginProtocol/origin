import origin from 'services/origin'

import keyMirror from 'utils/keyMirror'

export const WalletConstants = keyMirror(
  {
    INIT: null,
    INIT_SUCCESS: null,
    INIT_ERROR: null,

    BALANCE: null,
    BALANCE_SUCCESS: null,
    BALANCE_ERROR: null,

    OGN_SUCCESS:null
  },
  'WALLET'
)

export function init(address) {
  return {
    type: WalletConstants.INIT_SUCCESS,
    address,
  }
}

export function getBalance() {
  return async function(dispatch) {
    let account
    try {
      account = await origin.contractService.currentAccount()
    } catch(error) {
      console.log("error getting account for balance. ", error)
      return
    }
    if (account)
    {
      try {
        const balance = await web3.eth.getBalance(account)

        dispatch({
          type: WalletConstants.BALANCE_SUCCESS,
          balance,
        })
      } catch (error) {
        console.log("error getting balance. ", error)
      }
      try {
        const ogns = await origin.token.balanceOf(account)
        dispatch({
          type: WalletConstants.OGN_SUCCESS,
          ogns,
        })
      } catch (error) {
        console.log("error getting ogn for balance. ", error)
      }
    }
  }
}
