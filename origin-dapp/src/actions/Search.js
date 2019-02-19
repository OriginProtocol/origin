import keyMirror from 'utils/keyMirror'

export const SearchConstants = keyMirror(
  {
    SEARCH_QUERY: null,
    UPDATE_FILTERS: null,
    SELECT_LISTING_TYPE: null,
    RESET_SEARCH_STATE: null,
  },
  'SEARCH'
)

export function generalSearch(
  query,
  listingType,
  resetSearchFilters,
  forceIssueOfGeneralSearch
) {
  return {
    type: SearchConstants.SEARCH_QUERY,
    query,
    listingType,
    resetSearchFilters,
    forceIssueOfGeneralSearch
  }
}

export function selectListingType(listingType) {
  return {
    type: SearchConstants.SELECT_LISTING_TYPE,
    listingType
  }
}

export function resetSearchState() {
  return {
    type: SearchConstants.RESET_SEARCH_STATE
  }
}

export function updateFilters(filterGroupId, filters) {
  return {
    type: SearchConstants.UPDATE_FILTERS,
    filterGroupId,
    filters
  }
}
