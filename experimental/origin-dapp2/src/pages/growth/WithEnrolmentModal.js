import React, { Component, Fragment } from 'react'
import Modal from 'components/Modal'
import { withApollo, Query } from 'react-apollo'
import growthEligibilityQuery from 'queries/GrowthEligibility'
import profileQuery from 'queries/Profile'
import signMessageMutation from 'mutations/SignMessage'
import QueryError from 'components/QueryError'

function withEnrolmentModal(WrappedComponent) {
  const MyComponent = class WithEnrolmentModal extends Component {
    constructor(props) {
      super(props)
      this.handleClick = this.handleClick.bind(this)
      this.handleNotCitizenClick = this.handleNotCitizenClick.bind(this)
      this.renderTermsAndEligibilityCheck = this.renderTermsAndEligibilityCheck.bind(this)
      this.handleCloseModal = this.handleCloseModal.bind(this)
      this.handleEligibilityContinue = this.handleEligibilityContinue.bind(this)
      this.renderRestrictedModal = this.renderRestrictedModal.bind(this)
      this.renderTermsModal = this.renderTermsModal.bind(this)
      this.handleAcceptTermsCheck = this.handleAcceptTermsCheck.bind(this)
      this.handleTermsContinue = this.handleTermsContinue.bind(this)

      this.state = {
        open: false,
        stage: 'TermsAndEligibilityCheck',
        //stage: 'MetamaskSignature',
        notCitizenChecked: false,
        notCitizenConfirmed: false,
        termsAccepted: false,
        userAlreadyEnrolled: false
      }
    }

    async componentDidMount() {
      //TODO: check if user already enrolled
      //this.setState({ userAlreadyEnrolled: e.target.checked })
      //
      
      //TODO: remove this later
      const gql = require ('graphql-tag')
      const ToggleMetaMaskMutation = gql`
        mutation ToggleMetaMask($enabled: Boolean) {
          toggleMetaMask(enabled: $enabled)
        }
      `

      // console.log("METAMASK TOGGLE MUTATION", await this.props.client.mutate({
      //   mutation: ToggleMetaMaskMutation,
      //   variables: {
      //     enabled: false
      //   }
      // }))
    }

    handleClick(e) {
      e.preventDefault()
      this.setState({
        open: true
      })
    }

    handleNotCitizenClick(e) {
      this.setState({ notCitizenChecked: e.target.checked })
    }

    handleAcceptTermsCheck(e) {
      this.setState({ termsAccepted: e.target.checked })
    }

    async handleTermsContinue() {
      if (!this.state.termsAccepted) {
        return
      }

      this.setState({ stage: 'MetamaskSignature' })

      const { data } = await this.props.client.query({
        query: profileQuery,
      })

      const account_id = data.web3.metaMaskAccount.id
      
      const result = await this.props.client.mutate({
        mutation: signMessageMutation,
        variables: {
          address: account_id,
          // TODO: change version programatically
          message: 'I accept the terms of growth campaign version: 1.0'
        }
      })

      console.log("MUTATION RESULT", result)
    }

    handleCloseModal(e) {
      this.setState({
        open: false
      })
    }

    handleEligibilityContinue(e) {
      if (this.state.notCitizenChecked) {
        this.setState({
          notCitizenConfirmed: true
        })
      }
    }

    renderTermsModal() {
      const { termsAccepted } = this.state
      return (
        <div>
          <div className="title title-light mt-2">
            Terms & Conditions
          </div>
          <div className="mt-3 normal-line-height">
            Something here about the rewards program that explains what it is and why it’s so great.
          </div>
          <div className="terms">
            These Origin Tokens are being issued in a transaction originally exempt from 
            registration under the U.S. securities act of 1933, as amended (the securities act), 
            and may not be transferred in the united states orf to, or for the account or benefit of, 
            any u.s. person except pursuant to an available exemption from the registration 
            requirements of the securities act and all applicable state securities laws. Terms 
            used above have the meanings given to them in regulation s under the securities act of 
            1933 and all applicable laws and regulations. These Origin Tokens are being issued in a 
            transaction originally exempt from registration under the U.S. securities act of 1933, 
            as amended (the securities act), and may not be transferred in the united states orf to, 
            or for the account or benefit of, any u.s. person except pursuant to an available exemption 
            from the registration requirements of the securities act and all applicable state securities 
            laws. Terms used above have the meanings given to them in regulation s under the securities 
            act of 1933 and all applicable laws and regulations.
          </div>
          <div className="mt-1 d-flex country-check-label justify-content-center">
            <label className="checkbox-holder">
              <input
                type="checkbox"
                className="country-check"
                onChange={this.handleAcceptTermsCheck}
                value="cofirm-citizenship"
              />
              <span className="checkmark" />
              &nbsp;
            </label>
            <div>I certify I am not a citizen or resident of U.S.</div>
          </div>
          <div className="d-flex justify-content-center">
            <button
              className="btn btn-outline-light mr-2"
              onClick={this.handleCloseModal}
              children="Cancel"
            />
            <button
              className={`btn btn-lg ml-2 ${termsAccepted ? 'btn-primary btn-rounded' : 'btn-outline-light'}`}
              onClick={this.handleTermsContinue}
              disabled={termsAccepted ? undefined : 'disabled'}
              children="Accept Terms"
            />
          </div>
        </div>
      )
    }

    renderRestrictedModal(country, eligibility, notCitizenChecked) {
      const isRestricted = eligibility === 'Restricted'
      const isForbidden = eligibility === 'Forbidden'

      return (
        <div>
          <div>
            <div className="image-holder mr-auto ml-auto">
              <img className="" src="images/growth/earth-graphic.svg" />
              <img
                className="red-x-image"
                src="images/growth/red-x-graphic.svg"
              />
            </div>
          </div>
          <div className="title mt-4">
            Oops, {country} is not eligible
          </div>
          <div className="mt-3 mr-auto ml-auto normal-line-height info-text">
            Unfortunately, it looks like you’re currently in a country
            where government regulations do not allow you to participate
            in Origin Campaigns.
          </div>
          { isRestricted && <Fragment>
              <div className="mt-4 pt-2">
                Did we detect your your country incorrectly?
              </div>
              <div className="mt-1 d-flex country-check-label justify-content-center">
                <label className="checkbox-holder">
                  <input
                    type="checkbox"
                    className="country-check"
                    onChange={this.handleNotCitizenClick}
                    value="cofirm-citizenship"
                  />
                  <span className="checkmark" />
                  &nbsp;
                </label>
                <div>I certify I am not a citizen or resident of {country}</div>
              </div>
            </Fragment>
          }
          {(isForbidden || (isRestricted && !notCitizenChecked)) && (
            <button
              className="btn btn-outline-light"
              onClick={this.handleCloseModal}
              children="Done"
            />
          )}
          {isRestricted && notCitizenChecked && (
            <button
              className="btn btn-primary btn-rounded btn-lg"
              onClick={this.handleEligibilityContinue}
              children="Continue"
            />
          )}
        </div>
      )
    }

    renderTermsAndEligibilityCheck() {
      const {
        notCitizenChecked,
        notCitizenConfirmed
      } = this.state

      return (
        <Query query={growthEligibilityQuery}>
          {({ networkStatus, error, loading, data, refetch }) => {
            if (networkStatus === 1 || loading) return `Loading...`
            else if (error) {
              return <QueryError error={error} query={growthEligibilityQuery} />
            }

            const { country, eligibility } = data.isEligible
            // const country = 'Canada'
            // const eligibility = 'Restricted'
            // const country = 'Saudi Arabia'
            // const eligibility = 'Forbidden'

            if (eligibility === 'Eligible' ||
              (eligibility === 'Restricted' && notCitizenConfirmed)
              ) {
              return this.renderTermsModal()
            } else if (eligibility === 'Restricted' || eligibility === 'Forbidden') {
              return this.renderRestrictedModal(country, eligibility, notCitizenChecked)
            }
          }}
        </Query>
      )
    }

    renderMetamaskSignature() {
      return (
        <div className="metamask">
          <video
            className="metamask-video"
            width="320"
            heigh="240"
            autoPlay
            loop
          >
            <source src="images/growth/metamask_in_browser_dark_bg.mp4" type="video/mp4"/>
            Your browser does not support the video tag.
          </video>
          <div className="title">
            Confirm Metamask Signature
          </div>
          <div className="mt-3 mr-auto ml-auto normal-line-height info-text">
            Open your Metamask browser extension and confirm your signature.
          </div>
        </div>
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

  return withApollo(MyComponent)
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
    max-width: 620px !important;
    .normal-line-height
      line-height: normal;
    .title
      font-family: Poppins;
      font-size: 24px;
    .title-light
      font-weight: 300;
    .image-holder
      position: relative;
      width: 400px;
    .info-text
      max-width: 400px;
    .red-x-image
      position: absolute;
      right: 110px;
      bottom: 10px;
    .checkbox-holder input:checked ~ .checkmark:after
      display: block;
    .btn
      margin-top: 30px;
      min-width: 9rem;
    .checkbox-holder
      display: block;
      position: relative;
      padding-left: 28px;
      margin-bottom: 0px;
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
    .terms
      font-size: 14px;
      overflow-y: scroll;
      height: 250px;
      background-color: var(--dark-two);
      margin: 24px 0px;
      text-align: left;
      padding: 22px 31px 15px 22px;
      font-weight: 300;
    .metamask-video
      margin-top: 90px;
      margin-bottom: 42px;
    .metamask .title
      font-weight: 300;
    .metamask .info-text
      margin-bottom: 75px;
`)
