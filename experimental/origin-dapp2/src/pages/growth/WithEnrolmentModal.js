import React, { Component, Fragment } from 'react'
import Modal from 'components/Modal'
import { Query } from 'react-apollo'
import query from 'queries/GrowthEligibility'
import QueryError from 'components/QueryError'

function withEnrolmentModal(WrappedComponent) {
  return class WithEnrolmentModal extends Component {
    constructor(props) {
      super(props)
      this.handleClick = this.handleClick.bind(this)
    }

    state = {
      open: false,
      stage: 'EligibilityCheck'
    }

    handleClick(e) {
      e.preventDefault()
      this.setState({
        open: true
      })
    }

    renderEligibilityCheck() {
      return (
        <Query query={query}>
        {({ networkStatus, error, loading, data, refetch }) => {
          if (networkStatus === 1 || loading)
            return `Loading...`
          else if (error) {
            return <QueryError error={error} query={query} />
          } else if (!data || !data.isEligible || data.isEligible.code !== '200') {
            if (data && data.isEligible){
              console.error(`Unexpected result received. Code: ${data.isEligible.code} message: ${data.isEligible.message}`)
            }
            return 'Something is wrong, please try again later.'
          }

          const { country, eligibility } = data.isEligible
          if (eligibility === 'Eligible') {
            return (
              <div>
                TODO: show agreement signing
              </div>
            )
          } else if (eligibility === 'Restricted') {
            return (
              <div>
                TODO: show allowed country graphic
              </div>
            )
          } else if (eligibility === 'Forbidden') {
            return (
              <div>
                TODO: show forbidden country graphic
              </div>
            )
          }
        }}
        </Query>
      )
    }

    render() {
      const { open } = this.state
      return (
        <Fragment>
          <WrappedComponent
            {...this.props}
            onClick={this.handleClick}
          />
          {open && <Modal
            className="growth-enrollment-modal"
            onClose={() => {
              this.setState({
                open: false
              })
            }}
          >
            {this[`render${this.state.stage}`]()}
          </Modal>}
        </Fragment>
      )
    }
  }
}

export default withEnrolmentModal

require('react-styl')(`
  .growth-enrollment-modal
    padding-top: 20px;
`)
