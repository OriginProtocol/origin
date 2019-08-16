import React, { useEffect } from 'react'
import { connect } from 'react-redux'
import { bindActionCreators } from 'redux'

import { momentizeGrant } from '@origin/token-transfer-server/src/lib/vesting'

import { fetchGrants } from '@/actions/grant'
import BalanceCard from '@/components/BalanceCard'
import NewsHeadlinesCard from '@/components/NewsHeadlinesCard'
import VestingBars from '@/components/VestingBars'
import VestingHistory from '@/components/VestingHistory'
import GrantDetails from '@/components/GrantDetail'

const Dashboard = props => {
  useEffect(props.fetchGrants, [])

  const grants = props.grant.grants.map(momentizeGrant)

  const vestedTotal = grants.reduce((total, currentGrant) => {
    return total + currentGrant.vestedAmount
  }, 0)

  const unvestedTotal =
    grants.reduce((total, currentGrant) => {
      return total + currentGrant.amount
    }, 0) - vestedTotal

  if (props.grant.isFetching) {
    return (
      <div className="spinner-grow" role="status">
        <span className="sr-only">Loading...</span>
      </div>
    )
  }

  return (
    <>
      <div className="row">
        <div className="col-12 col-lg-6">
          <BalanceCard balance={vestedTotal} />
        </div>
        <div className="col-12 col-lg-6">
          <NewsHeadlinesCard />
        </div>
      </div>
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
          <VestingHistory grants={grants} />
        </div>
        <div className="col-12 col-lg-6">
          <GrantDetails grants={grants} />
        </div>
      </div>
    </>
  )
}

const mapStateToProps = ({ grant }) => {
  return { grant }
}

const mapDispatchToProps = dispatch =>
  bindActionCreators(
    {
      fetchGrants: fetchGrants
    },
    dispatch
  )

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(Dashboard)
