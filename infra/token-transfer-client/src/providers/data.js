import React, { createContext, useEffect } from 'react'
import { connect } from 'react-redux'
import { bindActionCreators } from 'redux'

import { fetchAccounts } from '@/actions/account'
import {
  getAccounts,
  getIsLoading as getAccountIsLoading
} from '@/reducers/account'
import { fetchConfig } from '@/actions/config'
import {
  getConfig,
  getIsLoading as getConfigIsLoading
} from '@/reducers/config'
import { fetchGrants } from '@/actions/grant'
import {
  getGrants,
  getIsLoading as getGrantIsLoading,
  getTotals as getGrantTotals
} from '@/reducers/grant'
import { fetchLockups } from '@/actions/lockup'
import {
  getLockups,
  getIsLoading as getLockupIsLoading,
  getTotals as getLockupTotals
} from '@/reducers/lockup'
import { fetchTransfers } from '@/actions/transfer'
import {
  getTransfers,
  getIsLoading as getTransferIsLoading,
  getWithdrawn
} from '@/reducers/transfer'

export const DataContext = createContext()

const _DataProvider = ({ children, ...rest }) => {
  useEffect(() => {
    rest.fetchAccounts(),
      rest.fetchConfig(),
      rest.fetchGrants(),
      rest.fetchLockups(),
      rest.fetchTransfers()
  }, [])

  if (
    rest.accountIsLoading ||
    rest.configIsLoading ||
    rest.transferIsLoading ||
    rest.grantIsLoading ||
    rest.lockupIsLoading
  ) {
    return (
      <div className="spinner-grow" role="status">
        <span className="sr-only">Loading...</span>
      </div>
    )
  }

  // Calculate balances
  const balance = rest.grantTotals.vested
    // Subtract any withdrawn
    .minus(rest.withdrawn)
    // Subtract any locked tokens
    .minus(rest.lockupTotals.locked)
    // Earnings from lockups that are unlocked
    .plus(rest.lockupTotals.unlockedEarnings)

  const configOverrides = window.localStorage.configOverrides
    ? JSON.parse(window.localStorage.configOverrides)
    : {}

  const value = {
    accounts: rest.accounts,
    config: {
      ...rest.config,
      ...configOverrides
    },
    lockups: rest.lockups,
    grants: rest.grants,
    transfers: rest.transfers,
    totals: {
      ...rest.grantTotals,
      ...rest.lockupTotals,
      withdrawn: rest.withdrawn,
      balance
    }
  }

  return <DataContext.Provider value={value}>{children}</DataContext.Provider>
}

const mapStateToProps = ({
  account,
  config,
  grant,
  lockup,
  transfer,
  user
}) => {
  return {
    accounts: getAccounts(account),
    config: getConfig(config),
    grants: getGrants(grant),
    lockups: getLockups(lockup),
    transfers: getTransfers(transfer),
    accountIsLoading: getAccountIsLoading(account),
    configIsLoading: getConfigIsLoading(config),
    grantIsLoading: getGrantIsLoading(grant),
    lockupIsLoading: getLockupIsLoading(lockup),
    transferIsLoading: getTransferIsLoading(transfer),
    withdrawn: getWithdrawn(transfer),
    grantTotals: getGrantTotals(user.user, grant),
    lockupTotals: getLockupTotals(lockup)
  }
}

const mapDispatchToProps = dispatch =>
  bindActionCreators(
    {
      fetchAccounts: fetchAccounts,
      fetchConfig: fetchConfig,
      fetchGrants: fetchGrants,
      fetchLockups: fetchLockups,
      fetchTransfers: fetchTransfers
    },
    dispatch
  )

export const DataProvider = connect(
  mapStateToProps,
  mapDispatchToProps
)(_DataProvider)
