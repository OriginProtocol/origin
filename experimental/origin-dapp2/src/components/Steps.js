import React from 'react'

/* Progress bar of discrete steps */

const Steps = ({ step, steps = 5 }) => (
  <div className="step-lines">
    {Array.from({ length: steps }, (v, i) => i + 1).map(idx => (
      <div key={idx} className={`step${step >= idx ? ' active' : ''}`} />
    ))}
  </div>
)

export default Steps

require('react-styl')(`
  .step-lines
    display: flex
    margin-bottom: 1.5rem
    > .step
      flex: 1
      height: 2px
      background: var(--pale-grey-two)
      margin-right: 2px
      border-radius: 2px
      &.active
        background: var(--clear-blue)
`)
