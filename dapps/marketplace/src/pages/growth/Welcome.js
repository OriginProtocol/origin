import React, { Component, Fragment } from 'react'
import { Switch, Route } from 'react-router-dom'
import get from 'lodash/get'
import { Query } from 'react-apollo'
import { fbt } from 'fbt-runtime'

import withEnrolmentModal from 'pages/growth/WithEnrolmentModal'
import Onboard from 'pages/onboard/Onboard'

import DocumentTitle from 'components/DocumentTitle'
import Avatar from 'components/Avatar'
import Link from 'components/Link'

import withIsMobile from 'hoc/withIsMobile'
import withWallet from 'hoc/withWallet'
import QRCode from 'davidshimjs-qrcodejs'

import { rewardsOnMobileEnabled } from 'constants/SystemInfo'
import inviteInfoQuery from 'queries/InviteInfo'
import * as clipboard from 'clipboard-polyfill'

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

    const inviteCodeToUse = storedInviteCode || inviteCode || null
    //prefer the stored invite code, over newly fetched invite code
    this.setState({
      inviteCode: inviteCodeToUse,
      meLink: `${location.origin}/#/welcome${
        inviteCodeToUse ? `/${inviteCodeToUse}` : ''
      }`
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
        <DocumentTitle
          pageTitle={
            <fbt desc="GrowthWelcome.title">Welcome to Origin Protocol</fbt>
          }
        />
        <Switch>
          <Route
            exact
            path="/welcome/onboard"
            render={() => (
              <Onboard
                hideOriginWallet={!rewardsOnMobileEnabled}
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
                hideOriginWallet={!rewardsOnMobileEnabled}
                linkprefix="/welcome"
                redirectTo={`/welcome/continue/${this.state.inviteCode}`}
              />
            )}
          />
        </Switch>
      </Fragment>
    )
  }

  renderWelcomePageContents(arrivedFromOnboarding, identity, urlForOnboarding) {
    const { firstName, lastName, avatarURL } = identity || {}
    const personalised = !!identity

    const isOriginWallet = ['Origin Wallet', 'Mobile'].includes(
      this.props.walletType
    )

    // This is semi legit ¯\_(ツ)_/¯
    const isIOS =
      navigator.platform && /iPad|iPhone|iPod/.test(navigator.platform)
    const appStoreUrl =
      'https://itunes.apple.com/app/origin-wallet/id1446091928'
    const playStoreUrl =
      'https://play.google.com/store/apps/details?id=com.origincatcher'

    const onStoreButtonClick = async e => {
      e.preventDefault()

      const inviteCode = this.state.inviteCode
      const prefix = 'or:'
      const referralCode =
        inviteCode && inviteCode.startsWith(prefix)
          ? inviteCode
          : `${prefix}${inviteCode}`

      await clipboard.writeText(referralCode)

      const url = isIOS ? appStoreUrl : playStoreUrl

      const opened = window.open(url)
      // If we got snagged by a popup blocker(firefox) just go direct
      if (!opened) {
        window.location = url
      }
    }

    if (this.state.meLink && !isOriginWallet) {
      const qrOptions = {
        text: this.state.meLink,
        width: 140,
        height: 140,
        colorDark: '#000000',
        colorLight: '#ffffff',
        correctLevel: QRCode.CorrectLevel.H
      }

      // dirty way of clearing previous possible QrCodes
      const qrcode1 = document.getElementById('qrcode1')
      const qrcode2 = document.getElementById('qrcode2')

      if (qrcode1 && qrcode2) {
        qrcode1.innerHTML = ''
        qrcode2.innerHTML = ''

        new QRCode('qrcode1', qrOptions)
        new QRCode('qrcode2', qrOptions)
      }
    }

    return (
      <div className="growth-welcome growth-welcome-holder">
        <main className="growth-welcome">
          <div className="header d-none d-md-flex align-items-center justify-content-center">
            <Link to="/" className="custom-brand">
              <img src="images/origin-logo-black.svg" alt="Origin" />
            </Link>
          </div>
          <div className="wide-container">
            <div className="row">
              <div className="container-half d-flex flex-colum">
                <div className="ml-auto left-strip">
                  <div
                    className="d-none d-md-flex"
                    id="referral-campaign-header"
                  ></div>
                  <section
                    id="tagline"
                    className={`${personalised ? 'personalised' : ''}`}
                  >
                    <div className="avatar-container clearfix">
                      {!personalised && (
                        <p className="avatar-text">
                          <fbt desc="GrowthWelcome.joinToEarnChance">
                            Join Origin Rewards to earn OGN.
                          </fbt>
                        </p>
                      )}
                      {personalised && (
                        <>
                          <Avatar avatarUrl={avatarURL} />
                          <p className="avatar-text personalised">
                            <fbt desc="GrowthWelcome.joinToEarnPersonalized">
                              Your friend
                              <fbt:param name="name">{`${firstName} ${lastName}`}</fbt:param>
                              has invited you to earn
                            </fbt>
                          </p>
                        </>
                      )}
                    </div>
                  </section>
                  <hr />
                  {isOriginWallet && (
                    <this.EnrollButton
                      className="signup-button my-4 mobile-signup"
                      children={fbt('Sign Up Now', 'GrowthWelcome.signUpNow')}
                      urlforonboarding={urlForOnboarding}
                      startopen={arrivedFromOnboarding.toString()}
                    />
                  )}
                  {!isOriginWallet && (
                    <>
                      <section id="intro">
                        <p>
                          <fbt desc="GrowthWelcome.OgnIsCryptoCurrency">
                            OGN is a cryptocurrency that can be used to buy and
                            sell anything in the Origin Marketplace.
                          </fbt>
                        </p>
                      </section>
                      <section id="download">
                        <button
                          id="app-download-button"
                          className="d-md-none"
                          onClick={onStoreButtonClick}
                        >
                          {isIOS && (
                            <img
                              src="images/growth/app-store.svg"
                              alt="Origin"
                            />
                          )}
                          {!isIOS && (
                            <img
                              src="images/growth/play-store.svg"
                              alt="Origin"
                            />
                          )}
                        </button>
                        <this.EnrollButton
                          className="d-none d-md-block signup-button"
                          children={fbt(
                            'Sign Up for Origin Rewards',
                            'signUpForOriginRewards'
                          )}
                          urlforonboarding={urlForOnboarding}
                          startopen={arrivedFromOnboarding.toString()}
                        />
                      </section>
                    </>
                  )}
                </div>
              </div>
              <div className="container-half">
                <section id="screenshot1">
                  {/* <img className="d-md-none" src="images/growth/iphone-1.png" /> */}
                  <img
                    className="d-none d-md-block"
                    src="/images/growth/laptop.png"
                    srcSet="/images/growth/laptop.png 1x, /images/growth/laptop@2x.png 2x, /images/growth/laptop@3x.png 3x"
                  />
                  {/* <hr /> */}
                </section>
              </div>
            </div>
          </div>
        </main>
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

export default withWallet(withIsMobile(GrowthWelcome))

require('react-styl')(`
  .growth-welcome-holder
    height: 100vh
  .growth-welcome
    background: #007fff
    color: #fff
    .row
      margin: 0px
    .left-strip
      max-width: 450px
    .header
      background-color: white;
      height: 80px
      width: 100%
    .wide-container
      width: 100%
    .container-half
      width: 100%
      position:relative
      overflow: hidden
    .container
      width: 100%
      padding-right: 15px
      padding-left: 15px
      margin-right: auto
      margin-left: auto
    p
      color: #fff
      font-weight: 300
    hr
      margin-block-start: 0.5em
      margin-block-end: 0.5em
      background: #fff
      height: 1px
      width: 84%
      border: 0
      padding: 0
    #app-download-button
      background-color: #007fff
      border: 0
      margin: 0 auto 50px
      width: 280px
      img
        width: 100%
        max-width: 260px
    .mobile-signup
      width: 84%
    .signup-button
      font-size: 1.125rem
      font-weight: bold
      width: 100%
      border-radius: 26px
      border: 0px
      padding: 12px 0
      margin: 40px auto 0px auto
      max-width: 350px
      color: white
      background-color: #121d28
      text-align: center
    .qrcode-wrapper
      p
        color: black
    .signup-button:hover
      background-color: #222d38
      cursor: pointer
    #referral-campaign-header
      display: block
      margin-top: 10px
      margin-left: 10px
      .logo
        display: block
        margin: 10px 0
        padding: 15px
      img
        height: 22px
        width: auto
        margin: 10px auto
    .avatar-text
      &.personalised
        text-align: left
    #tagline
      margin: 0 25px 25px 25px
      p
        font-family: Poppins
        font-size: 18px
        font-weight: 500
      &.personalised
        margin-top: 10px
    #intro
      p
        font-family: Lato, sans-serif
        font-size: 18px
        line-height: 1.44
        margin: 25px 35px
        font-weight: normal
        text-align: center
    #callout
      .callout-title
        font-family: Poppins
        font-size: 18px
        font-weight: bold
        text-align: center
        color: #101d28
        margin-top: 15px
      p
        font-family: "Poppins", sans-serif
        text-align: center
        font-size: 32px
        font-weight: 1000
        font-weight: bold
        text-transform: uppercase
      .value
        font-size: 88px
        font-weight: bold
        color: var(--white)
        display: block
    #download
      text-align: center
    #rewards
      font-family: Lato, sans-serif
      font-size: 18px
      line-height: 1.44
      margin: 30px
      p
        font-size: 18px
        font-weight: normal
      h2
        font-family: Lato, sans-serif
        font-size: 18px
        font-weight: bold
    #screenshot1
      text-align: center
      img
        position: relative
        overflow: hidden
        left: 15px
    #screenshot2
      img
        position: relative
        left: 15px
    #screenshot1
      hr
        width: 100%
        margin: 0
    #screenshot2
      text-align: center
    #screenshot2
      hr
        width: 100%
        margin: 0
    .avatar
      float: left
      height: 80px
      width: 80px
      border: 1px #fff solid
      border-radius: 40px
      margin: 5px
      padding: 0
      overflow: hidden
      background-position: center
      background-size: contain
    .avatar-container
      p
        display: block
        margin: 0 auto
        padding-top: 30px
        font-family: "Lato" sans-serif
        font-size: 20px
        line-height: 1.3
        text-align: center

  @media only screen and (min-width: 768px)
    .growth-welcome
      padding-bottom: 50px
      clear: both
      .container-half
        width: 50%
      #screenshot1
        margin-top: 100px
      #screenshot1
        hr
          display: none
      #screenshot2
        hr
          display: none
      #tagline
        p
          font-size: 18px
      #callout
        font-size: 32px
      #callout
        .value
          font-size: 88px
      #intro
        p
          font-size: 18px
      #referral-campaign-header
        margin-left: 30px
      #screenshot2
        img
          left: 0
      #screenshot2-desktop
        img
          left: 0
      .avatar
        margin: 25px
      .avatar-container
        p
          padding-top: 100px
      .qrcode-wrapper
        p
          font-family: Lato, sans-serif
          font-size: 14px
          font-weight: normal
          line-height: 1.86
          margin-top: 2px
          text-align: center
      .qrcode-wrapper
        img
          margin: 0 auto
          margin-top: 10px
      .qrcode-wrapper
        background: #fff
        color: #000
        padding: 5px
        margin: 0 auto
        width: 190px
        height: 190px
        border-radius: 20px
      .what
        .qrcode-wrapper
          margin: 0 0 0 30px
      .page-splitter
        width: 100%
        margin: 50px auto
  @media only screen and (min-width: 990px)
    .container
      max-width: 960px
    #screenshot1
      img
        left: 60px
    #screenshot2
      img
        left: 60px
    #screenshot2-desktop
      img
        left: 60px

  @media only screen and (min-width: 1200px)
    .container
      max-width: 1140px
    #screenshot1
      img
        left: 110px
    #screenshot2
      img
        left: 110px
    #screenshot2-desktop
      img
        left: 110px
`)
