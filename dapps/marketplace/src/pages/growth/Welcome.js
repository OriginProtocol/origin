import React, { Component, Fragment } from 'react'
import { Switch, Route } from 'react-router-dom'
import get from 'lodash/get'
import { Query } from 'react-apollo'
import { fbt } from 'fbt-runtime'

import withEnrolmentModal from 'pages/growth/WithEnrolmentModal'
import QueryError from 'components/QueryError'
import inviteInfoQuery from 'queries/InviteInfo'
import PageTitle from 'components/PageTitle'
import Onboard from 'pages/onboard/Onboard'
import Link from 'components/Link'

class GrowthWelcome extends Component {
  constructor(props) {
    super(props)
    this.state = {
      inviteCode: null
    }

    this.EnrollButton = withEnrolmentModal('button')
  }

  componentDidMount() {
    let inviteCode = get(this.props, 'match.params.inviteCode')
    // onboarding url is also going to match the path. Not a valid invite
    // code so ignore it.
    inviteCode = inviteCode !== 'onboard' ? inviteCode : undefined

    const localStorageKey = 'growth_invite_code'

    const storedInviteCode = localStorage.getItem(localStorageKey)
    // prefer the stored invite code, over newly fetched invite code
    this.setState({
      inviteCode: storedInviteCode || inviteCode || null
    })
    if (storedInviteCode === null && inviteCode !== undefined) {
      localStorage.setItem(localStorageKey, inviteCode)
    }
  }

  onSignUp(setOpenedModal) {
    setOpenedModal({
      variables: {
        modalName: 'GrowthEnroll'
      }
    })
  }

  render() {
    return (
      <Fragment>
        <PageTitle>
          Welcome to Origin Protocol
        </PageTitle>
        <Switch>
          <Route
            exact
            path="/welcome/onboard"
            render={() => (
              <Onboard
                showoriginwallet={false}
                linkprefix="/welcome"
                redirectTo="/welcome/continue"
              />
            )}
          />
          <Route
            exact
            path="/welcome/:inviteCode?"
            render={() => this.renderWelcomePage(false)}
          />
          <Route
            exact
            path="/welcome/continue/:inviteCode?"
            render={() => this.renderWelcomePage(true)}
          />
          <Route
            path="/welcome/onboard/:inviteCode?"
            render={() => (
              <Onboard
                showoriginwallet={false}
                linkprefix="/welcome"
                redirectTo={`/welcome/continue/${this.state.inviteCode}`}
              />
            )}
          />
        </Switch>
      </Fragment>
    )
  }

  renderFirstFold(personalised, firstName, urlForOnboarding, arrivedFromOnboarding) {
    return (
      <div className="container d-flex">
        <div className="col-6 d-flex flex-column">
          <Link to="/" className="mr-auto">
            <img className="logo" src="/images/origin-logo.svg" />
          </Link>
          {personalised && (
            <Fragment>
              <div className="personalised-bar d-flex justify-content-left">
                <div className="profile-holder d-flex justify-content-center">
                  <img src="images/growth/profile-person.svg" />
                </div>
                <div className="invited-by ml-3 d-flex align-items-center">
                  <div className="d-flex flex-column">
                    <fbt desc="GrowthWelcome.invitedBy">
                      Invited by
                    </fbt>
                    <div>{firstName}</div>
                  </div>
                </div>
              </div>
              <div className="title-text">
                <fbt desc="GrowthWelcome.titleTextPersonalized">
                  Your friend
                  <fbt:param name="name">{firstName}</fbt:param>
                  has invited you to join Origin
                </fbt>
              </div>
            </Fragment>
          )}
          {!personalised && (
            <div className="title">
              <fbt desc="GrowthWelcome.titleText">
                Singn up and earn FREE Origin Tokens
              </fbt>
            </div>
          )}
          <div className="sub-title">
            <fbt desc="GrowthWelcome.subTitleText">
              Sign up for Origin today. Aure and you will both earn Origin
              cryptocurrency tokens (OGN). Earn additional tokens when you
              verify your profile, invite your friends, and buy and sell on
              Origin.
            </fbt>
          </div>
          <this.EnrollButton
            className="btn btn-primary btn-rounded enroll-button"
            type="submit"
            children="Sign Up Now"
            urlforonboarding={urlForOnboarding}
            startopen={arrivedFromOnboarding.toString()}
          />
        </div>
        <div className="spaceman col-10" />
      </div>
    )
  }

  renderFeatureRow(picture, text) {
    return(
      <div className="d-flex feature-row">
        <img src={picture} />
        <div className="feature-text">{text}</div>
      </div>
    )
  }

  renderWhatIsOriginFold() {
    return (
      <div className="second-fold-holder">
        <div className="container d-flex">
          <div className="col-6 d-flex flex-column left-column">
            <div className="title">
              <fbt desc="GrowthWelcome.whatIsOrigin">
                What is Origin?
              </fbt>
            </div>
            <div className="sub-title">
              <fbt desc="GrowthWelcome.whatIsOriginExplanation">
                Origin is the first peer-to-peer marketplace built entirely
                on the blockchain
              </fbt>
            </div>
            <div>
              {this.renderFeatureRow('images/growth/feature-1.svg', fbt('Free to use with 0% transaction fees', 'GrowthWelcome.freeFeature'))}
              {this.renderFeatureRow('images/growth/feature-2.svg', fbt('Censorship-resistant browsing and searching', 'GrowthWelcome.censorshipFeature'))}
              {this.renderFeatureRow('images/growth/feature-3.svg', fbt('Dozens of categories like gift cards, homesharing, ecommerce, and services', 'GrowthWelcome.categoriesFeature'))}
          </div>
          </div>
          <div className="origin-showcase col-10" />
        </div>
      </div>
    )
  }

  renderWhatAreOriginTokensFold() {
    return (
      <div className="third-fold-holder">
        <div className="container">
          <div className="title">
            <fbt desc="GrowthWelcome.whatAreTokens">
              What are Origin Tokens?
            </fbt>
          </div>
          <div className="sub-title mt-3">
            <fbt desc="GrowthWelcome.whatAreTokensExplanation">
              Origin cryptocurrency tokens (OGN) are ERC-20 tokens that
              can be used on the platform in many ways.
            </fbt>
          </div>
          <div className="text mt-3">
            <fbt desc="GrowthWelcome.whatAreTokensText">
              Earned Origin tokens (OGN) are currently locked for use on
              the Origin app and platform. They cannot be transferred to
              other users at this time. In the future, it is expected that
              OGN will be unlocked and transferrable.
            </fbt>
          </div>
          <button 
            className="btn btn-primary btn-rounded"
            children={fbt('Learn more', 'GrowthWelcome.learnMore')}
            onClick={() => open("https://www.originprotocol.com/tokens")}
          />
        </div>
      </div>
    )
  }

  renderWelcomePageContents(arrivedFromOnboarding, identity, urlForOnboarding) {
    const { firstName, lastName } = identity || {}
    const personalised = !!identity

    return (
      <div className="growth-welcome">
        {this.renderFirstFold(personalised, firstName, urlForOnboarding, arrivedFromOnboarding)}
        {this.renderWhatIsOriginFold()}
        {this.renderWhatAreOriginTokensFold()}
      </div>
    )
  }

  renderWelcomePage(arrivedFromOnboarding) {
    const { inviteCode } = this.state

    const urlForOnboarding =
      '/welcome/onboard' +
      (this.state.inviteCode ? `/${this.state.inviteCode}` : '')

    return (
      <Fragment>
        {inviteCode !== null && (
          <Query
            query={inviteInfoQuery}
            variables={{ code: inviteCode }}
            notifyOnNetworkStatusChange={true}
          >
            {({ error, data, networkStatus, loading }) => {
              if (networkStatus === 1 || loading) {
                return this.renderWelcomePageContents(
                  arrivedFromOnboarding,
                  null,
                  urlForOnboarding
                )
              } else if (error) {
                return <QueryError error={error} query={inviteInfoQuery} />
              }

              return this.renderWelcomePageContents(
                arrivedFromOnboarding,
                data.inviteInfo,
                urlForOnboarding
              )
            }}
          </Query>
        )}
        {inviteCode === null &&
          this.renderWelcomePageContents(
            arrivedFromOnboarding,
            null,
            urlForOnboarding
          )}
      </Fragment>
    )
  }
}

export default GrowthWelcome

require('react-styl')(`
  .growth-welcome
    padding-top: 60px
    background-color: #131d27
    .logo
      width: 118px
    .enroll-button
      margin-bottom: 134px
    .title-text
      margin-top: 40px
      margin-bottom: 16px
      font-family: Poppins
      font-size: 48px
      font-weight: 600
      line-height: 1.27
      color: white;
    .sub-title-text
      font-size: 24px
      font-weight: normal
      color: white
      line-height: 1.38
    .invited-by
      color: white
      font-weight: normal
    .spaceman
      background-image: url(images/growth/spaceman.svg)
      background-position: bottom left
      background-repeat: no-repeat
      margin-left: -100px
      padding-left: 100px
    .btn
      margin-top: 40px
      width: 336px
      height: 60px
      font-size: 24px
      font-weight: 900
    .personalised-bar
      margin-top: 64px
      .profile-holder
        background-color: var(--dark-grey-blue)
        width: 80px
        height: 80px
        border-radius: 75px
        overflow: hidden
      .profile-holder img
        margin-top: 20px
    .second-fold-holder
      background-color: white
      font-family: Lato
      font-color: var(--dark)
      .left-column
        padding-bottom: 75px
      .container
        padding-top: 73px
      .title
        font-size: 36px
        font-weight: 600
        font-family: Poppins
      .sub-title
        font-weight: normal
        color: var(--dusk)
        padding-right: 100px
      .feature-row
        margin-top: 50px
        padding-left: 6px
      .feature-text
        margin-left: 27px
        margin-right: 55px
        font-weight: bold
    .third-fold-holder
      background-color: var(--pale-grey-eight)
      padding-bottom: 145px
      padding-top: 145px
      text-align: center
      .container
        max-width: 650px
      .title
        font-size: 36px
        font-weight: 600
        font-family: Poppins
      .sub-title
        font-weight: normal
        color: var(--dusk)
        line-height: normal
      .text
        font-size: 12px
        font-weight: normal
        font-family: Lato
        color: var(--dusk)
        line-height: normal
      .btn
        font-size: 18px
        width: 200px
        height: 50px
    .origin-showcase
      background-image: url(images/growth/marketplace-screenshots-graphic.png)
      background-position: bottom left
      background-repeat: no-repeat

`)
