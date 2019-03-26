import React from 'react'
import { fbt } from 'fbt-runtime'

import Link from 'components/Link'

const Finished = ({ linkPrefix, redirectto }) => {
  const continueTo = redirectto ? redirectto : `${linkPrefix}/onboard/back`

  return (
    <div className="finished">
      <h1>
        <fbt desc="onboard.Finished.congrats">Congratulations</fbt>
      </h1>
      <div className="help">
        <fbt desc="onboard.Finished.success">
          You’ve successfully activated your account. You’re now ready to
          continue your journey in the Origin Marketplace.
        </fbt>
      </div>
      <div className="lists">
        <div className="list-box completed">
          <fbt desc="onboard.Finished.stepsCompleted">
            <b>You have now completed the following:</b>
            <ul className="list-unstyled">
              <li>Wallet Creation</li>
              <li>Messaging Enabled</li>
              <li>Desktop Notifications Enabled</li>
            </ul>
          </fbt>
        </div>
        <div className="list-box remaining">
          <fbt desc="onboard.Finished.remainingSepts">
            <b>Remaining steps:</b>
            <ul className="list-unstyled">
              <li>Fund your wallet</li>
              <li>Complete your Profile</li>
            </ul>
          </fbt>
        </div>
      </div>

      <Link
        to={continueTo}
        className={`btn btn-primary`}
        children={fbt('OK', 'OK')}
      />
    </div>
  )
}

export default Finished

require('react-styl')(`
  .onboard .finished
    display: flex
    flex-direction: column
    align-items: center
    text-align: center
    padding-top: 20rem
    background: url(images/congratulations-icon.svg) no-repeat center top
    background-size: 18rem
    .help
      max-width: 32rem
    .lists
      display: flex
      flex-wrap: wrap
      justify-content: center
      padding: 1rem 0
      max-width: 800px
      width: 100%
    .list-box
      font-size: 18px
      min-width: 300px
      flex: 1
      border: solid 1px var(--light)
      border-radius: 5px
      text-align: left
      padding: 1rem 1.5rem
      margin: 1rem
      ul
        margin-top: 1rem
        li
          margin-bottom: 0.5rem
          padding-left: 3rem
        li:before
          display: inline-block
          vertical-align: -0.3rem
          margin-right: 1rem
          content: ""
          width: 1.5rem
          height: 1.5rem
          background: var(--light)
          border-radius: 1rem
          margin-left: -2.5rem
      &.completed ul li:before
        background: var(--greenblue) url(images/checkmark-white.svg) no-repeat center
        background-size: 60%

  @media (max-width: 767.98px)
    .onboard .finished
      padding-top: 10rem
      background-size: 10rem

`)
