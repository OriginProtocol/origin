import React, { Component } from 'react'
import { FormattedMessage } from 'react-intl'

class Guidance extends Component {
  render() {
    return (
      <div className="guidance">
        <div className="image-container text-center">
          <img src="images/identity.svg" alt="identity icon" />
        </div>
        <p>
          <FormattedMessage
            id={'_Guidance.content'}
            defaultMessage={
              '{verifyingYourProfile} allows other users to know that you are a real person and increases the chances of successful transactions on Origin.'
            }
            values={{
              verifyingYourProfile: (
                <strong>
                  <FormattedMessage
                    id={'_Guidance.verifyingYourProfile'}
                    defaultMessage={'Verifying your profile'}
                  />
                </strong>
              )
            }}
          />
        </p>
      </div>
    )
  }
}

export default Guidance
