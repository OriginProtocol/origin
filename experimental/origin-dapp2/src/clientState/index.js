import merge from 'lodash.merge'

import modals from './modals'

/*
 * Each imported client state object should have two root properties:
 *  - resolvers: a collection of resolvers
 *  - defaults: default local state value
 */
export default merge(modals, {
  resolvers: {},
  defaults: {}
})
