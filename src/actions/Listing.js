import { showAlert } from 'actions/Alert'

import keyMirror from 'utils/keyMirror'

import origin from '../services/origin'

export const ListingConstants = keyMirror(
  {
    FETCH_IDS: null,
    FETCH_IDS_SUCCESS: null,
    FETCH_IDS_ERROR: null,
  },
  'LISTING'
)

async function fetchListingIds(dispatch) {
  return async function(dispatch, fetcher) {
    dispatch({ type: ListingConstants.FETCH_IDS })

    let hideList = []
    const inProductionEnv =
      window.location.hostname === 'demo.originprotocol.com'

    try {
      const networkId = await origin.contractService.web3.eth.net.getId()
      const { allContractsPresent, someContractsPresent } = await origin.contractService.marketplaceContractsFound()

      if (!someContractsPresent) {
        dispatch({
          type: ListingConstants.FETCH_IDS_ERROR,
          contractFound: false
        })
        return
      }

      if (!allContractsPresent) {
        const message = 'Not all listing contracts were found.'
        dispatch(showAlert(message))
        console.error(message)
      }

      if (inProductionEnv && networkId < 10) {
        const response = await fetch(
          `https://raw.githubusercontent.com/OriginProtocol/demo-dapp/hide_list/hidelist_${networkId}.json`
        )
        if (response.status === 200) {
          hideList = await response.json()
        }
      }

      const ids = await fetcher()

      dispatch({
        type: ListingConstants.FETCH_IDS_SUCCESS,
        ids,
        hideList
      })
    } catch (error) {
      dispatch(showAlert(error.message))
      dispatch({
        type: ListingConstants.FETCH_IDS_ERROR,
        // (micah) I don't think we currently handle this property
        error: error.message
      })
    }
  }
}

export function getListingIds() {
  return async function(dispatch) {
    const fetcher = () => { return origin.marketplace.getListings({ idsOnly: true }) }
    await fetchListingIds(dispatch, fetcher)
  }
}