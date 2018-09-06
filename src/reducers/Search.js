import { SearchConstants } from '../actions/Search'

const initialState = {
  listingType: 'all',
  filters: {}
}

export default function Transactions(state = initialState, action = {}) {
  switch (action.type) {

  case SearchConstants.SEARCH_QUERY:
    const { query, listingType } = action
    
    return {
      ...state,
      query,
      listingType
    }

  case SearchConstants.UPDATE_FILTERS:
    const { filterGroupId, filters } = action
    const objectToMerge = {}
    objectToMerge[filterGroupId] = filters

    return {
      ...state,
      filters: {...state.filters, ...objectToMerge},
    }

  default:
    return state
  }
}
