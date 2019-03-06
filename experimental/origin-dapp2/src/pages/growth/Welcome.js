import React, { Component, Fragment } from 'react'
import withEnrolmentModal from 'pages/growth/WithEnrolmentModal'
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
    this.state = {}

    this.EnrollButton = withEnrolmentModal('button')
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
      <div className="container growth-welcome">
        <div className="row">
          <div className="col-6 d-flex flex-column">
            <Link to="/">
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
              skipjoincampaign="false"
            />
          </div>
          <div className="col-6 token-stack-holder">
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
`)
