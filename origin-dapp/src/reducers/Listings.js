import { ListingConstants } from 'actions/Listing'

const initialState = {
  ids: [],
  contractFound: true
}

export default function Listings(state = initialState, action = {}) {
  switch (action.type) {
  case ListingConstants.FETCH_IDS_ERROR:
    return { ...state, ids: [], contractFound: action.contractFound }

  case ListingConstants.FETCH_IDS_SUCCESS:
    return { ...state, ids: action.ids }

  default:
    return state
  }
}
