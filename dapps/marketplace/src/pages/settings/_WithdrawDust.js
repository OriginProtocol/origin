import React, { useState } from 'react'

import { fbt } from 'fbt-runtime'

import withWalletBalances from 'hoc/withWalletBalances'
import withCanTransact from 'hoc/withCanTransact'

import mutation from 'mutations/WithdrawDust'
import { useMutation } from 'react-apollo'

import TransactionError from 'components/TransactionError'
import WaitForTransaction from 'components/WaitForTransaction'
import supportedTokens from '@origin/graphql/src/utils/supportedTokens'

const WithdrawDust = ({
  wallet,
  currencies,
  refetchCurrencies,
  cannotTransact,
  cannotTransactData
}) => {
  const [error, setError] = useState(null)
  const [errorData, setErrorData] = useState(null)
  const [waitFor, setWaitFor] = useState(null)
  const [loading, setLoading] = useState(false)
  const [withdrawDustMutation] = useMutation(mutation)

  if (!currencies.length) {
    // Don't render this section if there is nothing to show
    return null
  }

  return (
    <>
      {error && (
        <TransactionError
          reason={error}
          data={errorData}
          onClose={() => {
            setError(null)
            setErrorData(null)
          }}
        />
      )}
      {waitFor && (
        <WaitForTransaction
          hash={waitFor}
          onClose={async () => {
            setWaitFor(null)
            await refetchCurrencies()
          }}
        >
          {() => (
            <div className="make-offer-modal success">
              <div className="success-icon-lg" />
              <h5>
                <fbt desc="success">Success!</fbt>
              </h5>
              <div className="help">
                <fbt desc="update.movedToWallet">
                  Funds have been moved to your wallet address
                </fbt>
              </div>
              <button
                href="#"
                className="btn btn-outline-light"
                onClick={() => setWaitFor(null)}
                children={fbt('OK', 'OK')}
              />
            </div>
          )}
        </WaitForTransaction>
      )}
      <div className="withdraw-dust">
        <div className="title">
          <fbt desc="WithdrawDust.title">Proxy Balances</fbt>
        </div>
        <div className="balances">
          {currencies.map(({ id, balance, code }) => {
            return (
              <div className="token-balance" key={code}>
                <div className="token">{`${balance} ${code}`}</div>
                <div className="actions">
                  <button
                    disabled={loading === id || Number(balance) <= 0}
                    className="btn btn-primary btn-sm"
                    onClick={async () => {
                      if (cannotTransact) {
                        setError(cannotTransact)
                        setErrorData(cannotTransactData)
                        return
                      }

                      try {
                        setLoading(id)
                        setWaitFor('pending')
                        const { data } = await withdrawDustMutation({
                          variables: {
                            currency: id,
                            amount: balance,
                            from: wallet
                          }
                        })
                        setWaitFor(data.withdrawDust.id)
                      } catch (e) {
                        console.error(e)
                        setError('mutation')
                        setErrorData(e)
                        setWaitFor(null)
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
    </>
  )
}

export default withCanTransact(
  withWalletBalances(
    WithdrawDust,
    supportedTokens,
    'walletProxy'
  )
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
