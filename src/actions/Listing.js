import keyMirror from 'utils/keyMirror'
import origin from '../services/origin'

import { showAlert } from './Alert'

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

    try {
      let networkId = await web3.eth.net.getId()
      let contractFound = listingsRegistryContract.networks[networkId]
      if (!contractFound) {
        dispatch({
          type: ListingConstants.FETCH_IDS_ERROR,
          contractFound: false
        })
        return
      }

      if (networkId < 10) { // Networks >9 are local test networks
        let response = await fetch(
          `https://raw.githubusercontent.com/OriginProtocol/demo-dapp/hide_list/hidelist_${networkId}.json`
        )
        if (response.status === 200) {
          hideList = await response.json()
        }
      }

      const ids = await origin.listings.allIds()
      const showIds = ids ? ids.filter(i => hideList.indexOf(i) < 0) : []

      dispatch({
        type: ListingConstants.FETCH_IDS_SUCCESS,
        ids: showIds.reverse()
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
