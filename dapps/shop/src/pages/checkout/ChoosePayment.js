import React, { useState, useEffect } from 'react'
import { useQuery, useMutation } from '@apollo/react-hooks'
import { useHistory } from 'react-router-dom'
import get from 'lodash/get'

import {
  // PaymentRequestButtonElement,
  CardElement,
  injectStripe
} from 'react-stripe-elements'

import { formInput, formFeedback } from 'utils/formHelpers'
import formatPrice from 'utils/formatPrice'
import getWalletStatus from 'utils/walletStatus'
import useConfig from 'utils/useConfig'
import useIsMobile from 'utils/useIsMobile'
import { useStateValue } from 'data/state'
import { Countries } from 'data/Countries'
import submitStripePayment from 'data/submitStripePayment'
import addData from 'data/addData'

import WalletStatus from 'queries/WalletStatus'
import MakeOffer from 'mutations/MakeOffer'

import Price from 'components/Price'
import Link from 'components/Link'
import LoadingButton from 'components/LoadingButton'

import ShippingForm from './_ShippingForm'
import TokenChooser from './_TokenChooser'
import CryptoWallet from './CryptoWallet'
import Uphold from './_Uphold'
import WaitForTransaction from '../../components/WaitForTransaction'

function validate(state) {
  if (!state.billingDifferent) {
    Object.keys(state).forEach(k => {
      if (k.indexOf('Error') > 0) {
        delete state[k]
      }
    })
    return { valid: true, newState: state }
  }

  const newState = {}

  if (!state.billingFirstName) {
    newState.billingFirstNameError = 'Enter a first name'
  }
  if (!state.billingLastName) {
    newState.billingLastNameError = 'Enter a last name'
  }
  if (!state.billingAddress1) {
    newState.billingAddress1Error = 'Enter an address'
  }
  if (!state.billingCity) {
    newState.billingCityError = 'Enter a city'
  }
  if (!state.billingZip) {
    newState.billingZipError = 'Enter a ZIP / postal code'
  }
  const provinces = get(Countries, `${state.billingCountry}.provinces`, {})
  if (!state.billingProvince && Object.keys(provinces).length) {
    newState.billingProvinceError = 'Enter a state / province'
  }

  const valid = Object.keys(newState).every(f => f.indexOf('Error') < 0)

  return { valid, newState: { ...state, ...newState } }
}

const CreditCardForm = injectStripe(({ stripe }) => {
  // const [paymentMethod, setPaymentMethod] = useState()
  // const [applePay, setApplePay] = useState(false)

  const { config } = useConfig()
  const isMobile = useIsMobile()
  const [token, setToken] = useState('token-ETH')
  const [tokenStatus, setTokenStatus] = useState({})
  const [submit, setSubmit] = useState()
  const [formData, setFormData] = useState({})
  const [loading, setLoading] = useState(false)
  const [upholdCard, setUpholdCard] = useState()
  const [paymentReq, setPaymentReq] = useState()
  const [{ cart, referrer }, dispatch] = useStateValue()
  const [approveOfferTx, setApproveOfferTx] = useState()
  const [auth, setAuth] = useState()
  const [offerTx, setOfferTx] = useState()
  const history = useHistory()
  const paymentMethod = get(cart, 'paymentMethod.id')
  const [state, setStateRaw] = useState({
    ...cart.userInfo,
    billingCountry: cart.userInfo.billingCountry || 'United States'
  })
  const setState = newState => setStateRaw({ ...state, ...newState })
  const input = formInput(state, newState => setState(newState))

  const paymentMethods = get(config, 'paymentMethods', [])
  const hasCrypto = paymentMethods.find(o => o.id === 'crypto')

  useEffect(() => {
    if (paymentMethods.length === 1) {
      dispatch({ type: 'updatePaymentMethod', method: paymentMethods[0] })
    }
  }, [paymentMethods.length])

  const { data: walletStatusData, loading: walletLoading } = useQuery(
    WalletStatus,
    {
      notifyOnNetworkStatusChange: true,
      skip: paymentMethod !== 'crypto'
    }
  )

  const walletStatus = getWalletStatus(walletStatusData, walletLoading)
  const listingID = get(config, `listingId`)

  const [makeOffer] = useMutation(MakeOffer, {
    onCompleted: arg => {
      setOfferTx(arg.makeOffer.id)
    },
    onError: errorData => {
      console.log(errorData)
      setApproveOfferTx(false)
      setLoading(false)
    }
  })

  useEffect(() => {
    if (!stripe || paymentMethod !== 'stripe' || paymentReq) {
      return
    }
    console.log('Make Stripe payment request...')

    try {
      const paymentRequest = stripe.paymentRequest({
        country: 'US',
        currency: 'usd',
        total: {
          label: 'Item Total',
          amount: cart.subTotal
        },
        requestPayerName: true,
        requestPayerEmail: true,
        requestShipping: true,
        shippingOptions: [cart.shipping]
      })

      paymentRequest.on('token', ({ complete, token, ...data }) => {
        console.log('Received Stripe token: ', token)
        console.log('Received customer information: ', data)
        complete('success')
      })

      // paymentRequest.canMakePayment().then(result => {
      //   setApplePay(!!result)
      // })

      setPaymentReq(paymentRequest)
    } catch (e) {
      console.log('paymentRequest error', e)
    }
  }, [stripe, paymentMethod])

  useEffect(() => {
    async function go() {
      setLoading(true)
      setSubmit(false)

      const encryptedData = await addData({ ...cart, referrer }, config)
      const { auth, hash } = encryptedData

      if (paymentMethod === 'stripe') {
        const { backend } = config
        submitStripePayment({
          backend,
          backendAuthToken: config.backendAuthToken,
          stripe,
          cart,
          encryptedData,
          listingId: listingID
        })
          .then(result => {
            if (result.error) {
              setFormData({ ...formData, cardError: result.error.message })
              setLoading(false)
            } else {
              history.push(`/order/${hash}?auth=${auth}`)
            }
          })
          .catch(err => {
            console.log(err)
            setFormData({
              ...formData,
              cardError: 'Payment server error. Please try again later.'
            })
            setLoading(false)
          })
      } else if (paymentMethod === 'crypto') {
        const variables = {
          listingID,
          value: tokenStatus.tokenValue,
          currency: token,
          from: get(walletStatusData, 'web3.metaMaskAccount.id'),
          quantity: 1,
          autoswap: true,
          encryptedData: hash
        }
        setApproveOfferTx(true)
        setAuth(auth)
        makeOffer({ variables })
      } else if (paymentMethod === 'uphold') {
        fetch(`${config.backend}/uphold/pay`, {
          method: 'POST',
          credentials: 'include',
          headers: {
            Authorization: `bearer ${config.backendAuthToken}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            card: upholdCard,
            data: hash,
            amount: cart.total / 100
          })
        })
          .then(result => {
            if (result.error) {
              setFormData({ ...formData, cardError: result.error.message })
              setLoading(false)
            } else {
              history.push(`/order/${hash}?auth=${auth}`)
            }
          })
          .catch(err => {
            console.log(err)
            setFormData({
              ...formData,
              cardError: 'Payment server error. Please try again later.'
            })
            setLoading(false)
          })
      }
    }
    if (submit) {
      go()
    }
  }, [submit])

  const Feedback = formFeedback(formData)
  const FeedbackAddress = formFeedback(state)

  const price = {
    currency: { id: 'fiat-USD' },
    amount: String(cart.total / 100)
  }
  let paymentAmount = formatPrice(cart.total)

  let disabled = loading || !paymentMethod
  if (paymentMethod === 'crypto') {
    if (
      walletStatus !== 'ready' ||
      !token ||
      !tokenStatus.ready ||
      approveOfferTx
    ) {
      disabled = true
    }
    if (token) {
      paymentAmount = <Price price={price} target={token} />
    }
  }

  return (
    <form
      onSubmit={async e => {
        e.preventDefault()
        if (disabled) {
          return
        }
        const { valid, newState } = validate(state)
        setState(newState)
        if (!valid) {
          return
        }
        dispatch({ type: 'updateUserInfo', info: newState })
        setSubmit(true)
      }}
    >
      <div className="checkout-payment-method">
        {!hasCrypto ? null : (
          <>
            <label
              className={`radio${
                paymentMethod === 'crypto' ? '' : ' inactive'
              }`}
            >
              <input
                type="radio"
                name="paymentMethod"
                checked={paymentMethod === 'crypto'}
                onChange={() => {
                  setState({ billingDifferent: false })
                  dispatch({
                    type: 'updatePaymentMethod',
                    method: config.paymentMethods.find(m => m.id === 'crypto')
                  })
                }}
              />
              Crypto Currency
            </label>
            {paymentMethod === 'crypto' && (
              <div className="pl-4 pt-2">
                {walletStatus === 'ready' ? (
                  <TokenChooser
                    from={get(walletStatusData, 'web3.metaMaskAccount.id')}
                    value={token}
                    onChange={token => setToken(token)}
                    onTokenReady={(ready, tokenValue) =>
                      setTokenStatus({ ready, tokenValue })
                    }
                    price={price}
                  />
                ) : (
                  <CryptoWallet walletStatus={walletStatus} />
                )}
              </div>
            )}
          </>
        )}
        {!config.stripe ? null : (
          <label
            className={`radio align-items-center${
              paymentMethod === 'stripe' ? '' : ' inactive'
            }`}
          >
            <input
              type="radio"
              name="paymentMethod"
              checked={paymentMethod === 'stripe'}
              onChange={() =>
                dispatch({
                  type: 'updatePaymentMethod',
                  method: config.paymentMethods.find(m => m.id === 'stripe')
                })
              }
            />
            Credit Card
            {isMobile ? null : (
              <div className="cards">
                <div className="visa" />
                <div className="master" />
                <div className="amex" />
                <div className="discover" />
                and more...
              </div>
            )}
          </label>
        )}
        {paymentMethod === 'stripe' && (
          <div className="pl-4 pb-3 pt-3">
            {/*applePay && (
              <div className="one-click-pay">
                <PaymentRequestButtonElement
                  paymentRequest={paymentReq}
                  className="PaymentRequestButton"
                  style={{
                    paymentRequestButton: { theme: 'light', height: '64px' }
                  }}
                />
              </div>
            )*/}
            <div className="form-row">
              <CardElement
                className="form-control"
                style={{ base: { fontSize: '16px', lineHeight: '24px' } }}
              />
              {Feedback('card')}
              <img
                src="images/powered_by_stripe.svg"
                className="ml-auto mt-2"
              />
            </div>
          </div>
        )}

        <Uphold value={upholdCard} onChange={card => setUpholdCard(card)} />
      </div>
      {paymentMethod !== 'stripe' ? null : (
        <>
          <div className="mt-4 mb-3">
            <b>Billing Address</b>
            <div>
              Select the address that matches your card or payment method.
            </div>
          </div>
          <div className="checkout-payment-method">
            <label
              className={`radio ${
                state.billingDifferent ? 'inactive' : 'active'
              }`}
            >
              <input
                type="radio"
                name="billingDifferent"
                checked={state.billingDifferent ? false : true}
                onChange={() => setState({ billingDifferent: false })}
              />
              <div>
                <div>Same as shipping address</div>
              </div>
            </label>
            <label
              className={`radio ${
                state.billingDifferent ? 'active mb-3' : 'inactive'
              }`}
            >
              <input
                type="radio"
                name="billingDifferent"
                checked={state.billingDifferent ? true : false}
                onChange={() => setState({ billingDifferent: true })}
              />
              <div>
                <div>Use a different billing address</div>
              </div>
            </label>
            {!state.billingDifferent ? null : (
              <ShippingForm
                prefix="billing"
                {...{ state, setState, input, Feedback: FeedbackAddress }}
              />
            )}
          </div>
        </>
      )}
      <div className="actions">
        <Link to="/checkout/shipping">&laquo; Return to shipping</Link>
        <LoadingButton
          type="submit"
          className={`btn btn-primary btn-lg ${disabled ? ' disabled' : ''}`}
          loading={loading}
          children={
            offerTx ? (
              <WaitForTransaction hash={offerTx}>
                {() => (
                  <Execute
                    exec={() => {
                      history.push(`/order/${offerTx}?auth=${auth}`)
                    }}
                  >
                    Success
                  </Execute>
                )}
              </WaitForTransaction>
            ) : approveOfferTx ? (
              <>Awaiting approval...</>
            ) : (
              <>
                {`Pay `}
                {paymentAmount}
              </>
            )
          }
        />
      </div>
    </form>
  )
})

const Execute = ({ exec, children }) => {
  useEffect(() => {
    exec()
  }, [exec])
  return children
}

export default CreditCardForm

require('react-styl')(`
  .checkout-payment-method
    border: 1px solid #eee
    border-radius: 0.5rem
    padding: 1rem
    label
      margin-bottom: 0
    label .description
      font-size: 0.875rem
      color: #666
    label.inactive
      cursor: pointer
      &:hover
        color: #666
    label:not(:first-child)
      border-top: 1px solid #eee
      margin-top: 1rem
      padding-top: 1rem
    .radio
      display: flex
      align-items: baseline
      input
        margin-right: 0.5rem
        margin-bottom: 3px
      .cards
        margin-left: auto
        display: flex
        font-size: 12px
        color: #737373
        align-items: center
        > div
          width: 38px
          height: 24px
          margin-right: 4px
          &.visa
            background: url(images/visa.svg)
          &.master
            background: url(images/master.svg)
          &.amex
            background: url(images/amex.svg)
          &.discover
            background: url(images/discover.svg)
          &:last-child
            margin-right: 8px

`)
