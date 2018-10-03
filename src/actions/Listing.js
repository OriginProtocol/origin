import { showAlert } from 'actions/Alert'

import keyMirror from 'utils/keyMirror'

import origin from '../services/origin'

export const ListingConstants = keyMirror(
  {
    FETCH_IDS: null,
    FETCH_IDS_SUCCESS: null,
    FETCH_IDS_ERROR: null,
    FETCH_FEATURED_HIDDEN: null
  },
  'LISTING'
)

export function fetchFeaturedHiddenListings(networkId) {
  const readListingsFromUrl = async (gitstUrl) => {
    const response = await fetch(gitstUrl)
    const idRegex = /^\d+-\d+-\d+$/
    return (await response.text())
      .split(',')
      .map(listing => listing.trim())
      .filter(listingId => listingId.match(idRegex) !== null)
  }

  return async function(dispatch) {
    try{
      const featuredListings = await readListingsFromUrl(`https://raw.githubusercontent.com/OriginProtocol/origin-dapp/hidefeature_list/featurelist_${networkId}.txt`)
      const hiddenListings = await readListingsFromUrl(`https://raw.githubusercontent.com/OriginProtocol/origin-dapp/hidefeature_list/hidelist_${networkId}.txt`)
      dispatch({
        type: ListingConstants.FETCH_FEATURED_HIDDEN,
        hidden: hiddenListings,
        featured: featuredListings
      })
    } catch(e) {
      console.error('Could not fetch hidden/featured listings ', e)
    }
  }
}

export function getListingIds() {
  return async function(dispatch) {
    dispatch({ type: ListingConstants.FETCH_IDS })

    // let hideList = []

    try {
      const {
        allContractsPresent,
        someContractsPresent
      } = await origin.contractService.marketplaceContractsFound()

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

      // if (networkId < 10) {
      //   // Networks > 9 are local development
      //   const response = await fetch(
      //     `https://raw.githubusercontent.com/OriginProtocol/origin-dapp/hide_list/hidelist_${networkId}.json`
      //   )
      //   if (response.status === 200) {
      //     hideList = await response.json()
      //   }
      // }

      const ids = await origin.marketplace.getListings({ idsOnly: true })

      dispatch({
        type: ListingConstants.FETCH_IDS_SUCCESS,
        ids
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
