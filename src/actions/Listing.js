import keyMirror from '../utils/keyMirror'
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

    // Get listings to hide
    const hideListPromise = new Promise((resolve, reject) => {
      window.web3.eth.net.getId((err, netId) => {
        if (err) { return reject(err) }
        resolve(netId)
      })
    })
      .then(networkId => {
        // Ignore hidden listings for local testnets
        if (networkId > 10) {
          return { status: 404 }
        } else {
          return fetch(
            `https://raw.githubusercontent.com/OriginProtocol/demo-dapp/hide_list/hidelist_${networkId}.json`
          )
        }
      })
      .then(response => {
        if (response.status === 404) {
          return [] // Default: Don't hide anything
        } else {
          return response.json()
        }
      })

    // Get all listings from contract
    const allListingsPromise = origin.listings
      .allIds()
      .then(response => {
        // this.setState({ contractFound: true })
        return response
      })
      .catch(error => {
        if (error.message.indexOf('(network/artifact mismatch)') > 0) {
          // this.setState({ contractFound: false })
        }
      })
    // Wait for both to finish
    Promise.all([hideListPromise, allListingsPromise])
      .then(([hideList, ids]) => {
        // Filter hidden listings
        const showIds = ids ? ids.filter(i => hideList.indexOf(i) < 0) : []

        dispatch({
          type: ListingConstants.FETCH_IDS_SUCCESS,
          ids: showIds.reverse()
        })
      })
      .catch(error => {
        console.log(error)
        dispatch(showAlert(error.message))

        dispatch({
          type: ListingConstants.FETCH_IDS_ERROR,
          error: error.message
        })
      })
  }
}
