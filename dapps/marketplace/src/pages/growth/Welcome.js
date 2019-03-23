import React, { Component, Fragment } from 'react'
import { Switch, Route } from 'react-router-dom'
import get from 'lodash/get'
import { Query } from 'react-apollo'
import { fbt } from 'fbt-runtime'

import withEnrolmentModal from 'pages/growth/WithEnrolmentModal'
import inviteInfoQuery from 'queries/InviteInfo'
import PageTitle from 'components/PageTitle'
import Onboard from 'pages/onboard/Onboard'
import Link from 'components/Link'

class GrowthWelcome extends Component {
  constructor(props) {
    super(props)
    this.state = {
      inviteCode: null,
      isMobile: false
    }

    this.EnrollButton = withEnrolmentModal('button')
    this.onResize = this.onResize.bind(this)
  }

  componentDidMount() {
    window.addEventListener('resize', this.onResize)
    this.onResize()
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

  componentWillUnount() {
    window.removeEventListener('resize', this.onResize)
  }

  onResize() {
    if (window.innerWidth < 767 && !this.state.isMobile) {
      this.setState({ isMobile: true })
    } else if (window.innerWidth >= 767 && this.state.isMobile) {
      this.setState({ isMobile: false })
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
        <PageTitle>Welcome to Origin Protocol</PageTitle>
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

  renderFirstFold(
    personalised,
    firstName,
    urlForOnboarding,
    arrivedFromOnboarding
  ) {
    const isMobile = this.state.isMobile

    return (
      <div className="container d-flex">
        <div
          className={`${
            isMobile ? 'col-12' : 'col-6'
          } d-flex flex-column top-padding`}
        >
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
                    <fbt desc="GrowthWelcome.invitedBy">Invited by</fbt>
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
            <div className="title-text">
              <fbt desc="GrowthWelcome.titleText">
                Sign up and earn FREE Origin Tokens
              </fbt>
            </div>
          )}
          <div className="sub-title">
            <fbt desc="GrowthWelcome.subTitleTextSignUp">
              Sign up for Origin today.
            </fbt>
            &nbsp;
            {personalised && (
              <Fragment>
                <fbt desc="GrowthWelcome.subTitleTextYouAndFriend">
                  <fbt:param name="firstName">{firstName}</fbt:param>
                  and you will both earn Origin cryptocurrency tokens (OGN).
                </fbt>
                &nbsp;
              </Fragment>
            )}
            <fbt desc="GrowthWelcome.subTitleTextEarnAdditional">
              Earn additional tokens when you verify your profile, invite your
              friends, and buy and sell on Origin.
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
        <div
          className={`spaceman col-10 top-padding ${
            !personalised ? 'center' : ''
          }
          ${isMobile ? 'd-none' : ''}
          `}
        />
      </div>
    )
  }

  renderFeatureRow(picture, text) {
    return (
      <div className="d-flex feature-row">
        <img src={picture} />
        <div className="feature-text">{text}</div>
      </div>
    )
  }

  renderWhatIsOriginFold() {
    const isMobile = this.state.isMobile

    return (
      <div className="second-fold-holder">
        <div className="container d-flex">
          <div
            className={`${
              isMobile ? 'col-12' : 'col-6'
            } d-flex flex-column left-column`}
          >
            <div className="title">
              <fbt desc="GrowthWelcome.whatIsOrigin">What is Origin?</fbt>
            </div>
            <div className={`sub-title ${isMobile ? 'mobile' : ''}`}>
              <fbt desc="GrowthWelcome.whatIsOriginExplanation">
                Origin is the first peer-to-peer marketplace built entirely on
                the blockchain
              </fbt>
            </div>
            <div>
              {this.renderFeatureRow(
                'images/growth/feature-1.svg',
                fbt(
                  'Free to use with 0% transaction fees',
                  'GrowthWelcome.freeFeature'
                )
              )}
              {this.renderFeatureRow(
                'images/growth/feature-2.svg',
                fbt(
                  'Censorship-resistant browsing and searching',
                  'GrowthWelcome.censorshipFeature'
                )
              )}
              {this.renderFeatureRow(
                'images/growth/feature-3.svg',
                fbt(
                  'Dozens of categories like gift cards, homesharing, ecommerce, and services',
                  'GrowthWelcome.categoriesFeature'
                )
              )}
            </div>
          </div>
          <div
            className={`${isMobile ? 'd-none' : ''} origin-showcase col-10`}
          />
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
              Origin cryptocurrency tokens (OGN) are ERC-20 tokens that can be
              used on the platform in many ways.
            </fbt>
          </div>
          <div className="text mt-3">
            <fbt desc="GrowthWelcome.whatAreTokensText">
              Earned Origin tokens (OGN) are currently locked for use on the
              Origin app and platform. They cannot be transferred to other users
              at this time. In the future, it is expected that OGN will be
              unlocked and transferrable.
            </fbt>
          </div>
          <button
            className="btn btn-primary btn-rounded"
            children={fbt('Learn more', 'GrowthWelcome.learnMore')}
            onClick={() => open('https://www.originprotocol.com/tokens')}
          />
        </div>
      </div>
    )
  }

  renderBoostingAndRewardsFold() {
    const isMobile = this.state.isMobile

    return (
      <div className="d-flex fourth-fold-holder">
        <div className="col-6 pl-0 pr-0">
          <div className="coin-section" />
          <div
            className={`boosting-section d-flex flex-column ${
              isMobile ? 'mobile' : ''
            }`}
          >
            <div className="text-holder ml-auto">
              <div className="title">
                <fbt desc="GrowthWelcome.boosting">Boosting</fbt>
              </div>
              <div className="text mt-3">
                <fbt desc="GrowthWelcome.boostingExplanation">
                  Sellers use OGN to boost their listings on the marketplace.
                  This gives their listings higher visibility and placement.
                  Listings with OGN have a higher chance of being sold quickly.
                </fbt>
              </div>
            </div>
          </div>
        </div>

        <div className="col-6 pl-0 pr-0">
          <div
            className={`rewards-section d-flex flex-column ${
              isMobile ? 'mobile' : ''
            }`}
          >
            <div className="text-holder mr-auto">
              <div className="title">
                <fbt desc="GrowthWelcome.rewards">Rewards</fbt>
              </div>
              <div className="text mt-3">
                <fbt desc="GrowthWelcome.rewardsExplanation">
                  OGN is a rewards cryptocurrency earned by Origin users. Earn
                  rewards when you verify your account or invite your friends to
                  join Origin. Even get OGN as cash back when you buy and sell.
                </fbt>
              </div>
            </div>
          </div>
          <div className="arrows-section" />
        </div>
      </div>
    )
  }

  renderStartEarningFold(urlForOnboarding, arrivedFromOnboarding) {
    return (
      <div className="start-earning-fold-holder">
        <div className="container d-flex flex-column">
          <div className="title mb-2">
            <fbt desc="GrowthWelcome.startEarning">
              Start earning Origin tokens within minutes
            </fbt>
          </div>
          <div className="number-point mr-auto ml-auto justify-content-center d-flex align-items-center">
            1
          </div>
          <div className="text">
            <fbt desc="GrowthWelcome.connectCurrency">
              Connect your cryptocurrency wallet to Origin
            </fbt>
          </div>
          <div className="number-point mr-auto ml-auto justify-content-center d-flex align-items-center">
            2
          </div>
          <div className="text">
            <fbt desc="GrowthWelcome.signUpVerify">
              Sign up and verify your account and eligibility
            </fbt>
          </div>
          <div className="number-point mr-auto ml-auto justify-content-center d-flex align-items-center">
            3
          </div>
          <div className="text">
            <fbt desc="GrowthWelcome.beginEarning">Begin earning today</fbt>
          </div>
          <this.EnrollButton
            className="btn btn-primary btn-rounded mr-auto ml-auto"
            children={fbt('Get Started', 'GrowthWelcome.getStarted')}
            urlforonboarding={urlForOnboarding}
            startopen={arrivedFromOnboarding.toString()}
          />
          <div className="text link-holder">
            <fbt desc="GrowthWelcome.haveQuestions">Have questions?</fbt>
            <a href="mailto:support@originprotocol.com" className="ml-1">
              <fbt desc="GrowthWelcome.GetInTouch">Get in touch</fbt>
            </a>
          </div>
        </div>
      </div>
    )
  }

  renderWelcomePageContents(arrivedFromOnboarding, identity, urlForOnboarding) {
    const { firstName } = identity || {}
    const personalised = !!identity

    return (
      <div className="growth-welcome">
        {this.renderFirstFold(
          personalised,
          firstName,
          urlForOnboarding,
          arrivedFromOnboarding
        )}
        {this.renderWhatIsOriginFold()}
        {this.renderWhatAreOriginTokensFold()}
        {this.renderBoostingAndRewardsFold()}
        {this.renderStartEarningFold(urlForOnboarding, arrivedFromOnboarding)}
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
              if (networkStatus === 1 || loading || error) {
                if (error) {
                  // This is likely due to an invalid invite code.
                  // Render the page as if no invite code was provided.
                  console.error(
                    `InviteInfo failure. Query: ${inviteInfoQuery} Error: ${error}`
                  )
                }
                return this.renderWelcomePageContents(
                  arrivedFromOnboarding,
                  null,
                  urlForOnboarding
                )
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
    background-color: #131d27
    .top-padding
      padding-top: 60px
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
      color: white
    .sub-title
      font-size: 24px
      font-weight: normal
      color: white
      line-height: 1.38
      color: white
    .invited-by
      color: white
      font-weight: normal
    .spaceman.center
      background-position: center left
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
      .sub-title.mobile
        padding-right: 0px
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
    .fourth-fold-holder
      .coin-section
        background-color: var(--clear-blue)
        height: 340px
        width: 100%
        background-image: url(images/growth/reward-ogn-coins.svg)
        background-position: bottom right
        background-repeat: no-repeat
      .boosting-section
        background-color: var(--pale-grey-eight)
        height: 500px
        padding-top: 150px
        padding-right: 135px
        .text-holder
          max-width: 350px
        .title
          font-family: Poppins
          font-size: 36px
          font-weight: 600
          font-style: normal
          line-height: 1.14
          color: var(--dark)
        .text
          font-family: Lato
          font-weight: normal
          line-height: 1.44
          color: var(--dark)
      .boosting-section.mobile
        padding-top: 50px
        padding-right: 35px
      .arrows-section
        background-color: #5f41d2
        height: 340px
        width: 100%
        background-image: url(images/growth/purple-up-arrow.svg)
        background-position: bottom left
        background-repeat: repeat
      .rewards-section
        background-color: var(--dark-grey-blue)
        height: 500px
        padding-top: 150px
        padding-left: 135px
        .text-holder
          max-width: 350px
        .title
          font-family: Poppins
          font-size: 36px
          font-weight: 600
          font-style: normal
          line-height: 1.14
          color: white
        .text
          font-family: Lato
          font-weight: normal
          line-height: 1.44
          color: white
      .rewards-section.mobile
        padding-top: 50px
        padding-left: 35px
    .start-earning-fold-holder
      background-color: var(--clear-blue)
      color: white
      padding-top: 140px
      padding-bottom: 135px
      text-align: center
      margin-bottom: -64px
      .title
        font-family: Poppins
        font-size: 36px
        font-weight: 600
      .text
        font-family: Lato
        font-weight: normal
        font-style: normal
        margin-top: 10px
      .number-point
        font-family: Lato
        font-weight: normal
        border: solid 1px var(--white)
        border-radius: 50px
        width: 46px
        height: 46px
        margin-top: 42px
      .btn
        font-size: 18px
        min-width: 200px
        width: auto
        height: 50px
        border: solid 1px white
        margin-top: 62px
      .btn:hover
        color: var(--clear-blue)
        background-color: white
      a
        color: white
        text-decoration: underline
      .link-holder
        margin-top: 60px
    .origin-showcase
      background-image: url(images/growth/marketplace-screenshots-graphic.png)
      background-position: bottom left
      background-repeat: no-repeat

`)
