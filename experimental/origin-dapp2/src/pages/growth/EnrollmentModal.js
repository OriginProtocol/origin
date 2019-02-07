import React, { Component } from 'react'
import Modal from 'components/Modal'

class EnrollmentModal extends Component {
  state = {
    stage: 'EligibilityCheck'
  }

  renderEligibilityCheck() {
    return <div>TODO: implement modal contents</div>
  }

  render() {
    return (
      <Modal
        className="growth-enrollment-modal"
        shouldClose={this.state.shouldClose}
        onClose={() => {
          this.setState({
            shouldClose: false,
            stage: 'EligibilityCheck'
          })
        }}
      >
        {this[`render${this.state.stage}`]()}
      </Modal>
    )
  }
}

export default EnrollmentModal

require('react-styl')(`
  .growth-enrollment-modal
    padding-top: 20px;
`)
