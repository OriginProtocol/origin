import React, { createContext, useContext, useReducer } from 'react'
import FlexSearch from 'flexsearch'

import get from 'lodash/get'
import set from 'lodash/set'
import pick from 'lodash/pick'
import cloneDeep from 'lodash/cloneDeep'

import { Countries } from 'data/Countries'

import fbTrack from './fbTrack'

const defaultState = {
  products: [],
  collections: [],
  shippingZones: [],
  orders: [],
  discounts: [],

  cart: {
    items: [],
    instructions: '',
    subTotal: 0,
    discount: 0,
    total: 0,
    paymentMethod: {},
    discountObj: {}
  }
}

function getInitialState(key) {
  let initialState = cloneDeep(defaultState)
  try {
    initialState = {
      ...initialState,
      ...JSON.parse(localStorage[key])
    }
  } catch (e) {
    /* Ignore */
  }
  return initialState
}

/*
function setStorage(storage, data) {
  const randomArray = Array.from(crypto.getRandomValues(new Uint32Array(5)))
  const dataKey = randomArray.map(n => n.toString(36)).join('')

  const d = new Date()
  d.setTime(d.getTime() + 24 * 60 * 60 * 1000)
  const expires = `expires=${d.toUTCString()}`
  document.cookie = `dshopkey=${dataKey};${expires};path=${location.pathname}`

  openpgp
    .encrypt({
      message: openpgp.message.fromText(JSON.stringify(data)),
      passwords: [dataKey]
    })
    .then(data => {
      localStorage[`${storage}Enc`] = data.data
    })
}

function getStorage(storage) {
  const cookies = document.cookie.split('; ').reduce((m, o) => {
    const [k, v] = o.split('=')
    m[k] = v
    return m
  }, {})
  const encryptedData = localStorage[`${storage}CartDataEnc`]
  openpgp.message.readArmored(encryptedData).then(msg => {
    openpgp
      .decrypt({ message: msg, passwords: [cookies.dshopkey] })
      .then(decrypted => {
        console.log(JSON.parse(decrypted.data))
      })
  })
}
*/

function getReducer(key) {
  const reducer = (state, action) => {
    fbTrack(state, action)
    let newState = cloneDeep(state)
    if (action.type === 'addToCart') {
      const { product, variant } = action.item
      const existing = state.cart.items.findIndex(
        i => i.product === product && i.variant === variant
      )
      if (existing >= 0) {
        const quantity = get(newState, `cart.items[${existing}].quantity`)
        newState = set(
          newState,
          `cart.items[${existing}].quantity`,
          quantity + 1
        )
      } else {
        const lastIdx = state.cart.items.length
        newState = set(newState, `cart.items[${lastIdx}]`, action.item)
      }
      newState = set(newState, 'shippingZones', [])
      newState = set(newState, 'cart.shipping')
    } else if (action.type === 'removeFromCart') {
      const items = get(state, 'cart.items')
      items.splice(action.item, 1)
      newState = set(newState, 'cart.items', items)
      newState = set(newState, 'shippingZones', [])
      newState = set(newState, 'cart.shipping')
    } else if (action.type === 'updateCartQuantity') {
      const { quantity } = action
      newState = set(newState, `cart.items[${action.item}].quantity`, quantity)
      newState = set(newState, 'shippingZones', [])
      newState = set(newState, 'cart.shipping')
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
      const data = pick(
        action.info,
        'email',
        'firstName',
        'lastName',
        'address1',
        'address2',
        'city',
        'province',
        'country',
        'zip',
        'billingDifferent',
        'billingFirstName',
        'billingLastName',
        'billingAddress1',
        'billingAddress2',
        'billingCity',
        'billingProvince',
        'billingCountry',
        'billingZip'
      )
      data.countryCode = get(Countries, `[${data.country}].code`)
      data.provinceCode = get(
        Countries,
        `[${data.country}].provinces[${data.province}].code`
      )
      newState = set(newState, `cart.userInfo`, data)
      newState = set(newState, 'shippingZones', [])
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
    } else if (action.type === 'setPasswordAuthed') {
      newState = set(newState, `passwordAuthed`, action.authed)
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

    localStorage[key] = JSON.stringify(pick(newState, 'cart'))
    // setStorage(key, pick(newState, 'cart'))
    // console.log('reduce', { action, state, newState })
    return cloneDeep(newState)
  }
  return reducer
}

export const StateContext = createContext()

export const StateProvider = ({ children, storage = '' }) => {
  storage = `${storage}CartData`
  const reducer = useReducer(getReducer(storage), getInitialState(storage))
  return (
    <StateContext.Provider value={reducer}>{children}</StateContext.Provider>
  )
}

export const useStateValue = () => useContext(StateContext)
