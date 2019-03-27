import React from 'react'
import { fbt } from 'fbt-runtime'

import DocumentTitle from 'components/DocumentTitle'

const AboutTokens = () => (
  <div className="container about-info">
    <DocumentTitle
      pageTitle={<fbt desc="abouttokens.title">About Origin Tokens</fbt>}
    />
    <h1>
      <fbt desc="abouttokens.title">About Origin Tokens</fbt>
    </h1>

    <div className="row">
      <div className="col-md-6">
        <fbt desc="abouttokens.text1">
          <h3 className="lead lead-text">Overview</h3>
          <p>
            Origin Tokens are ERC-20 tokens that are used on the Origin DApp and
            platform. Origin Tokens may be used to reward marketplace operators,
            DApp creators, users, developers, and/or others that buy, sell, and
            contribute to Origin.
          </p>
        </fbt>
        <fbt desc="abouttokens.text2">
          <h3 className="lead lead-text">What are Origin Tokens used for?</h3>
          <h6>Boosting</h6>
          <p>
            Sellers can use Origin Tokens to boost their listings and get higher
            visibility on the Origin DApp or future third-party DApps. Listings
            with higher visibility are shown more often to buyers and have
            higher chances of being sold successfully. DApps earn Origin Tokens
            from sellers when they successfully complete sales with Boost.
          </p>
        </fbt>
        <fbt desc="abouttokens.text3">
          <h6>Referral Rewards</h6>
          <p>Coming soon</p>
        </fbt>
        <fbt desc="abouttokens.text4">
          <h6>Platform Governance</h6>
          <p>Coming soon</p>
        </fbt>
        <fbt desc="abouttokens.text5">
          <h3 className="lead lead-text">Where can I buy Origin Tokens?</h3>
          <h6>Exchanges</h6>
          <p>
            During Mainnet Beta, Origin Tokens will not be available on any
            exchanges. After the close of Mainnet Beta, we will publish a list
            of approved exchanges where you can purchase Origin Tokens to be
            used on the platform.
          </p>
        </fbt>
      </div>
      <div className="col-md-6 d-none d-md-block">
        <div className="video-placeholder text-center">
          <img src="images/token-powered.jpg" style={{ width: '100%' }} />
        </div>
      </div>
    </div>
  </div>
)

require('react-styl')(`
  .lead-text
    padding: 30px 0 5px 0;
`)

export default AboutTokens
