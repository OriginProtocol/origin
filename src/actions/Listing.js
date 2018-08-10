import { showAlert } from 'actions/Alert'

import keyMirror from 'utils/keyMirror'

import origin from '../services/origin'

export const ListingConstants = keyMirror(
  {
    FETCH_IDS: null,
    FETCH_IDS_SUCCESS: null,
    FETCH_IDS_ERROR: null
  },
  'LISTING'
)

export function getListingIds() {
  return async function(dispatch) {
    dispatch({ type: ListingConstants.FETCH_IDS })

    let hideList = []
    const { web3, listingsRegistryContract } = origin.contractService
    const inProductionEnv =
      window.location.hostname === 'demo.originprotocol.com'

    try {
      const networkId = await web3.eth.net.getId()
      const contractFound = listingsRegistryContract.networks[networkId]
      if (!contractFound) {
        dispatch({
          type: ListingConstants.FETCH_IDS_ERROR,
          contractFound: false
        })
        return
      }

      if (inProductionEnv && networkId < 10) {
        const response = await fetch(
          `https://raw.githubusercontent.com/OriginProtocol/demo-dapp/hide_list/hidelist_${networkId}.json`
        )
        if (response.status === 200) {
          hideList = await response.json()
        }
      }

      const ids = await origin.marketplace.getListings({ idsOnly: true })

      dispatch({
        type: ListingConstants.FETCH_IDS_SUCCESS,
        ids,
        hideList
      })
    } catch (error) {
      dispatch(showAlert(error.message))
      dispatch({
        type: ListingConstants.FETCH_IDS_ERROR,
        error: error.message
      })
    }
  }
}
