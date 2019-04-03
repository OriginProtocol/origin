import React, { useState } from 'react'
import get from 'lodash/get'
import { fbt } from 'fbt-runtime'

import Price from 'components/Price'
import Buy from './mutations/Buy'
import WithPrices from 'components/WithPrices'
import PaymentOptions from './_PaymentOptions'

const SingleUnit = ({ listing, from, refetch }) => {
  const acceptsDai = listing.acceptedTokens.find(t => t.id === 'token-DAI')
  const [token, setToken] = useState(acceptsDai ? 'token-DAI' : 'token-ETH')
  return (
    <WithPrices
      price={listing.price}
      target={token}
      targets={['token-ETH', 'token-DAI', listing.price.currency.id]}
    >
      {({ prices, tokenStatus }) => {
        if (!prices) return null
        return (
          <div className="listing-buy">
            <div className="price">
              <Price listing={listing} descriptor />
            </div>
            <PaymentOptions
              tokens={prices}
              price={listing.price}
              acceptedTokens={listing.acceptedTokens}
              value={token}
              onChange={setToken}
              hasBalance={tokenStatus.hasBalance}
              hasEthBalance={tokenStatus.hasEthBalance}
            >
              <Buy
                refetch={refetch}
                listing={listing}
                from={from}
                value={get(prices, `${token}.amount`)}
                quantity={1}
                currency={token}
                tokenStatus={tokenStatus}
                className="btn btn-primary"
                children={fbt('Purchase', 'Purchase')}
              />
            </PaymentOptions>
          </div>
        )
      }}
    </WithPrices>
  )
}

export default SingleUnit
