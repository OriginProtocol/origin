import React from 'react'

const AboutTokens = () => {
  return (
    <div className="about-tokens-wrapper">
      <div className="container">
        <div className="row">
          <div className="col-md-6">
            <h1>About Origin Tokens</h1>
            <div className="video-placeholder d-md-none text-center">
              <img src="/images/tokens.gif" />
            </div>
            <h3 className="lead lead-text">Overview</h3>
            <p>Origin Tokens are ERC-20 tokens that are used on the Origin DApp and platform. Origin Tokens may be used to reward marketplace operators, DApp creators, users, developers, and/or others that buy, sell, and contribute to Origin.</p>
            <h3 className="lead lead-text">What are Origin Tokens used for?</h3>
            <h6>
              <strong>Boosting</strong>
            </h6>
            <p>Sellers can use Origin Tokens to boost their listings and get higher visibility on the Origin DApp or future third-party DApps. Listings with higher visibility are shown more often to buyers and have a higher chance of being sold successfully. DApps earn Origin Tokens from sellers when they successfully complete sales with Boost.</p>
            <h6>
              <strong>Referral Rewards</strong>
            </h6>
            <p>Coming soon</p>
            <h6>
              <strong>Platform Governance</strong>
            </h6>
            <p>Coming soon</p>
            <h3 className="lead lead-text">Where can I buy Origin Tokens?</h3>
            <h6>
              <strong>Exchanges</strong>
            </h6>
            <p>During Mainnet Beta, Origin Tokens will not be available on any exchanges. After the close of Mainnet Beta, we will publish a list of approved exchanges where you can purchase Origin Tokens to be used on the platform.</p>
          </div>
          <div className="col-md-6 d-none d-md-block">
            <div className="video-placeholder text-center">
              <img src="/images/tokens.gif" />
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default AboutTokens
