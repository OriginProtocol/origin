import { SearchConstants } from '../actions/Search'

const initialState = {
  listingType: 'all'
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

      default:
        return state
    }

}
