import React, { Component } from 'react'
import { connect } from 'react-redux'

class Security extends Component {
  constructor(props) {
    super(props)
    this.state = { events: [] }
  }

  componentDidMount() {
    this.refreshSecurity()
  }

  refreshSecurity = () => {}

  render() {
    return <div>Security</div>
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
)(Security)
