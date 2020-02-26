import { Store } from 'pullstate'

export const defaultState = {
  collections: [],
  products: [],
  settings: {},
  backend: {},
  orders: [],
  discounts: [],
  needsDeploy: false
}

const store = new Store(defaultState)

export default store
