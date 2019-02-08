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
      this.handleNotCitizenClick = this.handleNotCitizenClick.bind(this)
      this.renderEligibilityCheck = this.renderEligibilityCheck.bind(this)
      this.handleEligibilityDone = this.handleEligibilityDone.bind(this)
      this.handleEligibilityContinue = this.handleEligibilityContinue.bind(this)
    }

    state = {
      open: false,
      stage: 'EligibilityCheck',
      notCitizenConfirmed: false
    }

    handleClick(e) {
      e.preventDefault()
      this.setState({
        open: true
      })
    }

    handleNotCitizenClick(e) {
      this.setState({ notCitizenConfirmed: e.target.checked })
    }

    handleEligibilityDone(e) {
      this.setState({
        open: false
      })
    }

    handleEligibilityContinue(e) {
      //TODO: go to terms screen
    }

    renderEligibilityCheck() {
      const { notCitizenConfirmed } = this.state
      const renderRestrictedModal = (country, eligibility) => {
        const isRestricted = eligibility === 'Restricted'
        const isForbidden = eligibility === 'Forbidden'

        return (
          <div>
            <div className="image-holder">
              <img className="" src="images/growth/earth-graphic.svg" />
              <img
                className="red-x-image"
                src="images/growth/red-x-graphic.svg"
              />
            </div>
            {isRestricted && (
              <Fragment>
                <div className="title mt-4">
                  Oops, {country} is not eligible
                </div>
                <div className="mt-3">
                  Unfortunately, it looks like you’re currently in a country
                  where government regulations do not allow you to participate
                  in Origin Campaigns.
                </div>
                <div className="mt-4 pt-2">
                  Did we detect your your country incorrectly?
                </div>
                <div className="mt-1 d-flex country-check-label">
                  <label className="pb-1 checkbox-holder">
                    <input
                      type="checkbox"
                      className="country-check"
                      onChange={this.handleNotCitizenClick}
                      value="cofirm-citizenship"
                    />
                    <span className="checkmark" />
                    &nbsp;
                  </label>
                  I certify I am not a citizen or resident of {country}
                </div>
                {!notCitizenConfirmed && (
                  <button
                    className="gray button: btn btn-outline-light"
                    onClick={this.handleEligibilityDone}
                    children="Done"
                  />
                )}
                {notCitizenConfirmed && (
                  <button
                    className="blue button: btn btn-primary btn-rounded btn-lg"
                    onClick={this.handleEligibilityContinue}
                    children="Continue"
                  />
                )}
              </Fragment>
            )}
          </div>
        )
      }
      return (
        <Query query={query}>
          {({ networkStatus, error, loading, data, refetch }) => {
            if (networkStatus === 1 || loading) return `Loading...`
            else if (error) {
              return <QueryError error={error} query={query} />
            }

            const { country, eligibility } = data.isEligible
            // const country = 'Canada'
            // const eligibility = 'Restricted'

            if (eligibility === 'Eligible') {
              return <div>TODO: show agreement signing</div>
            } else if (eligibility === 'Restricted') {
              return renderRestrictedModal(country, eligibility)
            } else if (eligibility === 'Forbidden') {
              return <div>TODO: show forbidden country graphic</div>
            }
          }}
        </Query>
      )
    }

    render() {
      const { open } = this.state
      return (
        <Fragment>
          <WrappedComponent {...this.props} onClick={this.handleClick} />
          {open && (
            <Modal
              className="growth-enrollment-modal"
              onClose={() => {
                this.setState({
                  open: false
                })
              }}
            >
              {this[`render${this.state.stage}`]()}
            </Modal>
          )}
        </Fragment>
      )
    }
  }
}

export default withEnrolmentModal
//margin-right: 10px;
//vertical-align: middle;
//margin-bottom: 5px;
require('react-styl')(`
  .growth-enrollment-modal .input:checked ~ .checkmark
      background-color: #2196F3;
  .growth-enrollment-modal
    padding-top: 20px;
    .title
      font-family: Poppins;
      font-size: 24px;
    .image-holder
      position: relative;
    .red-x-image
      position: absolute;
      right: 110px;
      bottom: 10px;
    .checkbox-holder input:checked ~ .checkmark:after
      display: block;
    .checkbox-holder
      display: block;
      position: relative;
      padding-left: 28px;
      margin-bottom: 12px;
      cursor: pointer;
      font-size: 22px;
      -webkit-user-select: none;
      -moz-user-select: none;
      -ms-user-select: none;
      user-select: none;
      .country-check
        position: absolute;
        opacity: 0;
        cursor: pointer;
        height: 0;
        width: 0;
      .checkmark
        position: absolute;
        top: 4px;
        left: 0;
        height: 20px;
        width: 20px;
        border-radius: 5px;
        background-color: var(--dark);
      .checkmark:after
        content: "";
        position: absolute;
        display: none;
      .checkmark:after
        left: 7px;
        top: 2px;
        width: 7px;
        height: 13px;
        border: solid white;
        border-width: 0 3px 3px 0;
        -webkit-transform: rotate(45deg);
        -ms-transform: rotate(45deg);
        transform: rotate(45deg);
    .country-check-label
      font-weight: 300;
`)
