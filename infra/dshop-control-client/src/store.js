import { Store } from 'pullstate'

export const defaultState = {
  collections: [],
  products: [],
  settings: {
    siteTitle: 'Origin'
  },
  needsDeploy: false
}

const store = new Store(defaultState)

export default store
