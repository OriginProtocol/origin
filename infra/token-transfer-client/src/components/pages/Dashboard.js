import React, { Component } from 'react'
import { connect } from 'react-redux'

import BalanceCard from '../BalanceCard'
import NewsHeadlinesCard from '../NewsHeadlinesCard'


class Dashboard extends Component {
  constructor(props) {
    super(props)
    this.state = { events: [] }
  }

  componentDidMount() {
    this.refreshDashboard()
  }

  refreshDashboard = () => {}

  render() {
    return (
      <div className="row">
        <div className="col">
          <BalanceCard balance={1112500} />
        </div>
        <div className="col">
          <NewsHeadlinesCard />
        </div>
      </div>
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
