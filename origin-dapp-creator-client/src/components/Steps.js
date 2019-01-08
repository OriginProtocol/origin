import React from 'react'

const Steps = () => (
  <div className="steps">
    <div className="step step-1">
      <i></i>
      Create Marketplace
    </div>

    <div className="step step-2">
      <i></i>
      Customize Appearance
    </div>

    <div className="step step-3">
      <i></i>
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
    justify-content: center;
    margin: 0 auto;
    position: relative;

  .step
    width: 33.3%;

  .step + .step
    &:after
      content: "";
      display: block;
      width: 5%;
      height: 1px;
      top: px;
      position: absolute;
      background-color: var(--dusk);

  .step-1
    text-align: left;

  .step-2
    text-align: center;

  .step-3
    text-align: right;

  i
    color: var(--dusk);
    display: block;
    content: "I";
    font-size: 1.25rem;
`)
