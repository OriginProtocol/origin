import React from 'react'
import { FormattedMessage } from 'react-intl'

const hasWallet = true

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
        defaultMessage={'Get started selling on the Origin DApp.'}
      />
    ),
    position: 1,
    complete: false,
    heading: (
      <h3>
        <FormattedMessage
          id={'onboarding-steps.stepOneHeading'}
          defaultMessage={'Get started selling on Origin.'}
        />
      </h3>
    ),
    img: <img src="/images/eth-tokens.svg" alt="eth-tokens" />,
    content: (
      <div>
        <p className="step-text">
          {hasWallet &&
            <FormattedMessage
              id={'onboarding-steps.stepOneContentPartOneWithWallet'}
              defaultMessage={
                'You will use your Ethereum wallet to create listings and accept payment.'
              }
            />
          }
          {!hasWallet &&
            <FormattedMessage
              id={'onboarding-steps.stepOneContentPartOneWithoutWallet'}
              defaultMessage={
                'You will need an Ethereum wallet to create listings and accept payment.'
              }
            />
          }
        </p>
        <p className="step-text">
          <FormattedMessage
            id={'onboarding-steps.stepOneContentPartTwo'}
            defaultMessage={
              'Transactions on the Origin DApp are always made using {ethMark}.'
            }
            values={{
              ethMark: (
                <mark className="eth">ETH</mark>
              )
            }}
          />
        </p>
      </div>
    )
  },
  {
    name: (
      <FormattedMessage
        id={'onboarding-steps.stepTwoName'}
        defaultMessage={'Identity'}
      />
    ),
    description: (
      <FormattedMessage
        id={'onboarding-steps.stepTwoDescription'}
        defaultMessage={'Increase trust and gain reputation with buyers.'}
      />
    ),
    position: 2,
    complete: false,
    heading: (
      <h3>
        <FormattedMessage
          id={'onboarding-steps.stepTwoHeading'}
          defaultMessage={'Get verified on Origin.'}
        />
      </h3>
    ),
    img: <img src="/images/identity.svg" alt="identity" />,
    content: (
      <div>
        <p className="step-text">
          <FormattedMessage
            id={'onboarding-steps.stepTwoContent'}
            defaultMessage={'Verifying your profile allows other users to know that you are a real person and increases the chances of successful transactions on Origin.'}
          />
        </p>
      </div>
    )
  },
  {
    name: (
      <FormattedMessage
        id={'onboarding-steps.stepThreeName'}
        defaultMessage={'Origin Tokens'}
      />
    ),
    description: (
      <FormattedMessage
        id={'onboarding-steps.stepThreeDescription'}
        defaultMessage={'Improve the chances of selling your good or service.'}
      />
    ),
    position: 3,
    complete: false,
    heading: (
      <h3>
        <FormattedMessage
          id={'onboarding-steps.stepThreeHeading'}
          defaultMessage={'Boost your listings with Origin Tokens'}
        />
      </h3>
    ),
    img: <img src="/images/ogn-icon-horiz.svg" alt="ogn-token" />,
    content: (
      <div>
        <p className="step-text">
          <FormattedMessage
            id={'onboarding-steps.stepThreeContentPartOne'}
            defaultMessage={'Origin Tokens (Symbol: {ognMark}) are used on the Origin DApp to boost your listings.'}
            values={{
              ognMark: (
                <mark className="ogn">OGN</mark>
              )
            }}
          />
        </p>
        <p className="step-text">
          <FormattedMessage
            id={'onboarding-steps.stepThreeContentPartTwo'}
            defaultMessage={'Boosting will give your listing more visibility and increase the likelihood of successfully selling.'}
          />
        </p>
      </div>
    )
  }
]
