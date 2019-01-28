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

      const config = getState().config

      const filters = []

      // Filters from the marketplace creator
      if (config.filters && config.filters.listings) {
        const listingFilterAttributes = ['marketplacePublisher', 'category', 'subCategory']

        listingFilterAttributes.map((listingFilterAttribute) => {
          if (config.filters.listings[listingFilterAttribute]) {
            filters.push({
              name: listingFilterAttribute,
              value: config.filters.listings[listingFilterAttribute],
              valueType: 'STRING',
              operator: 'EQUALS'
            })
          }
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
