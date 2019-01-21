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
  return async function(dispatch, getState) {
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
      const config = getState().config

      let filters = []
      if (config.filters &&
          config.filters.listings &&
          config.filters.listings.marketplacePublisher) {
        filters.push({
          name: 'marketplacePublisher',
          value: config.filters.listings.marketplacePublisher,
          valueType: 'STRING',
          operator: 'EQUALS'
        })
      }

      const ids = await origin.marketplace.getListings({
        idsOnly: true,
        filters: filters
      })

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
