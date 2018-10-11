import { ExchangeRateConstants } from 'actions/ExchangeRates'

const initialState = {
}

export default function ExchangeRates(state = initialState, action = {}) {
  switch (action.type) {
  case ExchangeRateConstants.SET_EXCHANGE_RATE:
    return {
      ...state,
      [action.currencyPair]: {
        rate: action.rate,
        timestamp: action.timestamp
      }
    }
  }

  return state
}
