import React, { useState } from 'react'

import { fbt } from 'fbt-runtime'

import withWalletBalances from 'hoc/withWalletBalances'

import mutation from 'mutations/WithdrawDust'
import { useMutation } from 'react-apollo'

const WithdrawDust = ({ wallet, currencies }) => {
  const [withdrawDust] = useMutation(mutation)
  const [error, setError] = useState(false)
  const [loading, setLoading] = useState(false)

  if (
    !currencies.length ||
    !currencies.some(({ balance }) => Number(balance) > 0)
  ) {
    // Don't render this section if there is nothing to show
    return null
  }

  return (
    <div className="withdraw-dust">
      <div className="title">
        <fbt desc="WithdrawDust.title">Withdraw Dust</fbt>
      </div>
      {!error ? null : <div className="alert alert-danger">{error}</div>}
      <div className="balances">
        {currencies.map(({ id, balance, code }) => {
          if (Number(balance) <= 0) {
            return null
          }

          return (
            <div className="token-balance" key={code}>
              <div className="token">{`${balance} ${code}`}</div>
              <div className="actions">
                <button
                  disabled={loading === id}
                  className="btn btn-primary btn-sm"
                  onClick={async () => {
                    try {
                      setLoading(id)
                      setError(false)
                      await withdrawDust({
                        variables: {
                          currency: id,
                          amount: balance,
                          from: wallet
                        }
                      })
                    } catch (e) {
                      console.error(e)
                      setError('Check console')
                    }
                    setLoading(false)
                  }}
                >
                  {loading === id ? (
                    <fbt desc="Loading...">Loading...</fbt>
                  ) : (
                    <fbt desc="Withdraw">Withdraw</fbt>
                  )}
                </button>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}

export default withWalletBalances(
  WithdrawDust,
  ['token-ETH', 'token-DAI', 'token-OGN'],
  'walletProxy'
)

require('react-styl')(`
  .withdraw-dust
    padding: 1.5rem 2rem
    .title
      font-size: 1.125rem
      margin-bottom: 1rem
    .balances
      font-size: 0.875rem
      .token-balance
        margin-bottom: 0.75rem
        display: flex
        align-items: center
        .token
          flex: 1
        .actions
          flex: auto 0 0
`)
