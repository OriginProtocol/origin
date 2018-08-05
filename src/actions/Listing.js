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

async function fetchListingIds(dispatch, fetcher) {
  dispatch({ type: ListingConstants.FETCH_IDS })

  console.log("origin.contractService=", origin.contractService)

  let hideList = []
  const { web3, listingsRegistryContract } = origin.contractService
  const inProductionEnv =
    window.location.hostname === 'demo.originprotocol.com'

  try {
    let networkId = await web3.eth.net.getId()
    console.log("networkId=", networkId)
    console.log("networks=", listingsRegistryContract.networks)
    let contractFound = listingsRegistryContract.networks[networkId]
    if (!contractFound) {
      dispatch({
        type: ListingConstants.FETCH_IDS_ERROR,
        contractFound: false
      })
      return
    }

    if (inProductionEnv && networkId < 10) {
      let response = await fetch(
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

export function searchListings(query) {
  return async function(dispatch) {
    console.log("############# Function searchListings query=", query)

    let fetcher = () => { return origin.listings.search(query) }
    await fetchListingIds(dispatch, fetcher)
  }
}

export function getListingIds() {
  return async function(dispatch) {
    console.log("############# Function getListingIds")

    let fetcher = () => { return origin.listings.allIds() }
    await fetchListingIds(dispatch, fetcher)
  }
}

