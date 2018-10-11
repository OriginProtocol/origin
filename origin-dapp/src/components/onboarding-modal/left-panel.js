import React from 'react'
import { withRouter } from 'react-router'
import { connect } from 'react-redux'

function LeftPanel({ steps, firstIncompleteStep, selectStep }) {
  const selected = ({ name, selected }) => {
    if (selected) return 'selected'
    return firstIncompleteStep.name === name && 'selected'
  }
  const completed = complete => (complete ? 'complete' : 'incomplete')

  return (
    <div className="d-none d-sm-block d-sm-flex flex-column col-4 text-left left-panel">
      {steps &&
        steps.map((step, index) => (
          <div
            key={index}
            className={`content d-flex ${selected(step)}`}
            onClick={() => selectStep({ selectedStep: step })}
          >
            <div className={`${completed(step.complete)} rounded-circle col`} />
            <div className="panel-text d-flex flex-column">
              <span>{step.name}</span>
              <p>{step.description}</p>
            </div>
          </div>
        ))}
    </div>
  )
}

const mapStateToProps = ({ onboarding: { steps } }) => ({ steps })

export default withRouter(connect(mapStateToProps)(LeftPanel))
