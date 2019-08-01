import React, { Component } from 'react'
import { connect } from 'react-redux'

class History extends Component {
  constructor(props) {
    super(props)
    this.state = {}
  }

  componentDidMount() {
    this.refreshHistory()
  }

  refreshHistory = () => {}

  render() {
    return (
      <div>
        <h1>Withdrawal History</h1>
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
)(History)
