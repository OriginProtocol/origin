import React, { Component, Fragment } from 'react'
import Link from 'components/Link'
import EnrollmentModal from './EnrollmentModal'
import { Mutation } from 'react-apollo'
import SetOpenedModalMutation from 'mutations/SetOpenedModal'

function InfographicsBox(props) {
  const { image, title, text } = props

  return (
    <Fragment>
      <div className="col infographics d-flex flex-column m-3">
        <img className="p-4 mt-auto" src={image} />
        <div className="text-center title pt-3 pl-3 pr-3">{title}</div>
        <div className="text-center text p-3 pb-4">{text}</div>
      </div>
    </Fragment>
  )
}

class GrowthWelcome extends Component {
  state = {}

  onSignUp(setOpenedModal) {
    setOpenedModal({
      variables: {
        modalName: 'GrowthEnroll'
      }
    })
  }

  render() {
    // <Mutation
    //     mutation={SetOpenedModalMutation}
    //     onCompleted={}
    //     onError={}
    //   >
    return (
      <Mutation
        mutation={SetOpenedModalMutation}
      >
        {setOpenedModal => (
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
                  the chance to will up to 2000 OGN currently valued at 2000 USD.
                  Don’t miss this amazing opportunity
                </div>
                <button
                  className="btn btn-primary btn-rounded"
                  children="Sign up for Origin"
                  onClick={() => this.onSignUp(setOpenedModal)}
                />
              </div>
              <div className="col-6"> Here be very nice graphic someday.</div>
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
                image="images/ogn-icon-horiz.svg"
                title="Placeholder title"
                text="Etiam et lacus ut nisi rutrum egestas in nec mi. Morbi auctor metus eu ante condimentum, in tempus enim hendrerit. Donec a molestie velit."
              />
              <InfographicsBox
                image="images/ogn-icon-horiz.svg"
                title="Placeholder title"
                text="Etiam et lacus ut nisi rutrum egestas in nec mi. Morbi auctor metus eu ante condimentum, in tempus enim hendrerit. Donec a molestie velit."
              />
              <InfographicsBox
                image="images/ogn-icon-horiz.svg"
                title="Placeholder title"
                text="Etiam et lacus ut nisi rutrum egestas in nec mi. Morbi auctor metus eu ante condimentum, in tempus enim hendrerit. Donec a molestie velit."
              />
            </div>
          </div>
        )}
      </Mutation>
    )
  }
}

export default GrowthWelcome

require('react-styl')(`
  .growth-welcome
    margin-top: 100px;
    .logo
      width: 118px;
    .title-text
      margin-top: 40px;
      margin-bottom: 16px;
      font-family: Poppins;
      font-size: 50px;
      font-weight: 200;
      line-height: 1.3;
    .btn
      margin-top: 40px;
      width: 336px;
      height: 60px;
      font-size: 24px;
      font-weight: 900;
    .info-title
      font-size: 28px;
      font-family: Poppins;
      font-weight: bold;
      text-align: center;
    .infographics
      background-color: #f1f6f9;
      border-radius: 5px;
      height: 317px;
      .title
        text-align: center;
        font-weight: bold;
      .text
        text-align: center;
        font-size: 14px;
`)
