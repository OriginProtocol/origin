import { SearchConstants } from '../actions/Search'
import listingSchemaMetadata from 'utils/listingSchemaMetadata.js'

const initialState = {
  listingType: listingSchemaMetadata.listingTypeAll,
  filters: {},
  generalSearchId: 0 // required for forcefully triggering general search even when search parameters don't change
}

export default function Transactions(state = initialState, action = {}) {
  switch (action.type) {
  case SearchConstants.SEARCH_QUERY:
    const {
      query,
      listingType,
      resetSearchFilters,
      forceIssueOfGeneralSearch
    } = action
    const objectToMerge = {}
    if (resetSearchFilters) objectToMerge.filters = {}

    return {
      ...state,
      ...objectToMerge,
      query,
      listingType,
      generalSearchId:
          state.generalSearchId + (forceIssueOfGeneralSearch ? 1 : 0)
    }

  case SearchConstants.UPDATE_FILTERS:
    const { filterGroupId, filters } = action
    const objectToMerge1 = {}
    objectToMerge1[filterGroupId] = filters

    return {
      ...state,
      filters: { ...state.filters, ...objectToMerge1 }
    }

  case SearchConstants.CLEAR_FILTERS:
    return {
      ...state,
      filters: {}
    }

  // set a selected listing type and also trigger search
  case SearchConstants.SELECT_LISTING_TYPE:
    return {
      ...state,
      filters: {},
      query: '',
      listingType: action.listingType,
      generalSearchId: state.generalSearchId + 1
    }

  case SearchConstants.RESET_SEARCH_STATE:
    return {
      ...state,
      filters: {},
      query: undefined,
      listingType: listingSchemaMetadata.listingTypeAll
    }

  default:
    return state
  }
}
