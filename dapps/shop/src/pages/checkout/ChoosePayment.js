import React, { useState, useEffect } from 'react'
import { useQuery, useMutation } from '@apollo/react-hooks'
import { useHistory } from 'react-router-dom'
import get from 'lodash/get'

import {
  PaymentRequestButtonElement,
  CardElement,
  injectStripe
} from 'react-stripe-elements'

import { formFeedback } from 'utils/formHelpers'
import formatPrice from 'utils/formatPrice'
import getWalletStatus from 'utils/walletStatus'
import { useStateValue } from 'data/state'
import submitStripePayment from 'data/submitStripePayment'
import PaymentMethods from 'data/PaymentMethods'
import addData from 'data/addData'

import WalletStatus from 'queries/WalletStatus'
import MakeOffer from 'mutations/MakeOffer'
import AllowToken from 'mutations/AllowToken'

import Price from 'components/Price'
import Link from 'components/Link'
import WithPrices from 'components/WithPrices'

import CryptoWallet from './CryptoWallet'
import WaitForTransaction from '../../components/WaitForTransaction'

const ListingId = process.env.LISTING_ID
const MarketplaceContract = process.env.MARKETPLACE_CONTRACT

const CreditCardForm = injectStripe(({ stripe }) => {
  // const [paymentMethod, setPaymentMethod] = useState()
  const [token, setToken] = useState()
  const [tokenStatus, setTokenStatus] = useState({})
  const [formData, setFormData] = useState({})
  const [loading, setLoading] = useState(false)
  const [applePay, setApplePay] = useState(false)
  const [paymentReq, setPaymentReq] = useState()
  const [{ cart }, dispatch] = useStateValue()
  const [approveOfferTx, setApproveOfferTx] = useState()
  const [auth, setAuth] = useState()
  const [offerTx, setOfferTx] = useState()
  const history = useHistory()
  const paymentMethod = get(cart, 'paymentMethod.id')

  const { data: walletStatusData, loading: walletLoading } = useQuery(
    WalletStatus,
    {
      notifyOnNetworkStatusChange: true,
      skip: paymentMethod !== 'crypto'
    }
  )

  const walletStatus = getWalletStatus(walletStatusData, walletLoading)

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

      paymentRequest.canMakePayment().then(result => {
        setApplePay(!!result)
      })

      setPaymentReq(paymentRequest)
    } catch (e) {
      console.log('paymentRequest error', e)
    }
  }, [stripe, paymentMethod])

  const Feedback = formFeedback(formData)

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

        setLoading(true)
        const encryptedData = await addData(cart)
        const { auth, hash } = encryptedData

        if (paymentMethod === 'stripe') {
          submitStripePayment({ stripe, cart, encryptedData })
            .then(result => {
              if (result.error) {
                setFormData({ ...formData, cardError: result.error.message })
                setLoading(false)
              } else {
                console.log('Success!', result)
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
            listingID: ListingId,
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
        }
      }}
    >
      <div className="checkout-payment-method">
        <label
          className={`radio${paymentMethod === 'crypto' ? '' : ' inactive'}`}
        >
          <input
            type="radio"
            name="paymentMethod"
            checked={paymentMethod === 'crypto'}
            onChange={() =>
              dispatch({
                type: 'updatePaymentMethod',
                method: PaymentMethods.find(m => m.id === 'crypto')
              })
            }
          />
          Crypto Currency
        </label>
        {paymentMethod === 'crypto' && (
          <div className="pl-4 pt-2">
            {walletStatus === 'ready' ? (
              <CryptoChooser
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
        <label
          className={`radio${paymentMethod === 'stripe' ? '' : ' inactive'}`}
        >
          <input
            type="radio"
            name="paymentMethod"
            checked={paymentMethod === 'stripe'}
            onChange={() =>
              dispatch({
                type: 'updatePaymentMethod',
                method: PaymentMethods.find(m => m.id === 'stripe')
              })
            }
          />
          Credit Card
        </label>
        {paymentMethod === 'stripe' && (
          <div className="pl-4 pb-3 pt-2">
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
            </div>
          </div>
        )}
      </div>
      <div className="actions">
        <Link to="/checkout/shipping">&laquo; Return to shipping</Link>
        <button
          type="submit"
          className={`btn btn-primary btn-lg ${disabled ? ' disabled' : ''}`}
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
              'Awaiting approval...'
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

const CryptoChooser = ({ price, value, onChange, onTokenReady, from }) => {
  const [approveUnlockTx, setApproveUnlockTx] = useState()
  const [unlockTx, setUnlockTx] = useState()
  const [allowToken] = useMutation(AllowToken, {
    onCompleted: arg => {
      setUnlockTx(arg.updateTokenAllowance.id)
    },
    onError: errorData => {
      console.log(errorData)
      setApproveUnlockTx(false)
    }
  })

  return (
    <WithPrices
      price={price}
      targets={['token-ETH', 'token-DAI', 'fiat-USD']}
      allowanceTarget={MarketplaceContract}
    >
      {({ tokenStatus, refetchBalances }) => {
        // console.log({ tokenStatus, suggestedToken })
        const token = tokenStatus[value]
        useEffect(() => {
          if (token) {
            const ready = token.hasBalance && token.hasAllowance
            onTokenReady(ready, token.value)
          }
        }, [value, from, get(token, 'hasBalance'), get(token, 'hasAllowance')])
        return (
          <div className="crypto-chooser">
            <div className="tokens">
              <div
                className={value === 'token-ETH' ? 'active' : ''}
                onClick={() => onChange('token-ETH')}
              >
                <div>Pay with ETH </div>
                <div>
                  <Price price={price} target="token-ETH" />
                </div>
                <div className="sm">
                  <Price
                    prefix="1 ETH = "
                    price={{ currency: 'token-ETH', amount: '1' }}
                    target="fiat-USD"
                  />
                </div>
              </div>
              <div
                className={value === 'token-DAI' ? 'active' : ''}
                onClick={() => onChange('token-DAI')}
              >
                <div>Pay with DAI</div>
                <div>
                  <Price price={price} target="token-DAI" />
                </div>
              </div>
            </div>
            {!token ? null : !token.hasBalance ? (
              <div className="alert alert-danger mt-3 mb-0">
                Insufficient balance
              </div>
            ) : !token.hasAllowance ? (
              <div className="alert alert-info mt-3 mb-0 d-flex align-items-center">
                Please unlock your DAI to continue
                <button
                  className={`btn btn-primary btn-sm ml-3${
                    approveUnlockTx ? ' disabled' : ''
                  }`}
                  onClick={() => {
                    if (approveUnlockTx) {
                      return false
                    }
                    setApproveUnlockTx(true)
                    allowToken({
                      variables: {
                        to: MarketplaceContract,
                        token: value,
                        from,
                        value: token.value
                      }
                    })
                  }}
                >
                  {unlockTx ? (
                    <WaitForTransaction hash={unlockTx}>
                      {() => <Execute exec={refetchBalances}>Done!</Execute>}
                    </WaitForTransaction>
                  ) : approveUnlockTx ? (
                    'Awaiting approval...'
                  ) : (
                    'Unlock'
                  )}
                </button>
              </div>
            ) : null}
          </div>
        )
      }}
    </WithPrices>
  )
}

export default CreditCardForm

require('react-styl')(`
  .crypto-chooser
    .tokens
      display: flex
      > div
        border: 1px solid #eee
        padding: 1rem
        border-radius: 0.5rem
        margin-right: 1rem
        cursor: pointer
        text-align: center
        opacity: 0.75
        &:hover
          opacity: 1
        &.active
          opacity: 1
          border-color: #007bff
        .sm
          font-size: 0.75rem
          margin-top: 0.25rem
  .checkout-payment-method
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
  @media (max-width: 767.98px)
    .crypto-chooser
      .tokens
        flex-direction: column
        > div:not(:last-child)
          margin-bottom: 1rem

`)
