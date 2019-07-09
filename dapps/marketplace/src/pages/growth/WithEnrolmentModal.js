import React, { Component, Fragment } from 'react'
import { Query } from 'react-apollo'
import { withRouter } from 'react-router-dom'
import { fbt } from 'fbt-runtime'

import omit from 'lodash/omit'

import { rewardsOnMobileEnabled } from 'constants/SystemInfo'
import growthEligibilityQuery from 'queries/GrowthEligibility'
import enrollmentStatusQuery from 'queries/EnrollmentStatus'
import allCampaignsQuery from 'queries/AllGrowthCampaigns'
import profileQuery from 'queries/Profile'
import QueryError from 'components/QueryError'
import Modal from 'components/Modal'
import MobileModal from 'components/MobileModal'
import Enroll from 'pages/growth/mutations/Enroll'
import { mobileDevice } from 'utils/mobile'
import withIsMobile from 'hoc/withIsMobile'

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
        userAlreadyEnrolled: false,
        modalTitle: fbt('Origin Rewards', 'WithEnrolmentModal.OriginRewards')
      }
    }

    componentDidUpdate(previosProps, previousState) {
      if (!this.state.open && previousState.open) {
        if (this.props.onClose) {
          this.props.onClose()
        }
      } else if (this.state.stage !== previousState.stage) {
        let title = fbt('Origin Rewards', 'WithEnrolmentModal.OriginRewards')
        switch (this.state.stage) {
          case 'JoinActiveCampaign':
            title = fbt('Join Campaign', 'WithEnrolmentModal.JoinCampaign')
            break

          case 'TermsModal':
            title = fbt(
              'Origin Rewards Terms',
              'WithEnrolmentModal.OriginRewardsTerms'
            )
            break

          case 'RestrictedModal':
            title = fbt(
              'Country not eligible',
              'WithEnrolmentModal.CountryNotEligible'
            )
            break
        }

        this.setMobileHeader(title)
      }
    }

    historyNavigate(href) {
      if (this.props.onNavigation) {
        this.props.onNavigation()
      }

      this.props.history.push(href)
    }

    handleClick(e, enrollmentStatus, walletPresent) {
      e.preventDefault()

      if (mobileDevice() !== null && !rewardsOnMobileEnabled) {
        this.setState({
          open: true,
          stage: 'NotSupportedOnMobile'
        })
      } else if (!walletPresent) {
        this.historyNavigate(this.props.urlforonboarding)
      } else if (enrollmentStatus === 'Enrolled') {
        this.historyNavigate('/campaigns')
      } else if (enrollmentStatus === 'NotEnrolled') {
        if (this.props.goToWelcomeWhenNotEnrolled === 'true') {
          this.historyNavigate('/welcome')
        } else {
          this.setState({
            open: true
          })
        }
      } else if (enrollmentStatus === 'Banned') {
        this.historyNavigate('/rewards/banned')
      }
      if (this.props.onClick) {
        this.props.onClick()
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

    // Renders mobile header with close button when on mobile device
    setMobileHeader(title) {
      if (this.state.modalTitle === title) {
        return
      }

      this.setState({
        modalTitle: title
      })
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
                <div className="internal-modal-content">
                  <div>
                    <img
                      className="mr-auto ml-auto"
                      src="images/growth/campaign-graphic.svg"
                    />
                  </div>
                  <div className="title title-light mt-4 ml-5 mr-5">
                    <fbt desc="GrowthEnrollment.joinOurCampaignTitle">
                      Join our
                      <fbt:param name="campaignName">{campaignName}</fbt:param>
                      to earn tokens
                    </fbt>
                  </div>
                  <div className="mt-3 normal-line-height ml-4 mr-4">
                    <fbt desc="GrowthEnrollment.joinOurCampaignExplanation">
                      Earn OGN by completing tasks like verifying your identity
                      and sharing Origin with your friends. OGN can be used in a
                      variety of ways. Earned OGN will be transferred after the
                      end of the
                      <fbt:param name="campaignName">{campaignName}</fbt:param>.
                    </fbt>
                  </div>
                  <div className="d-flex align-items-center flex-column">
                    <button
                      className={`btn ${
                        this.props.ismobile === 'true'
                          ? 'btn-primary'
                          : 'btn-outline-light'
                      }`}
                      onClick={() => this.handleJoinCampaignContinue()}
                      children={fbt('Get Started', 'Get Started')}
                    />
                    <button
                      className="btn btn-no-outline"
                      onClick={() => this.handleCloseModal()}
                      children={fbt('Dismiss', 'Dismiss')}
                    />
                  </div>
                </div>
              </div>
            )
          }}
        </Query>
      )
    }

    renderTermsModal() {
      const { termsAccepted } = this.state
      const isMobile = this.props.ismobile === 'true'

      const cancelButton = (
        <button
          className={`btn ${
            isMobile
              ? 'btn-no-outline-link mt-3 mb-3'
              : 'btn-outline-light mr-2'
          }`}
          onClick={() => this.handleCloseModal()}
          children={fbt('Cancel', 'Cancel')}
        />
      )

      const acceptTermsButton = (
        <button
          className={`btn btn-lg ${
            termsAccepted
              ? `btn-primary btn-rounded ${isMobile ? 'm-0' : ''}`
              : isMobile
              ? 'btn-primary wide-btn m-0'
              : 'btn-outline-light'
          }`}
          onClick={() => this.handleTermsContinue()}
          disabled={termsAccepted ? undefined : 'disabled'}
          children={fbt('Accept Terms', 'Accept Terms')}
        />
      )

      return (
        <div>
          <div className="internal-modal-content">
            {!isMobile && (
              <div className="title title-light mt-2">
                <fbt desc="EnrollmentModal.termsTitle">
                  Sign Up for Origin Rewards
                </fbt>
              </div>
            )}
            <div className="px-4 mt-3 normal-line-height terms-title">
              <fbt desc="EnrollmentModal.termsSubTitle">
                Join Origin’s reward program to earn Origin tokens (OGN). Terms
                and conditions apply.
              </fbt>
            </div>
            <div className="pt-1 mt-4 normal-line-height terms-body explanation">
              <fbt desc="EnrollmentModal.termsExplanationParagraph1">
                Earned OGN will be distributed at the end of each campaign. OGN
                is currently locked for usage on the Origin platform and cannot
                be transferred. It is expected that OGN will be unlocked and
                transferrable in the future.
              </fbt>
            </div>
            <div className="mt-3 normal-line-height terms-body explanation">
              <fbt desc="EnrollmentModal.termsExplanationParagraph2">
                By joining the Origin rewards program, you agree that you will
                not transfer or sell future earned Origin tokens to other for at
                least 1 year from the date of earning your tokens.
              </fbt>
            </div>
            <div className="terms">
              <fbt desc="EnrollmentModal.termsBody">
                OGN are being issued in a transaction originally exempt from
                registration under the U.S. Securities Act of 1933, as amended
                (the “Securities Act”), and may not be transferred in the United
                States to, or for the account or benefit of, any U.S. person
                except pursuant to an available exemption from the registration
                requirements of the Securities Act and all applicable state
                securities laws. Terms used above have the meanings given to
                them in Regulation S under the Securities Act and all applicable
                laws and regulations.
              </fbt>
            </div>
            <div className="mt-1 d-flex country-check-label justify-content-center pb-3">
              <label className="checkbox-holder">
                <input
                  type="checkbox"
                  className="country-check"
                  onChange={e => this.handleAcceptTermsCheck(e)}
                  value="cofirm-citizenship"
                />
                <span className="checkmark" />
                &nbsp;
                <fbt desc="EnrollmentModal.termAccept">
                  I accept the terms and conditions
                </fbt>
              </label>
            </div>
            <div
              className={`d-flex justify-content-center ${
                isMobile ? 'flex-column mt-auto px-4' : ''
              }`}
            >
              {!isMobile && (
                <Fragment>
                  {cancelButton}
                  {acceptTermsButton}
                </Fragment>
              )}
              {isMobile && (
                <Fragment>
                  {acceptTermsButton}
                  {cancelButton}
                </Fragment>
              )}
            </div>
          </div>
        </div>
      )
    }

    renderRestrictedModal(country, eligibility, notCitizenChecked) {
      const isRestricted = eligibility === 'Restricted'
      const isMobile = this.props.ismobile === 'true'

      return (
        <div className="container d-flex flex-column align-items-center">
          <div>
            <div className="image-holder text-center mr-auto ml-auto">
              <img
                className="world-image"
                src="images/growth/not-eligible-graphic.svg"
              />
            </div>
          </div>
          <div className="title mt-4 text-center">
            <fbt desc="GrowthEnrollment.notEligibleTitle">
              Oops,
              <fbt:param name="country">{country}</fbt:param>
              is not eligible
            </fbt>
          </div>
          <div className="normal-explanation mt-3 mr-auto ml-auto normal-line-height info-text text-center">
            <fbt desc="GrowthEnrollment.notEligibleExplanation">
              Unfortunately, it looks like you’re currently in a country where
              government regulations do not allow you to participate in Origin
              Campaigns.
            </fbt>
          </div>
          {isRestricted && (
            <Fragment>
              <div className="eligibility-question mt-4 pt-1 pb-1 text-center">
                <fbt desc="GrowthEnrollment.restrictedQuestion">
                  Did we detect your your country incorrectly?
                </fbt>
              </div>
              <div className="mt-3 d-flex country-check-label justify-content-center">
                <label className="checkbox-holder">
                  <input
                    type="checkbox"
                    className="country-check"
                    onChange={this.handleNotCitizenClick}
                    value="cofirm-citizenship"
                  />
                  <span className="checkmark" />
                  &nbsp;
                  <fbt desc="GrowthEnrollment.certifyNotACitizen">
                    I certify I am not a citizen or resident of
                    <fbt:param name="country">{country}</fbt:param>
                  </fbt>
                </label>
              </div>
            </Fragment>
          )}
          <div className={`buttons-holder ${isMobile ? 'mt-auto' : ''}`}>
            {isRestricted && !notCitizenChecked && (
              <button
                className={`btn btn-rounded btn-lg btn-outline-light mb-0 ${
                  isMobile ? 'wide-btn' : ''
                }`}
                onClick={() => this.handleCloseModal()}
                children={fbt('Done', 'Done')}
              />
            )}
            {isRestricted && notCitizenChecked && (
              <button
                className={`btn btn-primary btn-rounded btn-lg mb-0 ${
                  isMobile ? 'wide-btn' : ''
                }`}
                onClick={() => this.handleEligibilityContinue()}
                children={fbt('Continue', 'Continue')}
              />
            )}
            {isMobile && (
              <button
                className="btn btn-no-outline-link"
                onClick={() => this.handleCloseModal()}
                children={fbt('Back to home', 'Back to home')}
              />
            )}
          </div>
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
              return fbt(
                'Error: cannot detect country',
                'GrowthEnrollment.cannotDetectCountryError'
              )
            }
          }}
        </Query>
      )
    }

    enrollmentSuccessful() {
      if (this.props.onCompleted) {
        this.props.onCompleted()
      } else {
        this.historyNavigate('/campaigns')
      }
      this.handleCloseModal()
    }

    renderMetamaskSignature() {
      const isMobile = this.props.ismobile === 'true'
      return (
        <Enroll
          isMobile={isMobile}
          onSuccess={() => this.enrollmentSuccessful()}
          onAccountBlocked={() => {
            if (this.props.onAccountBlocked) {
              this.props.onAccountBlocked()
              if (isMobile) {
                this.historyNavigate('/rewards/banned')
              }
            } else {
              this.historyNavigate('/rewards/banned')
            }
            this.handleCloseModal()
          }}
        />
      )
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
            children={fbt('OK', 'OK')}
          />
        </div>
      )
    }

    render() {
      const { open } = this.state
      const isMobile = this.props.isMobile
      const ModalComponent = isMobile ? MobileModal : Modal

      return (
        <Query query={profileQuery} notifyOnNetworkStatusChange={true}>
          {({ error, data }) => {
            if (error) {
              return <QueryError error={error} query={profileQuery} />
            }

            const walletAddress =
              data.web3 && data.web3.primaryAccount
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
                {({ error, data }) => {
                  if (error) {
                    return (
                      <QueryError error={error} query={enrollmentStatusQuery} />
                    )
                  }

                  const displayMobileModal =
                    isMobile && this.state.stage !== 'MetamaskSignature'
                  const snowSmallerModal =
                    isMobile && this.state.stage === 'MetamaskSignature'

                  return (
                    <Fragment>
                      <WrappedComponent
                        {...omit(this.props, [
                          'onClose',
                          'onNavigation',
                          'onCompleted',
                          'isMobile',
                          'isMobileApp',
                          'onAccountBlocked',
                          'goToWelcomeWhenNotEnrolled'
                        ])}
                        onClick={e =>
                          this.handleClick(
                            e,
                            data.enrollmentStatus,
                            walletAddress
                          )
                        }
                      />
                      {open && (
                        <ModalComponent
                          title={this.state.modalTitle}
                          className={`growth-enrollment-modal ${
                            snowSmallerModal ? 'small' : ''
                          } ${displayMobileModal ? 'mobile' : ''}`}
                          shouldClose={this.state.shouldClose}
                          onClose={() => {
                            this.setState({
                              open: false
                            })
                          }}
                        >
                          {this[`render${this.state.stage}`]()}
                        </ModalComponent>
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

  return withIsMobile(
    // do not pass staticContext prop to component to prevent react errors in browser console
    // eslint-disable-next-line no-unused-vars
    withRouter(({ staticContext, location, match, ...props }) => (
      <WithEnrolmentModal {...props} />
    ))
  )
}

export default withEnrolmentModal

require('react-styl')(`
  .pl-modal-table
    .growth-enrollment-modal
      padding-top: 20px
      max-width: 620px !important
    .growth-enrollment-modal.small
      max-width: 300px !important
  .growth-enrollment-modal .input:checked ~ .checkmark
    background-color: #2196F3
  .pl-modal .pl-modal-table .pl-modal-cell .growth-enrollment-modal.pl-modal-content
    color: var(--dark)
    background-color: white
  .growth-enrollment-modal
    &.modal-content
      padding: 20px
      > div, .internal-modal-content
        height: 100%
        display: flex
        flex-direction: column
      .btn
        width: 100%
        margin: 2rem 0
        padding: 0.5rem
    .btn-outline-light
      color: var(--clear-blue)
      border-color: var(--clear-blue)
    .eligibility-question
      font-size: 16px
      font-weight: bold
    .normal-explanation
      font-size: 16px
    .header
      background-color: var(--dusk)
      height: 3.75rem
      .back
        cursor: pointer
      .container
        height: 100%
        font-family: Lato
        font-size: 22px
        font-weight: bold
        color: white
    .normal-line-height
      line-height: normal
    .title
      font-family: Poppins
      font-size: 24px
    .title-light
      font-weight: 300
    .image-holder
      position: relative
      max-width: 200px
      height: 150px
    .info-text
      max-width: 400px
    .red-x-image
      position: absolute
      right: -10px
      bottom: 20px
    .checkbox-holder input:checked ~ .checkmark:after
      display: block
    .buttons-holder
      width: 100%
    .btn
      margin-top: 30px
      min-width: 9rem
    .wide-btn
      width: 100%
      margin-left: auto
      margin-right: auto
    .checkbox-holder
      color: var(--steel-blue)
      font-family: Lato
      font-weight: normal
      display: block
      position: relative
      padding-left: 28px
      margin-bottom: 0px
      cursor: pointer
      font-size: 18px
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
    .terms-title
      font-weight: 500
      color: black
      margin: 0px 25px
    .terms-body
      color: var(--dark)
      padding: 0
    .explanation
      font-size: 12px
      text-align: left
      padding-left: 25px
      padding-right: 25px
      line-height: 1.58
    .terms
      background-color: var(--pale-grey-four)
      color: var(--steel)
      margin-left: 1.5rem
      margin-right: 1.5rem
      padding: 0.625rem 1rem
      border-radius: 0.312rem
      border: solid 1px var(--light)
      font-weight: normal
      font-size: 12px
      overflow-y: scroll
      height: 9.375rem
      margin: 1.5rem
      text-align: left
    .join-campaign
      .btn
        padding: 0.7rem 2rem
      .btn-no-outline
        border: 0px
        font-weight: normal
        text-decoration: underline
        color: white
  .mobile-modal-light .growth-enrollment-modal.mobile.modal-content .container
    max-width: 520px
    margin-left: auto
    margin-right: auto
    padding-top: 20px
  .mobile-modal-light .growth-enrollment-modal.small
    text-align: center
  .mobile-modal-light .growth-enrollment-modal.mobile
    max-width: 767px !important
    color: var(--dark)
    text-align: center
    border: 0px
    background-color: white
    .join-campaign
      .btn-no-outline
        color: var(--clear-blue)
    .checkbox-holder
      color: var(--steel)
  .growth-enrollment-modal.pl-modal.mobile .pl-modal-table .pl-modal-cell
    padding: 0px
  .mobile-modal-light .modal-content.growth-enrollment-modal
    background-color: var(--pale-grey-four)
    padding: 0px
    border-radius: 0px
    width: 100%
  @media (max-width: 767.98px)
    .growth-enrollment-modal
      .join-campaign
        img
          max-width: 8rem
        .btn-no-outline
          margin-top: 0.8rem
      .btn
        margin-top: 1.5rem
      .title
        font-size: 24px
        line-height: 1.21
        max-width: 15rem
        font-weight: 500
      .terms
        margin: 1rem 1.56rem
      .checkbox-holder
        font-size: 15px
      .terms
        background-color: var(--pale-grey-four)
        color: var(--steel)
        padding: 0.625rem 1rem
        border-radius: 0.312rem
        border: solid 1px var(--light)
        font-weight: normal
      .terms-title
        font-size: 18px
        font-weight: normal
      .terms-body
        font-size: 14px
        font-weight: 300
        line-height: 1.4
        margin: 0px 25px
        padding: 0
      .btn-no-outline-link
        font-size: 14px
        color: var(--clear-blue)
        font-weight: normal
        margin: 1.2rem
        font-size: 16px
        font-weight: bold
      .checkbox-holder
        color: var(--dark)
      .image-holder
        .world-image
          max-width: 135px
        .red-x-image
          width: 40px
`)
