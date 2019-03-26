import React from 'react'
import { fbt } from 'fbt-runtime'

const OnboardHelpProfile = () => (
  <div className="onboard-help">
    <h5><fbt desc="onboard.HelpProfile.aboutIdentity">About Identity on the Blockchain</fbt></h5>
    <div className="description">
      <fbt desc="onboard.HelpProfile.description">
        A cryptocurrency wallet is a software program that stores private and
        public keys and interacts with various blockchain to enable users to send
        and receive digital currency and monitor their balance. If you want to use
        Bitcoin or any other cryptocurrency, you will need to have a digital
        wallet.
      </fbt>>
    </div>
    <div className="learn-more">
      <a href="#"><fbt desc="LearnMore">Learn more</fbt></a>
    </div>
  </div>
)

export default OnboardHelpProfile
