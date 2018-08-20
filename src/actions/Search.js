import keyMirror from 'utils/keyMirror'

export const SearchConstants = keyMirror(
  {
    SEARCH_QUERY: null,
  },
  'SEARCH'
)

export function generalSearch(query, listingType) {
  return {
    type: SearchConstants.SEARCH_QUERY,
    query,
    listingType
  }
}
