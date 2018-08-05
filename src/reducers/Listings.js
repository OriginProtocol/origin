import { ListingConstants } from 'actions/Listing'

const initialState = {
  ids: [],
  hideList: [],
  contractFound: true
}

export default function Listings(state = initialState, action = {}) {
    console.log("===> Calling Listings reducer with state=", state)
    console.log("                                   action.type=", action.type)
    switch (action.type) {

      case ListingConstants.FETCH_IDS_ERROR:
        return { ...state, ids: [], contractFound: action.contractFound }

      case ListingConstants.FETCH_IDS_SUCCESS:
        return { ...state, ids: action.ids, hideList: action.hideList }

      default:
        return state
    }

}
