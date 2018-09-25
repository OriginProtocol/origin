import React from 'react'
import { FormattedMessage, FormattedNumber } from 'react-intl'

export default [
  {
    name: (
      <FormattedMessage
        id={'onboarding-steps.stepOneName'}
        defaultMessage={'Overview'}
      />
    ),
    description: (
      <FormattedMessage
        id={'onboarding-steps.stepOneDescription'}
        defaultMessage={'How to start selling on the Origin DApp'}
      />
    ),
    position: 1,
    complete: false,
    heading: (
      <h3>
        <FormattedMessage
          id={'onboarding-steps.stepOneHeading'}
          defaultMessage={'Selling on the Origin DApp'}
        />
      </h3>
    ),
    img: <img src="/images/eth-tokens.svg" alt="eth-tokens" />,
    content: (
      <div>
        <p className="step-text">
          <FormattedMessage
            id={'onboarding-steps.stepOneContentPartOne'}
            defaultMessage={
              'In order to sell on the Origin DApp, you will need to connect a wallet in order to accept payment in'
            }
          />
          <mark className="eth">ETH</mark>.
        </p>
        <p className="step-text">
          <FormattedMessage
            id={'onboarding-steps.stepOneContentPartTwo'}
            defaultMessage={
              'Payment for goods and services on the Origin DApp is always made using'
            }
          />
          <mark className="eth">ETH</mark>.
        </p>
      </div>
    )
  },
  {
    name: (
      <FormattedMessage
        id={'onboarding-steps.stepTwoName'}
        defaultMessage={'Connect Wallet'}
      />
    ),
    description: (
      <FormattedMessage
        id={'onboarding-steps.stepTwoDescription'}
        defaultMessage={'Connect your wallet to start selling'}
      />
    ),
    position: 2,
    complete: false,
    // subStepComplete: false,
    heading: (
      <h3>
        <FormattedMessage
          id={'onboarding-steps.stepTwoHeading'}
          defaultMessage={'Connect Your Wallet'}
        />
      </h3>
    ),
    img: <img src="/images/metamask.svg" alt="eth-tokens" />,
    content: (
      <div>
        <p className="step-text">
          <FormattedMessage
            id={'onboarding-steps.stepTwoContent'}
            defaultMessage={'You will need a wallet to withdraw/deposit on the Origin DApp. We recommend using'}
          />
          <a href="https://metamask.io/" target="_blank" rel="noopener noreferrer">MetaMask</a>.
        </p>
      </div>
    ),
    // subStep: {
    //   name: 'Connected',
    //   heading: <h3>MetaMask is connected</h3>,
    //   img: <img src="/images/metamask.svg" alt="eth-tokens" />,
    //   content: (
    //     <div className="connected">
    //       <p className="step-text">
    //         We&#39;ve detected a MetaMask wallet. <br />
    //         You&#39;re one step closer to selling on the Origin DApp. Click the
    //         button below to learn about Origin Tokens and boosting your
    //         listings.
    //       </p>
    //     </div>
    //   )
    // }
  },
  {
    name: (
      <FormattedMessage
        id={'onboarding-steps.stepThreeName'}
        defaultMessage={'Get Origin Tokens'}
      />
    ),
    description: (
      <FormattedMessage
        id={'onboarding-steps.stepThreeDescription'}
        defaultMessage={'Increase the likelihood of successfully selling'}
      />
    ),
    position: 3,
    complete: false,
    heading: (
      <h3>
        <FormattedMessage
          id={'onboarding-steps.stepThreeHeading'}
          defaultMessage={'Origin Tokens and Boosting'}
        />
      </h3>
    ),
    img: <img src="/images/ogn-token.svg" alt="eth-tokens" />,
    content: (
      <div>
        <p className="step-text">
          <FormattedMessage
            id={'onboarding-steps.stepThreeContentPartOne'}
            defaultMessage={'Origin Tokens'}
          />
          &nbsp;(Symbol: <mark className="ogn">OGN</mark>)&nbsp;
          <FormattedMessage
            id={'onboarding-steps.stepThreeContentPartTwo'}
            defaultMessage={'are used on the Origin DApp to boost your listings.'}
          />
        </p>
        <p className="step-text">
          <FormattedMessage
            id={'onboarding-steps.stepThreeContentPartThree'}
            defaultMessage={'Boosting will give your listing more visibility.'}
          />
        </p>
      </div>
    )
  }
]
