import React, { Component } from 'react'
import Link from 'components/Link'

class RewardsBanner extends Component {
  render() {
    return (
      <>
        <div className="rewards-banner">
          <div className="container">
            <div className="row">
              <div className="col-12">
                <div className="float-left d-none d-sm-block">
                  <img src="images/blue-coins.svg" />
                </div>
                <div className="text float-left">
                  <strong>Earn Free Origin Tokens Today</strong>
                  <br />
                  <span className="d-none lg d-lg-block">
                    Participate in our campaigns and complete tasks on our DApp
                    to earn Origin Tokens.
                  </span>
                </div>
                <div className="float-right">
                  <Link to="/welcome" className="btn btn-primary">
                    Go
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>
      </>
    )
  }
}

export default RewardsBanner

require('react-styl')(`
  .rewards-banner
    background-color: var(--clear-blue)
    height: 85px
    padding-top: 10px
    padding-bottom: 5px
    color: #fff
    font-size: 18px
    border-bottom: 1px solid var(--dark-two)
    img 
      margin: 0 20px 10px 0
    strong
      top: 5px
    .text
      margin-top: 5px
    .btn
      background-color: var(--dark-grey-blue)
      color: var(--white) !important
      margin-top: 12px
      width: 96px
      color: var(--dark-grey-blue)
      border-radius: 2rem
      &:hover
        background-color: var(--dark-blue-grey)
        color: var(--white)

  @media (max-width: 991.98px)
    .rewards-banner
      .text
        margin-top: 18px


`)
