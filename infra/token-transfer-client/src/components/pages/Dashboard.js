import React, { Component } from 'react'
import { connect } from 'react-redux'
import { bindActionCreators } from 'redux'

import { momentizeGrant } from '@origin/token-transfer-server/src/lib/vesting'

import { fetchGrants } from '@/actions/grant'
import { fetchUser } from '@/actions/user'
import BalanceCard from '@/components/BalanceCard'
import NewsHeadlinesCard from '@/components/NewsHeadlinesCard'
import VestingBars from '@/components/VestingBars'
import VestingHistory from '@/components/VestingHistory'
import GrantDetails from '@/components/GrantDetail'

class Dashboard extends Component {
  constructor(props) {
    super(props)
  }

  componentDidMount() {
    this.props.fetchGrants()
    this.props.fetchUser()
  }

  isLoading = () => {
    return this.props.grant.isFetching || this.props.user.isFetching
  }

  renderLoading() {
    return (
      <div className="spinner-grow" role="status">
        <span className="sr-only">Loading...</span>
      </div>
    )
  }

  render() {
    if (this.isLoading()) {
      return this.renderLoading()
    }

    const grants = this.props.grant.grants.map(momentizeGrant)

    const vestedTotal = grants.reduce((total, currentGrant) => {
      return total + currentGrant.vestedAmount
    }, 0)

    return (
      <>
        <div className="row">
          <div className="col-6">
            <BalanceCard balance={vestedTotal} />
          </div>
          <div className="col-6">
            <NewsHeadlinesCard />
          </div>
        </div>
        <div className="row">
          <div className="col">
            <VestingBars grants={grants} />
          </div>
        </div>
        <div className="row">
          <div className="col">
            <VestingHistory grants={grants} />
          </div>
          <div className="col">
            <GrantDetails grants={grants} />
          </div>
        </div>
      </>
    )
  }
}

const mapStateToProps = ({ grant, user }) => {
  return { grant, user }
}

const mapDispatchToProps = dispatch =>
  bindActionCreators(
    {
      fetchGrants: fetchGrants,
      fetchUser: fetchUser
    },
    dispatch
  )

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(Dashboard)
