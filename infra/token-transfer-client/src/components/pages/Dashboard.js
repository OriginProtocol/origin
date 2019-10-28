import React, { useEffect } from 'react'
import { connect } from 'react-redux'
import { bindActionCreators } from 'redux'
import moment from 'moment'
import get from 'lodash.get'

import { fetchAccounts } from '@/actions/account'
import {
  getAccounts,
  getIsLoading as getAccountIsLoading
} from '@/reducers/account'
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
  getIsLoading as getTransferIsLoading,
  getWithdrawnAmount
} from '@/reducers/transfer'
import { unlockDate } from '@/constants'
import BalanceCard from '@/components/BalanceCard'
import NewsHeadlinesCard from '@/components/NewsHeadlinesCard'
import VestingCard from '@/components/VestingCard'
import GrantDetailCard from '@/components/GrantDetailCard'
import WithdrawalSummaryCard from '@/components/WithdrawalSummaryCard'
import BonusCard from '@/components/BonusCard'

const Dashboard = props => {
  useEffect(() => {
    props.fetchAccounts(),
      props.fetchGrants(),
      props.fetchLockups(),
      props.fetchTransfers()
  }, [])

  if (
    props.accountIsLoading ||
    props.transferIsLoading ||
    props.grantIsLoading ||
    props.lockupIsLoading
  ) {
    return (
      <div className="spinner-grow" role="status">
        <span className="sr-only">Loading...</span>
      </div>
    )
  }

  const isLocked = moment.utc() < unlockDate

  const { vestedTotal, unvestedTotal } = props.grantTotals

  return (
    <>
      <div className="row">
        <div className="col mb-4">
          <BalanceCard
            balance={vestedTotal.minus(props.withdrawnAmount)}
            accounts={props.accounts}
            locked={props.lockupTotals.locked}
            isLocked={isLocked}
            unlockDate={unlockDate}
          />
        </div>
      </div>
      <div className="row">
        <div className="col-12 col-xl-6 mb-4">
          <VestingCard
            grants={props.grants}
            user={props.user}
            vested={vestedTotal}
            unvested={unvestedTotal}
            isLocked={isLocked}
          />
        </div>
        <div className="col-12 col-xl-6 mb-4">
          <WithdrawalSummaryCard
            vested={vestedTotal}
            unvested={unvestedTotal}
            isLocked={isLocked}
            withdrawnAmount={props.withdrawnAmount}
          />
          <div className="mt-4">
            <BonusCard
              lockups={props.lockups}
              locked={props.lockupTotals.locked}
              earnings={props.lockupTotals.earnings}
              isLocked={isLocked}
            />
          </div>
        </div>
      </div>
      <div className="row">
        {!get(props.user, 'employee') && (
          <div className="col-12 col-lg-6 mb-5">
            <GrantDetailCard grants={props.grants} />
          </div>
        )}
        <div className="col-12 col-lg-6 mb-4">
          <NewsHeadlinesCard />
        </div>
      </div>
    </>
  )
}

const mapStateToProps = ({ account, grant, lockup, transfer }) => {
  return {
    accounts: getAccounts(account),
    accountIsLoading: getAccountIsLoading(account),
    grants: getGrants(grant),
    grantIsLoading: getGrantIsLoading(grant),
    grantTotals: getGrantTotals(grant),
    lockups: getLockups(lockup),
    lockupIsLoading: getLockupIsLoading(lockup),
    lockupTotals: getLockupTotals(lockup),
    transferIsLoading: getTransferIsLoading(transfer),
    withdrawnAmount: getWithdrawnAmount(transfer)
  }
}

const mapDispatchToProps = dispatch =>
  bindActionCreators(
    {
      fetchAccounts: fetchAccounts,
      fetchGrants: fetchGrants,
      fetchLockups: fetchLockups,
      fetchTransfers: fetchTransfers
    },
    dispatch
  )

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(Dashboard)
