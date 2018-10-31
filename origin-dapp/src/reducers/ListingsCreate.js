import { ListingCreateConstants } from 'actions/ListingCreate'
import { getBoostLevel, defaultBoostValue } from 'utils/boostUtils'
import store from 'store'

const data_key = 'last_listing_data'
const data = store.get(data_key)
const _initialState = {
  step: 1,
  selectedBoostAmount: 0,
  selectedSchemaType: null,
  translatedSchema: null,
  schemaExamples: null,
  schemaFetched: false,
  isFractionalListing: false,
  isEditMode: false,
  fractionalTimeIncrement: null,
  showNoSchemaSelectedError: false,
  formListing: {
    formData: {
      boostValue: defaultBoostValue,
      boostLevel: getBoostLevel(defaultBoostValue)
    }
  },
  showDetailsFormErrorMsg: false,
  showBoostTutorial: false,
  showEthNotEnough: false
}
const initialState = { ..._initialState, ...data }

export default function ListingsCreate(state = initialState, action = {}) {
  switch (action.type) {
  case ListingCreateConstants.UPDATE:
    const data = { ...state,...action.payload }
    store.set(data_key,{
      step: data.step>5 && data.step!==8 ? 5 : data.step,
      selectedBoostAmount: data.selectedBoostAmount,
      selectedSchemaType: data.selectedSchemaType,
      formListing: data.formListing
    })
    return data

  case ListingCreateConstants.CLEAR:
    store.set(data_key, {})
    return _initialState

  default:
    return state
  }
}
