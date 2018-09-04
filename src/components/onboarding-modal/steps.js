import React from 'react'

export default [
  {
    name: 'Overview',
    description: 'How to start selling on the Origin DApp',
    position: 1,
    complete: false,
    heading: (
      <h3>Selling on the Origin DApp</h3>
    ),
    img: <img src="/images/eth-tokens.svg" alt="eth-tokens" />,
    content: (
      <div>
        <p className="step-text">
          In order to sell on the Origin DApp, you will need to connect
          a wallet in order to accept payment in <mark className="eth">ETH</mark>
        </p>
        <p className="step-text">
          Payment for goods and services on the Origin DApp are always made in
          <mark className="eth">ETH</mark>
        </p>
      </div>
    )
  },
  {
    name: 'Connect Wallet',
    description: 'Connect your wallet to start selling',
    position: 2,
    complete: false,
    subStepComplete: false,
    heading: (
      <h3>Connect your Wallet</h3>
    ),
    img: <img src="/images/metamask-mobile.svg" alt="eth-tokens" />,
    content: (
      <div>
        <p className="step-text">
          You will need a wallet to withdraw/deposit on the Origin DApp. Use a
          metamask wallet or Origin&#39;s Mobile Wallet App.
        </p>
      </div>
    ),
    subStep: {
      name: 'Connected',
      heading: <h3>Metamask is connected</h3>,
      img: <img src="/images/metamask.svg" alt="eth-tokens" />,
      content: (
        <div className="connected">
          <p className="step-text">
            We&#39;ve detected a Metamask wallet. <br />
            You&#39;re one step closer to selling on the Origin DApp. Click the
            button below to learn about Origin Tokens and boosting your listings.
          </p>
        </div>
      )
    }
  },
  {
    name: 'Get Origin Tokens',
    description: 'Connect your wallet to start selling',
    position: 3,
    complete: false,
    heading: (
      <h3>Origin Tokens and Boosting</h3>
    ),
    img: <img src="/images/ogn-token.svg" alt="eth-tokens" />,
    content: (
      <div>
        <p className="step-text">
          Origin Tokens (Symbol: <mark className="ogn">OGN</mark>) are used on
          the Origin DApp to boost your listings.
        </p>
        <p className="step-text">
          Boosting will give your listing more visibility and also works as a
          guarantee from the seller if something goes wrong with the transaction.
        </p>
      </div>
    )
  }
]
