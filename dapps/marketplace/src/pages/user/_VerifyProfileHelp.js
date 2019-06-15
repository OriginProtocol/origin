import React from 'react'

import { fbt } from 'fbt-runtime'

const VerifyProfileHelp = () => {
  return (
    <div className="verify-help-text">
      <img src="images/identity/identity-module-icon.svg" />
      <div>
        <fbt desc="Profile.verifyForSuccessfulTx">
          <strong>Verifying your profile</strong> allows other users to know that you are real and increases the chances of successful transactions on Origin.
        </fbt>
      </div>
    </div>
  )
}

export default VerifyProfileHelp

require('react-styl')(`
  .verify-help-text
    border-radius: 5px
    border: solid 1px var(--pale-grey-two)
    background-color: var(--pale-grey-four)
    margin: 1rem 0
    padding: 1.5rem
    > img
      height: 60px
      width: 60px
      display: block
      margin: 0 auto 1rem auto
    > div
      font-size: 0.8rem
      font-family: Lato
      font-weight: 300
      line-height: 1.43
      color: var(--dark-blue-grey)
`)
