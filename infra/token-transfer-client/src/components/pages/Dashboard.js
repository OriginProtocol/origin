import React, { useEffect } from 'react'
import { connect } from 'react-redux'
import { bindActionCreators } from 'redux'
import moment from 'moment'

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
import { fetchTransfers } from '@/actions/transfer'
import {
  getIsLoading as getTransferIsLoading,
  getWithdrawnAmount
} from '@/reducers/transfer'
import { unlockDate } from '@/constants'
import BalanceCard from '@/components/BalanceCard'
import NewsHeadlinesCard from '@/components/NewsHeadlinesCard'
import VestingBars from '@/components/VestingBars'
import VestingHistory from '@/components/VestingHistory'
import GrantDetails from '@/components/GrantDetail'

const Dashboard = props => {
  useEffect(() => {
    props.fetchAccounts(), props.fetchTransfers(), props.fetchGrants()
  }, [])

  if (
    props.accountIsLoading ||
    props.transferIsLoading ||
    props.grantIsLoading
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
        <div className="col-12 col-lg-6">
          <BalanceCard
            balance={vestedTotal.minus(props.withdrawnAmount)}
            accounts={props.accounts}
            isLocked={isLocked}
          />
        </div>
        <div className="col-12 col-lg-6">
          <NewsHeadlinesCard />
        </div>
      </div>
      {props.grants.length > 0 ? (
        <>
          <div className="row my-4">
            <div className="col">
              <VestingBars
                grants={props.grants}
                user={props.user}
                vested={vestedTotal}
                unvested={unvestedTotal}
              />
            </div>
          </div>
          <div className="row">
            <div className="col-12 col-lg-6 mb-5">
              <VestingHistory grants={props.grants} isLocked={isLocked} />
            </div>
            {!props.user.employee && (
              <div className="col-12 col-lg-6 mb-5">
                <GrantDetails grants={props.grants} />
              </div>
            )}
          </div>
        </>
      ) : (
        <div className="row my-4">
          <div className="col empty">You don&apos;t have any token grants</div>
        </div>
      )}
    </>
  )
}

const mapStateToProps = ({ account, grant, transfer }) => {
  return {
    accounts: getAccounts(account),
    accountIsLoading: getAccountIsLoading(account),
    grants: getGrants(grant),
    grantIsLoading: getGrantIsLoading(grant),
    grantTotals: getGrantTotals(grant),
    transferIsLoading: getTransferIsLoading(transfer),
    withdrawnAmount: getWithdrawnAmount(transfer)
  }
}

const mapDispatchToProps = dispatch =>
  bindActionCreators(
    {
      fetchAccounts: fetchAccounts,
      fetchGrants: fetchGrants,
      fetchTransfers: fetchTransfers
    },
    dispatch
  )

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(Dashboard)
