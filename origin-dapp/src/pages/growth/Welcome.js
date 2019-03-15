import React, { Component, Fragment } from 'react'
import withEnrolmentModal from 'pages/growth/WithEnrolmentModal'
import { Switch, Route } from 'react-router-dom'
import get from 'lodash/get'

import PageTitle from 'components/PageTitle'
import Onboard from 'pages/onboard/Onboard'
import Link from 'components/Link'

function InfographicsBox(props) {
  const { image, title, text } = props

  return (
    <Fragment>
      <div className="col infographics d-flex flex-column m-3">
        <img className="pt-4 mt-auto" src={image} />
        <div className="text-center title pt-3 pl-3 pr-3">{title}</div>
        <div className="text-center text p-3 pb-4">{text}</div>
      </div>
    </Fragment>
  )
}

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
    // prefer the stored invite code, than newly fetched invite code
    this.setState({
      inviteCode: storedInviteCode || inviteCode || null
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
    return(
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

  renderWelcomePage(arrivedFromOnboarding) {
    const personalised = true
    const urlForOnboarding = '/welcome/onboard' + (this.state.inviteCode ?
      `/${this.state.inviteCode}` :
      '')

    return (
      <div className="container growth-welcome">
        <div className="row">
          <div className="col-6 d-flex flex-column">
            <Link to="/" className="mr-auto">
              <img className="logo" src="/images/origin-logo-footer.svg" />
            </Link>
            <div className="title-text">
              Your friend Aure has invited you to earn <b>FREE Origin Tokens</b>
            </div>
            <div className="sub-title-text">
              Create an account on Origin today and start completing tasks for
              the chance to earn up to 2000 OGN currently valued at 2000 USD.
              Don’t miss this amazing opportunity!
            </div>
            <this.EnrollButton
              className="btn btn-primary btn-rounded"
              type="submit"
              children="Sign up for Origin"
              urlforonboarding={urlForOnboarding}
              startopen={arrivedFromOnboarding.toString()}
            />
          </div>
          <div className="col-6 token-stack-holder">
            {personalised && (
              <div className="personalised-holder d-flex flex-column">
                <div className="message-bubble ml-auto d-flex align-items-center">
                  Hey, come earn some tokens on Origin!
                </div>
                <div className="d-flex justify-content-end">
                  <div className="d-flex flex-column align-items-end">
                    <div className="triangle" />
                    <div className="referrer">Aure G.</div>
                  </div>
                  <div className="profile-holder d-flex justify-content-center">
                    <img src="images/growth/profile-person.svg" />
                  </div>
                </div>
              </div>
            )}
            <img
              className="m-4 token-stack"
              src="images/growth/token-stack.svg"
            />
            <img className="free-badge" src="images/growth/free-badge.svg" />
          </div>
        </div>
        <div className="row">
          <div className="col-12 d-flex flex-column mt-5">
            <div className="info-title">What are Origin Tokens?</div>
            <div className="text-center">
              Origin Tokens are a unique cryptocurrency that can be used in the
              Origin Marketplace.
            </div>
          </div>
        </div>
        <div className="row mt-3">
          <InfographicsBox
            image="images/growth/wallet-graphic.svg"
            title="Placeholder title"
            text="Etiam et lacus ut nisi rutrum egestas in nec mi. Morbi auctor metus eu ante condimentum, in tempus enim hendrerit. Donec a molestie velit."
          />
          <InfographicsBox
            image="images/growth/messaging-graphic.svg"
            title="Placeholder title"
            text="Etiam et lacus ut nisi rutrum egestas in nec mi. Morbi auctor metus eu ante condimentum, in tempus enim hendrerit. Donec a molestie velit."
          />
          <InfographicsBox
            image="images/growth/alerts-graphic.svg"
            title="Placeholder title"
            text="Etiam et lacus ut nisi rutrum egestas in nec mi. Morbi auctor metus eu ante condimentum, in tempus enim hendrerit. Donec a molestie velit."
          />
        </div>
      </div>
    )
  }
}

export default GrowthWelcome

require('react-styl')(`
  .growth-welcome
    margin-top: 100px
    .logo
      width: 118px
    .title-text
      margin-top: 40px
      margin-bottom: 16px
      font-family: Poppins
      font-size: 50px
      font-weight: 200
      line-height: 1.3
    .btn
      margin-top: 40px
      width: 336px
      height: 60px
      font-size: 24px
      font-weight: 900
    .info-title
      font-size: 28px
      font-family: Poppins
      font-weight: bold
      text-align: center
    .token-stack-holder
      position: relative
    .token-stack
      width: 440px
    .free-badge
      position: absolute
      width: 168px
      right: 15px
      bottom: 35px
    .infographics
      background-color: #f1f6f9
      border-radius: 5px
      height: 317px
      .title
        text-align: center
        font-weight: bold
      .text
        text-align: center
        font-size: 14px
    .personalised-holder
      position: absolute
      right: 0
    .message-bubble
      padding: 10px 20px
      background-color: var(--pale-grey-eight)
      height: 77px;
      border-radius: 45px
      border: solid 2px var(--white)
    .triangle
      width: 0
      height: 0
      border-left: 23px solid transparent
      border-right: 23px solid transparent
      border-top: 23px solid var(--pale-grey-eight)
      transform: rotate(225deg)
      margin-top: -16px
    .profile-holder
      background-color: var(--dark-grey-blue)
      width: 60px
      height: 60px
      border-radius: 75px
      border: solid 2px var(--pale-grey-eight)
      overflow: hidden
    .referrer
      margin-top: 20px
      margin-right: 10px
`)
