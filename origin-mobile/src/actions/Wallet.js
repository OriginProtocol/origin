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
    const { web3 } = origin.contractService
    const account = await origin.contractService.currentAccount()
    if (account)
    {
      const balance = await web3.eth.getBalance(account)

      dispatch({
        type: WalletConstants.BALANCE_SUCCESS,
        balance,
      })

      const ogns = (await origin.token.balanceOf(account)) / 10 ** origin.token.decimals
      dispatch({
        type: WalletConstants.OGN_SUCCESS,
        ogns,
      })
    }
  }
}
