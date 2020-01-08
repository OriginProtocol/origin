import React, { Component, Fragment } from 'react'
import { Switch, Route } from 'react-router-dom'
import get from 'lodash/get'
import { Query } from 'react-apollo'
import { fbt } from 'fbt-runtime'

import withEnrolmentModal from 'pages/growth/WithEnrolmentModal'
import Onboard from 'pages/onboard/Onboard'

import DocumentTitle from 'components/DocumentTitle'
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

    if (inviteCode && inviteCode.length !== 11) {
      console.warn(
        `Unexpected invite code ${inviteCode}. Invite code should be 11 characters long.`
      )
      inviteCode = undefined
    }

    const localStorageKey = 'growth_invite_code'

    const storedInviteCode = localStorage.getItem(localStorageKey)

    const inviteCodeToUse = storedInviteCode || inviteCode || null
    //prefer the stored invite code, over newly fetched invite code
    this.setState({
      inviteCode: inviteCodeToUse,
      meLink: `${location.origin}/#/welcome${inviteCodeToUse ? `/${inviteCodeToUse}` : ''}`
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
    const { firstName } = identity || {}
    const personalised = !!identity
    const isOriginWallet = ['Origin Wallet', 'Mobile'].includes(this.props.walletType)

    // This is semi legit ¯\_(ツ)_/¯
    const reward_value = 1000
    const isIOS = navigator.platform && /iPad|iPhone|iPod/.test(navigator.platform)
    const appStoreUrl = "https://itunes.apple.com/app/origin-wallet/id1446091928"
    const playStoreUrl = "https://play.google.com/store/apps/details?id=com.origincatcher"

    const onStoreButtonClick = (e) => {
      e.preventDefault()

      const inviteCode = this.state.inviteCode
      const prefix = 'or:'
      const referralCode = inviteCode && inviteCode.startsWith(prefix) ? inviteCode : `${prefix}${inviteCode}`

      clipboard.writeText(referralCode)

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
        colorDark : "#000000",
        colorLight : "#ffffff",
        correctLevel : QRCode.CorrectLevel.H
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
          <div className="container">
            <div className="row">
              <div className="col-md-6 d-flex flex-column">
                <div className="d-none d-md-flex" id="referral-campaign-header">
                  <div className="origin logo"><a href="/"><img src="images/growth/origin-logo@3x.png" alt="Origin" /></a></div>
                </div>
                <section id="tagline">
                  <div className="avatar-container clearfix">
                    <p className="avatar-text">
                      <fbt desc="GrowthWelcome.joinToEarn">
                        Join Origin Rewards to earn
                      </fbt>
                    </p>
                  </div>
                </section>
                <hr />
                <section id="callout">
                  <p>
                    <span className="value">{reward_value}</span>
                    <fbt desc="GrowthWelcome.originTokens">
                      Origin Tokens
                    </fbt>
                  </p>
                </section>
                <hr />
                {isOriginWallet && <this.EnrollButton
                    className="signup-button my-4 mobile-signup"
                    children={fbt('Sign Up Now', 'GrowthWelcome.signUpNow')}
                    urlforonboarding={urlForOnboarding}
                    startopen={arrivedFromOnboarding.toString()}
                  />}
                {!isOriginWallet && 
                  <>
                    <section id="intro">
                      <p>
                        <fbt desc="GrowthWelcome.getStartedByDownloading">
                          Get started by downloading Origin Marketplace - the app that allows you to buy and sell anything using crypto right from your phone.
                        </fbt>
                      </p>
                    </section>
                    <section className="qrcode-wrapper d-none d-md-block">
                      <div id="qrcode1"></div>
                      <p>
                        <fbt desc="GrowthWelcome.scanToInstall">
                          Scan to install our app
                        </fbt>
                      </p>
                    </section>
                    <p id="conjunction" className="d-none d-md-block mb-2 mt-2 text-center">
                      <fbt desc="GrowthWelcome.or">
                        or
                      </fbt>
                    </p>
                    <section id="download">
                      <button
                        id="app-download-button"
                        className="d-md-none"
                        onClick={onStoreButtonClick}
                      >
                        {isIOS && <img className={isIOS ? 'ios' : 'not-ios'} src="images/growth/app-store.svg" alt="Origin" />}
                        {!isIOS && <img className={isIOS ? 'ios' : 'not-ios'} src="images/growth/play-store.svg" alt="Origin" />}
                      </button>
                      <this.EnrollButton
                        className="d-none d-md-block signup-button"
                        children={fbt('Earn From Desktop', 'GrowthWelcome.earnFromDesktop')}
                        urlforonboarding={urlForOnboarding}
                        startopen={arrivedFromOnboarding.toString()}
                      />
                    </section>
                  </>
                }
              </div>
              <div className="col-md-6">
                <section id="screenshot1">
                  <img className="d-md-none" src="images/growth/iphone-1.png" />
                  <img className="d-none d-md-block" src="images/growth/iphone-1-full.png" />
                  <hr />
                </section>
              </div>
            </div>
          </div>
          <hr className="d-none d-md-block page-splitter container" />
          <div className="container">
            <div className="row">
              <div className="col-md-6">
                <section id="screenshot2-desktop" className="d-none d-md-block">
                  <img src="images/growth/iphone-2-full.png" />
                  <hr className="d-md-none" />
                </section>
              </div>
              <div className="col-md-6 what">
                <section id="rewards">
                  <h2>
                    <fbt desc="GrowthWelcome.whatAreRewards">
                      What are Origin Rewards?
                    </fbt>
                  </h2>
                  <p>
                    <fbt desc="GrowthWelcome.ognIsRewardsEarned">
                      OGN is a rewards cryptocurrency earned by Origin users. Earn rewards when you verify your account or invite your friends to join Origin. Even get OGN as cash back when you buy and sell.
                    </fbt>
                  </p>
                </section>
                <section id="screenshot2" className="d-md-none">
                  <img src="images/growth/iphone-2.png" />
                  <hr />
                </section>
                <section className="qrcode-wrapper d-none d-md-block">
                  <div id="qrcode2"></div>
                  <p>
                    <fbt desc="GrowthWelcome.scanToInstall">
                      Scan to install our app
                    </fbt>
                  </p>
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
        &.ios
          height: 93px
        &.not-ios
          height: 84px
    .mobile-signup
      width: 84%
    .signup-button
      font-size: 1.125rem
      width: 100%
      border-radius: 26px
      border: solid 1px var(--white)
      padding: 12px 0
      margin: 0 auto
      max-width: 350px
      color: white
      background-color: transparent
      text-align: center
    .qrcode-wrapper
      p
        color: black
    .signup-button:hover
      background-color: #036ddd
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
    #tagline
      margin: 0 25px 25px 25px
    #intro
      p
        font-family: Lato, sans-serif
        font-size: 20px
        line-height: 1.3
        margin: 30px
    #callout
      p
        font-family: "Poppins", sans-serif
        text-align: center
        font-size: 27px
        font-weight: 1000
        text-transform: uppercase
      .value
        display: block
        font-size: 72px
    #download
      text-align: center
    #rewards
      font-family: Lato, sans-serif
      font-size: 18px
      line-height: 1.44
      margin: 30px
      h2
        font-family: Lato, sans-serif
        font-size: 18px
        font-weight: bold
    #screenshot1
      text-align: center
      img
        position: relative
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
        padding-top: 15px
        font-family: "Lato" sans-serif
        font-size: 20px
        line-height: 1.3
        text-align: center

  @media only screen and (min-width: 768px)
    .growth-welcome
      padding-bottom: 50px
      clear: both
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
          font-size: 25px
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
          padding-top: 30px
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
      max-width: 960px;
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
