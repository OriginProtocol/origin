import { Store } from 'pullstate'

export const defaultState = {
  collections: [],
  products: [],
  settings: {},
  backend: {},
  orders: [],
  discounts: [],
  shops: {},
  selectedShopIndex: 0,
  needsDeploy: false,
  dataURL: null,
  hasAuthenticated: false
}

const store = new Store(defaultState)

if (process.env.NODE_ENV !== 'production') window._store = store

export default store
