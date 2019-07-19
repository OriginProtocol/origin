import React, { Component } from 'react'
import { fbt } from 'fbt-runtime'
import withIsMobile from 'hoc/withIsMobile'

class GrowthBanned extends Component {
  constructor(props) {
    super(props)
  }

  render() {
    const { isMobile } = this.props

    return (
      <div
        className={`container growth-banned ${
          isMobile ? 'mobile' : ''
        } d-flex flex-column align-items-center`}
      >
        <img className="pl-2 pr-1" src="images/banned-icon.svg" />
        <h1 className="mt-5">
          <fbt desc="growth-banned.account not eligible">
            Your account is not eligible for Origin Rewards
          </fbt>
        </h1>
        <h2>
          <fbt desc="growth-banned.notEligibleExplanation">
            We have detected suspicious activity on your account. Note that
            duplicate accounts are not eligible for participating in Origin
            Rewards.
          </fbt>
        </h2>
      </div>
    )
  }
}

export default withIsMobile(GrowthBanned)

require('react-styl')(`
  .growth-banned.mobile
    img
      margin-top: 4rem
      width: 13.25rem
      height: 13.25rem
    h1
      font-size: 1.5rem
    h2
      font-size: 0.875rem
  .growth-banned.container
    max-width: 40rem
  .growth-banned
    img
      width: 16.25rem
      height: 16.25rem
      margin-top: 8rem
    h1
      text-align: center
      font-size: 2.5rem
      font-weight: 200
      color: var(--dark)

    h2
      text-align: center
      font-size: 1.125rem
      font-weight: 300
      color: var(--dark)
      font-family: Lato
`)
