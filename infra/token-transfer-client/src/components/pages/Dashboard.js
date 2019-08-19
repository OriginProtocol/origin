import React, { useEffect } from 'react'
import { connect } from 'react-redux'
import { bindActionCreators } from 'redux'
import moment from 'moment'

import { momentizeGrant } from '@origin/token-transfer-server/src/lib/vesting'

import { fetchGrants } from '@/actions/grant'
import { getGrants, getIsLoading as getGrantIsLoading } from '@/reducers/grant'
import { fetchAccounts } from '@/actions/account'
import {
  getAccounts,
  getIsLoading as getAccountIsLoading
} from '@/reducers/account'
import { unlockDate } from '@/constants'
import BalanceCard from '@/components/BalanceCard'
import NewsHeadlinesCard from '@/components/NewsHeadlinesCard'
import VestingBars from '@/components/VestingBars'
import VestingHistory from '@/components/VestingHistory'
import GrantDetails from '@/components/GrantDetail'

const Dashboard = props => {
  useEffect(() => {
    props.fetchAccounts(), props.fetchGrants()
  }, [])

  if (props.accountIsLoading || props.grantIsLoading) {
    return (
      <div className="spinner-grow" role="status">
        <span className="sr-only">Loading...</span>
      </div>
    )
  }

  const isLocked = moment.utc() < unlockDate

  const grants = props.grants.map(momentizeGrant)
  const grantTotal = grants.reduce((total, currentGrant) => {
    return total + Number(currentGrant.amount)
  }, 0)
  const vestedTotal = grants.reduce((total, currentGrant) => {
    return isLocked ? 0 : total + Number(currentGrant.vestedAmount)
  }, 0)
  const unvestedTotal = grantTotal - vestedTotal

  return (
    <>
      <div className="row">
        <div className="col-12 col-lg-6">
          <BalanceCard
            balance={vestedTotal}
            accounts={props.accounts}
            isLocked={isLocked}
          />
        </div>
        <div className="col-12 col-lg-6">
          <NewsHeadlinesCard />
        </div>
      </div>
      {grants.length > 0 ? (
        <>
          <div className="row my-4">
            <div className="col">
              <VestingBars
                grants={grants}
                user={props.user}
                vested={vestedTotal}
                unvested={unvestedTotal}
              />
            </div>
          </div>
          <div className="row">
            <div className="col-12 col-lg-6 mb-4">
              <VestingHistory grants={grants} isLocked={isLocked} />
            </div>
            <div className="col-12 col-lg-6">
              <GrantDetails grants={grants} />
            </div>
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

const mapStateToProps = ({ account, grant }) => {
  return {
    accounts: getAccounts(account),
    accountIsLoading: getAccountIsLoading(account),
    grants: getGrants(grant),
    grantIsLoading: getGrantIsLoading(grant)
  }
}

const mapDispatchToProps = dispatch =>
  bindActionCreators(
    {
      fetchAccounts: fetchAccounts,
      fetchGrants: fetchGrants
    },
    dispatch
  )

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(Dashboard)
