import React, { Component } from 'react'
import { connect } from 'react-redux'

import { hideAlert } from 'actions/Alert'

class Alert extends Component {
  constructor(props) {
    super(props)
    this.state = { show: props.show, className: '' }
  }

  componentDidUpdate(prevProps) {
    if (!prevProps.show && this.props.show) {
      this.show()
    }
  }

  componentWillUnmount() {
    clearTimeout(this.showTimeout)
    clearTimeout(this.hideTimeout)
  }

  show() {
    this.setState({ show: true })
    this.showTimeout = setTimeout(() => {
      this.setState({ className: ' origin-alert-show' })
    }, 10)
    this.hideTimeout = setTimeout(() => this.hide(), 2000)
  }

  hide() {
    clearTimeout(this.hideTimeout)
    this.setState({ className: '' })
    this.hideTimeout = setTimeout(() => this.props.hideAlert(), 500)
  }

  render() {
    if (!this.props.show) {
      return null
    }

    const { className } = this.state
    return (
      <div className={`origin-alert${className}`} onClick={() => this.hide()}>
        {this.props.message}
      </div>
    )
  }
}

const mapStateToProps = state => ({
  message: state.alert.message,
  show: state.alert.show
})

const mapDispatchToProps = dispatch => ({
  hideAlert: () => dispatch(hideAlert())
})

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(Alert)
