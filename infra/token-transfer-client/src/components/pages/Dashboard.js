import React, { Component } from 'react'
import { connect } from 'react-redux'
import moment from 'moment'
import { bindActionCreators } from 'redux'

import { fetchGrants } from '../../actions/grant'
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
      history
    }
  }

  componentDidMount() {
    this.props.fetchGrants()
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
            {!this.props.isFetching && (
              <VestingBars grants={this.props.grants} />
            )}
          </div>
        </div>
        <div className="row">
          <div className="col">
            <VestingHistory history={this.state.history} />
          </div>
          <div className="col">
            <GrantDetails grants={this.props.grants} />
          </div>
        </div>
      </>
    )
  }
}

const mapStateToProps = ({ grant }) => {
  return {
    isFetching: grant.isFetching,
    grants: grant.grants,
    error: grant.error
  }
}

const mapDispatchToProps = dispatch => bindActionCreators({
  fetchGrants: fetchGrants
}, dispatch)

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(Dashboard)
