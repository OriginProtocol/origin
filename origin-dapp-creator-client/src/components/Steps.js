import React from 'react'

const Steps = () => (
  <div className="steps">
    <div className="step step-1">
      <div>
        <img src="images/marketplace-icon-inactive.svg" />
      </div>
      Create Marketplace
    </div>
    <div className="step step-2">
      <div>
        <img src="images/appearance-icon-inactive.svg" />
      </div>
      Customize Appearance
    </div>
    <div className="step step-3">
      <div>
        <img src="images/settings-icon-inactive.svg" />
      </div>
      Configure Settings
    </div>
  </div>
)

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

  .step img
    padding: 0.25rem

  .step-1, .step-2
    &:after
      content: ""
      display: block
      width: 20%
      height: 1px
      top: 2.8rem
      position: absolute;
      background-color: var(--light);

  .step-1
    &:after
      left: 27%

  .step-2
    &:after
      left: 54%
`)

