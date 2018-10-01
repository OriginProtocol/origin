import { showAlert } from 'actions/Alert'

import keyMirror from 'utils/keyMirror'

import origin from '../services/origin'

const featuredListingsGist = 'https://rawgit.com/sparrowDom/23f8b219567811221cba660039c7e438/raw/5610030ef20ba79245dbdb10af18d9d10c8fb98d/gistfile1.txt'
const hiddenListingsGist = 'https://rawgit.com/sparrowDom/7c9631b1891063e6d72d0b66098a58bd/raw/5e8ef7cb1596b4da2f4627b71497d74583380274/gistfile1.txt'

export const ListingConstants = keyMirror(
  {
    FETCH_IDS: null,
    FETCH_IDS_SUCCESS: null,
    FETCH_IDS_ERROR: null,
    FETCH_FEATURED_HIDDEN: null
  },
  'LISTING'
)

export function fetchFeaturedHiddenListings() {
  const readListingsFromGist = async (gitstUrl) => {
    const response = await fetch(gitstUrl)
    return (await response.text())
      .split(',')
      .map(listing => listing.trim())
  }

  return async function(dispatch) {
    try{
      const featuredListings = await readListingsFromGist(featuredListingsGist)
      const hiddenListings = await readListingsFromGist(hiddenListingsGist)
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
