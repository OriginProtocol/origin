import React, { Component, Fragment } from 'react'
import Modal from 'components/Modal'
import { Query } from 'react-apollo'
import { withRouter } from 'react-router-dom'
import { fbt } from 'fbt-runtime'

import growthEligibilityQuery from 'queries/GrowthEligibility'
import enrollmentStatusQuery from 'queries/EnrollmentStatus'
import allCampaignsQuery from 'queries/AllGrowthCampaigns'
import profileQuery from 'queries/Profile'
import QueryError from 'components/QueryError'
import Enroll from 'pages/growth/mutations/Enroll'
import { mobileDevice } from 'utils/mobile'

const GrowthEnum = require('Growth$FbtEnum')

const GrowthTranslation = key => {
  return (
    <fbt desc="growth">
      <fbt:enum enum-range={GrowthEnum} value={key} />
    </fbt>
  )
}

function withEnrolmentModal(WrappedComponent) {
  class WithEnrolmentModal extends Component {
    constructor(props) {
      super(props)
      this.handleClick = this.handleClick.bind(this)
      this.handleNotCitizenClick = this.handleNotCitizenClick.bind(this)
      this.renderTermsAndEligibilityCheck = this.renderTermsAndEligibilityCheck.bind(
        this
      )

      this.initialStage =
        props.skipjoincampaign === 'false'
          ? 'JoinActiveCampaign'
          : 'TermsAndEligibilityCheck'
      this.state = {
        open: props.startopen === 'true',
        stage: this.initialStage,
        notCitizenChecked: false,
        notCitizenConfirmed: false,
        termsAccepted: false,
        userAlreadyEnrolled: false
      }
    }

    handleClick(e, enrollmentStatus, walletPresent) {
      e.preventDefault()

      if (mobileDevice() !== null) {
        this.setState({
          open: true,
          stage: 'NotSupportedOnMobile'
        })
      } else if (!walletPresent) {
        this.props.history.push(this.props.urlforonboarding)
      } else if (enrollmentStatus === 'Enrolled') {
        this.props.history.push('/campaigns')
      } else if (enrollmentStatus === 'NotEnrolled') {
        this.setState({
          open: true
        })
      } else if (enrollmentStatus === 'Banned') {
        alert('You have been banned from earning tokens')
      }
    }

    handleNotCitizenClick(e) {
      this.setState({ notCitizenChecked: e.target.checked })
    }

    handleAcceptTermsCheck(e) {
      this.setState({ termsAccepted: e.target.checked })
    }

    handleTermsContinue() {
      if (!this.state.termsAccepted) {
        return
      }

      this.setState({ stage: 'MetamaskSignature' })
    }

    handleJoinCampaignContinue() {
      this.setState({ stage: 'TermsAndEligibilityCheck' })
    }

    handleCloseModal() {
      this.setState({
        stage: this.initialStage,
        open: false
      })
    }

    handleEligibilityContinue() {
      if (this.state.notCitizenChecked) {
        this.setState({
          notCitizenConfirmed: true
        })
      }
    }

    renderJoinActiveCampaign() {
      const vars = { first: 10 }
      return (
        <Query
          query={allCampaignsQuery}
          variables={vars}
          notifyOnNetworkStatusChange={true}
        >
          {({ error, data, networkStatus, loading }) => {
            if (networkStatus === 1 || loading) {
              return <h5 className="p-2">Loading...</h5>
            } else if (error) {
              return (
                <QueryError
                  error={error}
                  query={allCampaignsQuery}
                  vars={vars}
                />
              )
            }
            const campaigns = data.campaigns.nodes
            const activeCampaign = campaigns.find(
              campaign => campaign.status === 'Active'
            )

            const campaignName =
              activeCampaign && GrowthEnum[activeCampaign.nameKey]
                ? GrowthTranslation(activeCampaign.nameKey)
                : 'Campaign'

            return (
              <div className="join-campaign">
                <div>
                  <img
                    className="mr-auto ml-auto"
                    src="images/growth/campaign-graphic.svg"
                  />
                </div>
                <div className="title title-light mt-4 ml-5 mr-5">
                  Join our {campaignName} to earn tokens
                </div>
                <div className="mt-3 normal-line-height ml-4 mr-4">
                  Earn OGN by completing tasks like verifying your identity and
                  sharing Origin with your friends. OGN can be used in a variety
                  of ways. Earned OGN will be transferred after the end of the{' '}
                  {campaignName}.
                </div>
                <div className="d-flex align-items-center flex-column">
                  <button
                    className="btn btn-outline-light"
                    onClick={() => this.handleJoinCampaignContinue()}
                    children="Get Started"
                  />
                  <button
                    className="btn btn-no-outline"
                    onClick={() => this.handleCloseModal()}
                    children="Dismiss"
                  />
                </div>
              </div>
            )
          }}
        </Query>
      )
    }

    renderTermsModal() {
      const { termsAccepted } = this.state
      return (
        <div>
          <div className="title title-light mt-2">
            <fbt desc="EnrollmentModal.termsTitle">Sign Up for Origin</fbt>
          </div>
          <div className="pl-5 pr-5 mt-3 normal-line-height pale-grey">
            <fbt desc="EnrollmentModal.termsSubTitle">
              Join Origin’s reward program to earn Origin tokens (OGN). Terms
              and conditions apply.
            </fbt>
          </div>
          <div className="pt-1 mt-4 normal-line-height pale-grey explanation">
            <fbt desc="EnrollmentModal.termsExplanationParagraph1">
              Earned OGN will be distributed at the end of each campaign. OGN is
              currently locked for usage on the Origin platform and cannot be
              transferred. It is expected that OGN will be unlocked and
              transferrable in the future.
            </fbt>
          </div>
          <div className="mt-3 normal-line-height pale-grey explanation">
            <fbt desc="EnrollmentModal.termsExplanationParagraph2">
              By joining the Origin rewards program, you agree that you will 
              not transfer or sell future earned Origin tokens to other for 
              at least 1 year from the date of earning your tokens.
            </fbt>
          </div>
          <div className="terms pale-grey">
            <fbt desc="EnrollmentModal.termsBody">
              OGN are being issued in a transaction originally exempt from
              registration under the U.S. Securities Act of 1933, as amended
              (the “Securities Act”), and may not be transferred in the United
              States to, or for the account or benefit of, any U.S. person
              except pursuant to an available exemption from the registration
              requirements of the Securities Act and all applicable state
              securities laws. Terms used above have the meanings given to them
              in Regulation S under the Securities Act and all applicable laws
              and regulations.
            </fbt>
          </div>
          <div className="mt-1 d-flex country-check-label justify-content-center">
            <label className="checkbox-holder">
              <input
                type="checkbox"
                className="country-check"
                onChange={e => this.handleAcceptTermsCheck(e)}
                value="cofirm-citizenship"
              />
              <span className="checkmark" />
              &nbsp;
            </label>
            <div>
              <fbt desc="EnrollmentModal.termAccept">
                I accept the terms and conditions
              </fbt>
            </div>
          </div>
          <div className="d-flex justify-content-center">
            <button
              className="btn btn-outline-light mr-2"
              onClick={() => this.handleCloseModal()}
              children="Cancel"
            />
            <button
              className={`btn btn-lg ml-2 ${
                termsAccepted ? 'btn-primary btn-rounded' : 'btn-outline-light'
              }`}
              onClick={() => this.handleTermsContinue()}
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
              <img src="images/growth/earth-graphic.svg" />
              <img
                className="red-x-image"
                src="images/growth/red-x-graphic.svg"
              />
            </div>
          </div>
          <div className="title mt-4">Oops, {country} is not eligible</div>
          <div className="mt-3 mr-auto ml-auto normal-line-height info-text">
            Unfortunately, it looks like you’re currently in a country where
            government regulations do not allow you to participate in Origin
            Campaigns.
          </div>
          {isRestricted && (
            <Fragment>
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
          )}
          {(isForbidden || (isRestricted && !notCitizenChecked)) && (
            <button
              className="btn btn-outline-light"
              onClick={() => this.handleCloseModal()}
              children="Done"
            />
          )}
          {isRestricted && notCitizenChecked && (
            <button
              className="btn btn-primary btn-rounded btn-lg"
              onClick={() => this.handleEligibilityContinue()}
              children="Continue"
            />
          )}
        </div>
      )
    }

    renderTermsAndEligibilityCheck() {
      const { notCitizenChecked, notCitizenConfirmed } = this.state

      return (
        <Query query={growthEligibilityQuery}>
          {({ networkStatus, error, loading, data }) => {
            if (networkStatus === 1 || loading) return 'Loading...'
            else if (error) {
              return <QueryError error={error} query={growthEligibilityQuery} />
            }

            // used for testing purposes. No worries overriding this on frontend
            // since another check is done on backend when calling enroll mutation
            let countryOverride = localStorage.getItem(
              'growth_country_override'
            )
            let { countryName, eligibility } = data.isEligible

            if (countryOverride !== null) {
              countryOverride = JSON.parse(countryOverride)
              countryName = countryOverride.countryName
              eligibility = countryOverride.eligibility
            }

            if (
              eligibility === 'Eligible' ||
              (eligibility === 'Restricted' && notCitizenConfirmed)
            ) {
              return this.renderTermsModal()
            } else if (
              eligibility === 'Restricted' ||
              eligibility === 'Forbidden'
            ) {
              return this.renderRestrictedModal(
                countryName,
                eligibility,
                notCitizenChecked
              )
            } else {
              return 'Error: can not detect country'
            }
          }}
        </Query>
      )
    }

    renderMetamaskSignature() {
      return <Enroll />
    }

    renderNotSupportedOnMobile() {
      return (
        <div>
          <div className="title mt-4">Mobile not supported</div>
          <div className="mt-3 mr-auto ml-auto normal-line-height info-text">
            Use desktop device in order to earn Origin tokens.
          </div>
          <button
            className="btn btn-primary btn-rounded btn-lg"
            onClick={() => this.handleCloseModal()}
            children="Ok"
          />
        </div>
      )
    }

    render() {
      const { open } = this.state

      return (
        <Query query={profileQuery} notifyOnNetworkStatusChange={true}>
          {({ error, data, networkStatus, loading }) => {
            if (networkStatus === 1 || loading) {
              return 'Loading...'
            } else if (error) {
              return <QueryError error={error} query={profileQuery} />
            }

            const walletAddress = data.web3.primaryAccount
              ? data.web3.primaryAccount.id
              : null
            return (
              <Query
                query={enrollmentStatusQuery}
                variables={{
                  walletAddress: walletAddress
                    ? walletAddress
                    : '0xdummyAddress'
                }}
                // enrollment info can change, do not cache it
                fetchPolicy="network-only"
              >
                {({ networkStatus, error, loading, data }) => {
                  if (networkStatus === 1 || loading) {
                    return 'Loading...'
                  } else if (error) {
                    return (
                      <QueryError error={error} query={enrollmentStatusQuery} />
                    )
                  }

                  return (
                    <Fragment>
                      <WrappedComponent
                        {...this.props}
                        onClick={e =>
                          this.handleClick(
                            e,
                            data.enrollmentStatus,
                            walletAddress
                          )
                        }
                      />
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
                }}
              </Query>
            )
          }}
        </Query>
      )
    }
  }

  //TODO: withRouter is firing some kind of unknown 'staticContext' Dom element in console
  return withRouter(WithEnrolmentModal)
}

export default withEnrolmentModal

require('react-styl')(`
  .growth-enrollment-modal .input:checked ~ .checkmark
      background-color: #2196F3
  .growth-enrollment-modal
    padding-top: 20px
    max-width: 620px !important
    .normal-line-height
      line-height: normal
    .title
      font-family: Poppins
      font-size: 24px
    .title-light
      font-weight: 300
    .image-holder
      position: relative
      width: 400px
    .info-text
      max-width: 400px
    .red-x-image
      position: absolute
      right: 110px
      bottom: 10px
    .checkbox-holder input:checked ~ .checkmark:after
      display: block
    .btn
      margin-top: 30px
      min-width: 9rem
    .checkbox-holder
      display: block
      position: relative
      padding-left: 28px
      margin-bottom: 0px
      cursor: pointer
      font-size: 22px
      -webkit-user-select: none
      -moz-user-select: none
      -ms-user-select: none
      user-select: none
      .country-check
        position: absolute
        opacity: 0
        cursor: pointer
        height: 0
        width: 0
      .checkmark
        position: absolute
        top: 4px
        left: 0
        height: 20px
        width: 20px
        border-radius: 5px
        background-color: var(--dark)
      .checkmark:after
        content: ""
        position: absolute
        display: none
      .checkmark:after
        left: 7px
        top: 2px
        width: 7px
        height: 13px
        border: solid white
        border-width: 0 3px 3px 0
        -webkit-transform: rotate(45deg)
        -ms-transform: rotate(45deg)
        transform: rotate(45deg)
    .country-check-label
      font-weight: 300
    .pale-grey
      color: var(--pale-grey)
    .explanation
      font-size: 12px
      text-align: left
      padding-left: 25px
      padding-right: 25px
      line-height: 1.58
    .terms
      font-size: 12px
      overflow-y: scroll
      height: 150px
      background-color: var(--dark-two)
      margin: 24px 0px
      text-align: left
      padding: 18px 25px 18px 25px
      font-weight: 300
    .join-campaign
      .btn
        padding: 0.7rem 2rem
      .btn-no-outline
        border: 0px
        font-weight: normal
        text-decoration: underline
        color: white
        margin-top: 20px
`)
