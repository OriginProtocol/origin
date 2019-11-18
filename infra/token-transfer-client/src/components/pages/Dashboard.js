import React, { useEffect, useState } from 'react'
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
import BonusModal from '@/components/BonusModal'
import WithdrawModal from '@/components/WithdrawModal'
import { earnOgnEnabled } from '@/constants'

const Dashboard = props => {
  const [displayBonusModal, setDisplayBonusModal] = useState(false)
  const [displayWithdrawModal, setDisplayWithdrawModal] = useState(false)

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

  const { vestedTotal, unvestedTotal } = props.grantTotals
  const balanceAvailable = vestedTotal
    .minus(props.withdrawnAmount)
    .minus(props.lockupTotals.locked)
  const isLocked = !unlockDate || moment.utc() < unlockDate

  return (
    <>
      {displayBonusModal && (
        <BonusModal
          balance={balanceAvailable}
          onModalClose={() => setDisplayBonusModal(false)}
        />
      )}
      {displayWithdrawModal && (
        <WithdrawModal
          balance={props.balance}
          accounts={props.accounts}
          isLocked={props.isLocked}
          onModalClose={() => setDisplayWithdrawModal(false)}
        />
      )}

      <div className="row">
        <div className="col mb-4">
          <BalanceCard
            balance={balanceAvailable}
            accounts={props.accounts}
            locked={props.lockupTotals.locked}
            isLocked={isLocked}
            unlockDate={unlockDate}
            onDisplayBonusModal={() => setDisplayBonusModal(true)}
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
          {earnOgnEnabled ? (
            <BonusCard
              lockups={props.lockups}
              locked={props.lockupTotals.locked}
              earnings={props.lockupTotals.earnings}
              isLocked={isLocked}
              onDisplayBonusModal={() => setDisplayBonusModal(true)}
            />
          ) : (
            <NewsHeadlinesCard />
          )}
          <div className="mt-4">
            <WithdrawalSummaryCard
              vested={vestedTotal}
              unvested={unvestedTotal}
              isLocked={isLocked}
              withdrawnAmount={props.withdrawnAmount}
              onDisplayWithdrawModal={() => setDisplayWithdrawModal(true)}
            />
          </div>
        </div>
      </div>
      <div className="row">
        {!get(props.user, 'employee') && (
          <div className="col-12 col-lg-6 mb-5">
            <GrantDetailCard grants={props.grants} user={props.user} />
          </div>
        )}
        <div className="col-12 col-lg-6 mb-4">
          {earnOgnEnabled && <NewsHeadlinesCard />}
        </div>
      </div>
    </>
  )
}

const mapStateToProps = ({ account, grant, lockup, transfer, user }) => {
  return {
    accounts: getAccounts(account),
    accountIsLoading: getAccountIsLoading(account),
    grants: getGrants(grant),
    grantIsLoading: getGrantIsLoading(grant),
    grantTotals: getGrantTotals(user.user, grant),
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

export default connect(mapStateToProps, mapDispatchToProps)(Dashboard)
