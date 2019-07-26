import React, { Component } from 'react'
import { connect } from 'react-redux'

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
    return <div>Dashboard</div>
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
