import { SearchConstants } from '../actions/Search'

const initialState = {
  listingType: 'all',
  filters: {}
}

export default function Transactions(state = initialState, action = {}) {
  switch (action.type) {

  case SearchConstants.SEARCH_QUERY:
    const { query, listingType, resetSearchFilters } = action
    const objectToMerge = {}
    if (resetSearchFilters)
      objectToMerge.filters = {}

    return {
      ...state,
      ...objectToMerge,
      query,
      listingType
    }

  case SearchConstants.UPDATE_FILTERS:
    const { filterGroupId, filters } = action
    const objectToMerge1 = {}
    objectToMerge1[filterGroupId] = filters

    return {
      ...state,
      filters: {...state.filters, ...objectToMerge1},
    }

  case SearchConstants.CLEAR_FILTERS:
    return {
      ...state,
      filters: {},
    }

  default:
    return state
  }
}
