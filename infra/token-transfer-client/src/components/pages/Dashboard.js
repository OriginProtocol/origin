import React, { Component } from 'react'
import { connect } from 'react-redux'
import moment from 'moment'

import BalanceCard from '../BalanceCard'
import NewsHeadlinesCard from '../NewsHeadlinesCard'
import VestingBars from '../VestingBars'
import VestingHistory from '../VestingHistory'
import GrantDetails from '../GrantDetail'

class Dashboard extends Component {
  constructor(props) {
    super(props)

    const history = [
      ...Array(moment('2019-10-10').diff(moment('2018-10-10'), 'months'))
    ].map((v, i) => {
      return {
        amount: 1000,
        date: moment('2018-10-10').add(i, 'months')
      }
    })

    this.state = {
      grants: [
        {
          id: 1,
          start: moment('2018-10-10'),
          end: moment('2021-10-10'),
          cliff: moment('2019-10-10'),
          cancelled: false,
          amount: 11125000,
          interval: 'days'
        },
        {
          id: 2,
          start: moment('2020-05-05'),
          end: moment('2024-05-05'),
          cliff: moment('2021-05-05'),
          cancelled: false,
          amount: 10000000,
          interval: 'days'
        }
      ],
      history
    }
  }

  componentDidMount() {
    this.refreshDashboard()
  }

  refreshDashboard = () => {}

  render() {
    return (
      <>
        <div className="row">
          <div className="col">
            <BalanceCard balance={11112500} />
          </div>
          <div className="col">
            <NewsHeadlinesCard />
          </div>
        </div>
        <div className="row">
          <div className="col">
            <VestingBars grants={this.state.grants} />
          </div>
        </div>
        <div className="row">
          <div className="col">
            <VestingHistory history={this.state.history} />
          </div>
          <div className="col">
            <GrantDetails grants={this.state.grants} />
          </div>
        </div>
      </>
    )
  }
}

const mapStateToProps = () => {
  return {}
}

const mapDispatchToProps = () => {
  return {}
}

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(Dashboard)
