/* eslint-disable */
import get from 'lodash/get'

function fbTrack(state, action) {
  if (typeof fbq !== 'function') {
    return
  }

  if (action.type === 'addToCart') {
    fbq('track', 'AddToCart', {
      value: get(action, 'item.price'),
      currency: 'USD',
      contents: [
        {
          id: get(action, 'item.product'),
          quantity: get(action, 'item.quantity')
        }
      ]
    })
  } else if (action.type === 'orderComplete') {
    fbq('track', 'Purchase', {
      value: get(state, 'cart.total'),
      currency: 'USD'
    })
  } else if (action.type === 'updatePaymentMethod') {
    fbq('track', 'AddPaymentInfo')
  }
}

export default fbTrack
