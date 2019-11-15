import React, { createContext, useContext, useReducer } from 'react'
import FlexSearch from 'flexsearch'

import PaymentMethods from './PaymentMethods'

import get from 'lodash/get'
import set from 'lodash/set'
import pick from 'lodash/pick'
import cloneDeep from 'lodash/cloneDeep'

const defaultState = {
  products: [],
  collections: [],
  shippingZones: [],
  paymentMethods: PaymentMethods,
  orders: [],
  admin: '',

  cart: {
    items: [],
    subTotal: 0,
    total: 0,
    shipping: { amount: 0 },
    paymentMethod: {}
  }
}

let initialState = cloneDeep(defaultState)
try {
  initialState = {
    ...initialState,
    admin: sessionStorage.admin,
    ...JSON.parse(localStorage.cart)
  }
} catch (e) {
  /* Ignore */
}

const reducer = (state, action) => {
  let newState = state
  console.log('reduce', action)
  if (action.type === 'addToCart') {
    const { product, variant } = action.item
    const existing = state.cart.items.findIndex(
      i => i.product === product && i.variant === variant
    )
    if (existing >= 0) {
      const quantity = get(state, 'cart.items[existing].quantity')
      newState = set(state, `cart.items[${existing}].quantity`, quantity + 1)
    } else {
      const lastIdx = state.cart.items.length
      newState = set(state, `cart.items[${lastIdx}]`, action.item)
    }
  } else if (action.type === 'removeFromCart') {
    const items = get(state, 'cart.items')
    items.splice(action.item, 1)
    newState = set(state, 'cart.items', items)
  } else if (action.type === 'updateCartQuantity') {
    const { quantity } = action
    newState = set(state, `cart.items[${action.item}].quantity`, quantity)
  } else if (action.type === 'setProducts') {
    newState = set(state, `products`, action.products)
    const index = FlexSearch.create()
    action.products.forEach(product => index.add(product.id, product.title))
    newState = set(state, `productIndex`, index)
    const productIds = action.products.map(p => p.id)
    newState = set(
      state,
      'cart.items',
      state.cart.items.filter(i => productIds.indexOf(i.product) >= 0)
    )
  } else if (action.type === 'setCollections') {
    newState = set(state, `collections`, action.collections)
  } else if (action.type === 'setShippingZones') {
    newState = set(state, `shippingZones`, action.zones)
  } else if (action.type === 'setOrders') {
    newState = set(state, `orders`, action.orders)
  } else if (action.type === 'updateUserInfo') {
    newState = set(
      state,
      `cart.userInfo`,
      pick(
        action.info,
        'firstName',
        'lastName',
        'email',
        'address1',
        'address2',
        'city',
        'province',
        'country',
        'zip'
      )
    )
  } else if (action.type === 'updateShipping') {
    const zone = pick(action.zone, 'id', 'label', 'amount')
    newState = set(newState, `cart.shipping`, zone)
  } else if (action.type === 'updatePaymentMethod') {
    newState = set(newState, `cart.paymentMethod`, action.method)
  } else if (action.type === 'orderComplete') {
    newState = cloneDeep(defaultState)
  } else if (action.type === 'setAuth') {
    sessionStorage.admin = action.auth
    newState = set(newState, `admin`, action.auth)
  } else if (action.type === 'logout') {
    delete sessionStorage.admin
    newState = set(newState, 'admin', '')
  }

  newState.cart.subTotal = state.cart.items.reduce((total, item) => {
    return total + item.quantity * item.price
  }, 0)

  const shipping = get(newState, 'cart.shipping.amount', 0)
  newState.cart.total = newState.cart.subTotal + shipping

  localStorage.cart = JSON.stringify(pick(newState, 'cart'))
  // console.log(newState)
  return cloneDeep(newState)
}

export const StateContext = createContext()

export const StateProvider = ({ children }) => (
  <StateContext.Provider value={useReducer(reducer, initialState)}>
    {children}
  </StateContext.Provider>
)

export const useStateValue = () => useContext(StateContext)
