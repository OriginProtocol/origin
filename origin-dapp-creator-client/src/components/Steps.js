'use strict'

import React from 'react'

import MarketplaceIcon from '!react-svg-loader!../assets/marketplace-icon.svg'
import AppearanceIcon from '!react-svg-loader!../assets/appearance-icon.svg'
import SettingsIcon from '!react-svg-loader!../assets/settings-icon.svg'

class Steps extends React.Component {
  constructor(props) {
    super(props)

    this.state = {
      steps: [
        {
          path: '/',
          title: 'Create Marketplace',
          icon: <MarketplaceIcon />
        },
        {
          path: '/customize',
          title: 'Customize Appearance',
          icon: <AppearanceIcon />
        },
        {
          path: '/configure',
          title: 'Configure Settings',
          icon: <SettingsIcon />
        },
        {
          path: '/metamask'
        },
        {
          path: '/resolver'
        },
        {
          path: '/success'
        },
        {
          path: '/customdomain'
        }
      ]
    }
  }

  stepClassNames(step, i) {
    let classNames = `step step-${i}`
    if (!this.props.location) {
      return classNames
    }
    if (this.props.location.pathname === step.path) {
      classNames += ' active'
    }
    if (this.currentStepIndex() > i) {
      classNames += ' completed'
    }
    return classNames
  }

  currentStepIndex() {
    if (!this.props.location) {
      return -1
    }
    const currentStep = this.state.steps.find(step => {
      return this.props.location.pathname === step.path
    })
    return this.state.steps.indexOf(currentStep)
  }

  render() {
    return (
      <div className="steps">
        {this.state.steps.map(
          (step, i) =>
            step.title && (
              <div className={this.stepClassNames(step, i)} key={i}>
                <div className="svg-wrapper">
                  {step.icon}
                  {this.currentStepIndex() > i && (
                    <img src="images/checkmark-icon.svg" />
                  )}
                </div>
                {step.title}
              </div>
            )
        )}
      </div>
    )
  }
}

export default Steps

require('react-styl')(`
  .steps
    padding: 2rem 8rem;
    font-size: 0.875rem;
    border-top-left-radius: var(--default-radius);
    border-top-right-radius: var(--default-radius);
    background-color: var(--pale-grey-four);
    border-bottom: 1px solid #c2cbd3;
    display: flex;
    justify-content: space-between
    margin: 0 auto;
    position: relative;

  .step
    text-align: center
    svg
      margin: 0.25rem

  .step.completed
    img
      margin-left: -0.6rem
      margin-top: 0.8rem

  .step.active
    color: var(--dark)
    svg
      path
        fill: var(--dark)

  .step-0, .step-1
    &:after
      content: ""
      display: block
      width: 20%
      height: 1px
      top: 2.8rem
      position: absolute;
      background-color: var(--light);

  .step-0
    &:after
      left: 27%

  .step-1
    &:after
      left: 54%
`)
