import { ListingConstants } from 'actions/Listing'

const initialState = {
  ids: [],
  hidden: [],
  featured: [],
  contractFound: true
}

export default function Listings(state = initialState, action = {}) {
  switch (action.type) {
  case ListingConstants.FETCH_IDS_ERROR:
    return { ...state, ids: [], contractFound: action.contractFound }

  case ListingConstants.FETCH_IDS_SUCCESS:
    return { ...state, ids: action.ids }

  case ListingConstants.FETCH_FEATURED_HIDDEN:
    return { ...state, hidden: action.hidden, featured: action.featured }

  default:
    return state
  }
}
