import React, { useState, useEffect } from 'react'
import { Switch, Route, useHistory } from 'react-router-dom'
import { StripeProvider } from 'react-stripe-elements'
import { ApolloProvider } from 'react-apollo'
import client from '@origin/graphql'
import Styl from 'react-styl'

import { Elements } from 'react-stripe-elements'

import Site from 'constants/Site'
import { useStateValue } from 'data/state'

import Information from './Information'
import Shipping from './Shipping'
import Payment from './Payment'
import Summary from './Summary'

const StripeKey = process.env.STRIPE_KEY

const Checkout = () => {
  const history = useHistory()
  const [{ cart }] = useStateValue()
  const [stripe, setStripe] = useState(null)

  useEffect(() => {
    if (!cart.items.length) {
      history.push('/cart')
      return
    }
    if (window.Stripe) {
      setStripe(window.Stripe(StripeKey))
    } else {
      const script = document.createElement('script')
      script.src = 'https://js.stripe.com/v3/'
      script.addEventListener('load', () => {
        setStripe(window.Stripe(StripeKey))
      })
      document.head.appendChild(script)
      // Need to re-add stylesheet as this component is lazy loaded
      Styl.addStylesheet()
    }
  }, [])

  return (
    <ApolloProvider client={client}>
      <StripeProvider stripe={stripe}>
        <Elements>
          <div className="checkout">
            <h3 className="d-md-none my-4 ml-4">{Site.fullTitle}</h3>
            <div className="user-details">
              <Switch>
                <Route path="/checkout/shipping" component={Shipping} />
                <Route path="/checkout/payment" component={Payment} />
                <Route path="/checkout" component={Information} />
              </Switch>
            </div>

            <div className="order-summary-wrap">
              <Summary cart={cart} />
            </div>
          </div>
        </Elements>
      </StripeProvider>
    </ApolloProvider>
  )
}

export default Checkout

require('react-styl')(`
  .checkout
    display: flex
    h3,h4,h5
      font-weight: 400
    .breadcrumbs
      font-size: 0.8rem
      a
        color: #1990c6
    > .user-details
      flex: 7
      padding: 3rem
      display: flex
      justify-content: flex-end
      .checkout-information,.checkout-shipping
        padding: 1rem
        max-width: 600px
        width: 100%
      .actions
        display: flex
        justify-content: space-between
        align-items: center
        margin-top: 2rem
    > .order-summary-wrap
      padding: 3rem
      flex: 6
      min-height: 100vh
      border-width: 0 0 0 1px
      border-style: solid
      border-color: #ddd
      background: #f6f6f6


  @media (max-width: 767.98px)
    .checkout
      flex-direction: column
      > .user-details
        padding: 1rem
        order: 2
        .checkout-information,.checkout-shipping
          padding: 1rem 0
        .actions
          flex-direction: column-reverse
          margin-bottom: 5rem
          *
            margin-bottom: 2rem
      > .order-summary-wrap
        padding: 1rem 1.25rem
        border-width: 1px 0 1px 0
        min-height: 0
        .toggle-order-summary
          display: flex
          justify-content: space-between
          .toggle
            color: #1990c6
          .icon-caret
            fill: #1990c6
            margin-left: 0.5rem
          .icon-cart
            margin-right: 0.5rem
            width: 1.5rem
          &.active
            .icon-caret
              transform: scaleY(-1)

        .order-summary
          margin-top: 2rem
          display: none
          &.show
            display: block

`)
