import { ListingCreateConstants } from 'actions/ListingCreate'
import { getBoostLevel, defaultBoostValue } from 'utils/boostUtils'
import store from 'store'

const data_key = 'last_listing_data'
const data = store.get(data_key)

const defaultState = {
  boostCapTooLow: false,
  step: 1,
  selectedBoostAmount: 0,
  selectedCategory: null,
  selectedCategoryName: null,
  selectedCategorySchemas: null,
  selectedSchemaId: null,
  translatedSchema: null,
  schemaFetched: false,
  isFractionalListing: false,
  isEditMode: false,
  fractionalTimeIncrement: null,
  showNoCategorySelectedError: false,
  showNoSchemaSelectedError: false,
  formListing: {
    formData: {
      boostValue: defaultBoostValue,
      boostLevel: getBoostLevel(defaultBoostValue)
    }
  },
  showDetailsFormErrorMsg: false,
  showBoostFormErrorMsg: false,
  showBoostTutorial: false
}

const initialState = { ...defaultState, ...data }

export default function ListingCreate(state = initialState, action = {}){
  switch (action.type){
  case ListingCreateConstants.UPDATE:
    const data = { ...state, ...action.payload }
    const stepData = Object.assign({}, data, { 'step': data.step > 5 && data.step !== 8 ? 5 : data.step })
    if (!stepData.editListingId) {
      store.set(data_key, stepData)
    }
    return data

  case ListingCreateConstants.CLEAR:
    store.set(data_key, {})
    return defaultState

  default:
      return state
  }
}