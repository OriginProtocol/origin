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
  discounts: [],

  cart: {
    items: [],
    instructions: '',
    subTotal: 0,
    discount: 0,
    total: 0,
    shipping: { amount: 0 },
    paymentMethod: {},
    discountObj: {}
  }
}

let initialState = cloneDeep(defaultState)
try {
  initialState = {
    ...initialState,
    ...JSON.parse(localStorage.cart)
  }
} catch (e) {
  /* Ignore */
}

const reducer = (state, action) => {
  let newState = cloneDeep(state)
  if (action.type === 'addToCart') {
    const { product, variant } = action.item
    const existing = state.cart.items.findIndex(
      i => i.product === product && i.variant === variant
    )
    if (existing >= 0) {
      const quantity = get(newState, `cart.items[${existing}].quantity`)
      newState = set(newState, `cart.items[${existing}].quantity`, quantity + 1)
    } else {
      const lastIdx = state.cart.items.length
      newState = set(newState, `cart.items[${lastIdx}]`, action.item)
    }
  } else if (action.type === 'removeFromCart') {
    const items = get(state, 'cart.items')
    items.splice(action.item, 1)
    newState = set(newState, 'cart.items', items)
  } else if (action.type === 'updateCartQuantity') {
    const { quantity } = action
    newState = set(newState, `cart.items[${action.item}].quantity`, quantity)
  } else if (action.type === 'setProducts') {
    newState = set(newState, `products`, action.products)
    const index = FlexSearch.create()
    action.products.forEach(product => index.add(product.id, product.title))
    newState = set(newState, `productIndex`, index)
    // const productIds = action.products.map(p => p.id)
    // newState = set(
    //   newState,
    //   'cart.items',
    //   state.cart.items.filter(i => productIds.indexOf(i.product) >= 0)
    // )
  } else if (action.type === 'setCollections') {
    newState = set(newState, `collections`, action.collections)
  } else if (action.type === 'setShippingZones') {
    newState = set(newState, `shippingZones`, action.zones)
  } else if (action.type === 'setOrders') {
    newState = set(newState, `orders`, action.orders)
  } else if (action.type === 'setDiscounts') {
    newState = set(newState, `discounts`, action.discounts)
  } else if (action.type === 'updateUserInfo') {
    newState = set(
      newState,
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
  } else if (action.type === 'updateInstructions') {
    newState = set(newState, 'cart.instructions', action.value)
  } else if (action.type === 'setDiscount') {
    newState = set(newState, 'cart.discountObj', action.discount)
  } else if (action.type === 'removeDiscount') {
    newState = set(newState, 'cart.discountObj', {})
    newState = set(newState, 'cart.discount', 0)
  }

  newState.cart.subTotal = newState.cart.items.reduce((total, item) => {
    return total + item.quantity * item.price
  }, 0)

  const shipping = get(newState, 'cart.shipping.amount', 0)

  const discountObj = get(newState, 'cart.discountObj', {})
  const discountCode = get(newState, 'cart.discountObj.code')
  let discount = 0
  if (discountCode) {
    if (discountObj.discountType === 'percentage') {
      const totalWithShipping = newState.cart.subTotal + shipping
      discount = Math.round((totalWithShipping * discountObj.value) / 100)
    } else if (discountObj.discountType === 'fixed') {
      discount = discountObj.value * 100
    }
  }

  newState.cart.discount = discount
  newState.cart.total = newState.cart.subTotal + shipping - discount

  localStorage.cart = JSON.stringify(pick(newState, 'cart'))
  // console.log('reduce', { action, state, newState })
  return cloneDeep(newState)
}

export const StateContext = createContext()

export const StateProvider = ({ children }) => (
  <StateContext.Provider value={useReducer(reducer, initialState)}>
    {children}
  </StateContext.Provider>
)

export const useStateValue = () => useContext(StateContext)
