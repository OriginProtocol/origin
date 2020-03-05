import React, { useState, useEffect } from 'react'
import { useMutation } from '@apollo/react-hooks'
import get from 'lodash/get'

import useConfig from 'utils/useConfig'
import AllowToken from 'mutations/AllowToken'

import WaitForTransaction from 'components/WaitForTransaction'
import WithPrices from 'components/WithPrices'
import Price from 'components/Price'

const MarketplaceContract = process.env.MARKETPLACE_CONTRACT

const DefaultTokens = [
  { id: 'token-OGN', name: 'OGN' },
  { id: 'token-DAI', name: 'DAI' },
  { id: 'token-ETH', name: 'ETH' }
]

const Execute = ({ exec, children }) => {
  useEffect(() => {
    exec()
  }, [exec])
  return children
}

const TokenChooser = ({ price, value, onChange, onTokenReady, from }) => {
  const { config } = useConfig()
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
  const acceptedTokens = config.acceptedTokens || DefaultTokens
  const selectedToken =
    acceptedTokens.find(t => t.id === value) || acceptedTokens[0]
  const acceptedTokenIds = acceptedTokens.map(t => t.id)

  return (
    <WithPrices
      price={price}
      targets={[...acceptedTokenIds, 'fiat-USD']}
      allowanceTarget={config.marketplaceContract || MarketplaceContract}
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
              {acceptedTokens.map(token => (
                <div
                  key={token.id}
                  className={value === token.id ? 'active' : ''}
                  onClick={() => onChange(token.id)}
                >
                  <div>{`Pay with ${token.name}`}</div>
                  <div>
                    <Price price={price} target={token.id} />
                  </div>
                  <div className="sm">
                    <Price
                      prefix={`1 ${token.name} = `}
                      price={{ currency: token.id, amount: '1' }}
                      target="fiat-USD"
                    />
                  </div>
                </div>
              ))}
            </div>
            {!token ? null : !token.hasBalance ? (
              <div className="alert alert-danger mt-3 mb-0">
                Insufficient balance
              </div>
            ) : !token.hasAllowance ? (
              <div className="alert alert-info mt-3 mb-0 d-flex align-items-center">
                {`Please unlock your ${selectedToken.name} to continue`}
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
                        to: config.marketplaceContract || MarketplaceContract,
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

export default TokenChooser


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

  @media (max-width: 767.98px)
    .crypto-chooser
      .tokens
        flex-direction: column
        > div:not(:last-child)
          margin-bottom: 1rem
`)