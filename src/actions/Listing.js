import { showAlert } from 'actions/Alert'

import keyMirror from 'utils/keyMirror'

import origin from '../services/origin'

import { SearchQuery } from 'origin'

export const ListingConstants = keyMirror(
  {
    FETCH_IDS: null,
    FETCH_IDS_SUCCESS: null,
    FETCH_IDS_ERROR: null,
    // Whether user is browsing all listings or searching.
    BROWSE_MODE: null,
    SEARCH_MODE: null,
  },
  'LISTING'
)

async function fetchListingIds(dispatch, mode, fetcher) {
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

    const ids = await fetcher()
    const showIds = ids ? ids.filter(i => hideList.indexOf(i) < 0) : []

    dispatch({
      type: ListingConstants.FETCH_IDS_SUCCESS,
      mode: mode,
      ids: showIds.reverse(),
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

export function searchListings(rawQuery) {
  return async function(dispatch) {
    const query = new SearchQuery({rawQuery: rawQuery })
    const fetcher = () => { return origin.listings.search(query) }
    await fetchListingIds(dispatch, ListingConstants.SEARCH_MODE, fetcher)
  }
}

export function getListingIds() {
  return async function(dispatch) {
    const fetcher = () => { return origin.listings.allIds() }
    await fetchListingIds(dispatch, ListingConstants.BROWSE_MODE, fetcher)
  }
}

