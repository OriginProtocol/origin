import keyMirror from 'utils/keyMirror'

export const SearchConstants = keyMirror(
  {
    SEARCH_QUERY: null,
    UPDATE_FILTERS: null
  },
  'SEARCH'
)

export function generalSearch(query, listingType, resetSearchFilters) {
  return {
    type: SearchConstants.SEARCH_QUERY,
    query,
    listingType,
    resetSearchFilters
  }
}

export function updateFilters(filterGroupId, filters) {
  return {
    type: SearchConstants.UPDATE_FILTERS,
    filterGroupId,
    filters
  }
}
