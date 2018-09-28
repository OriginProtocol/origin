import React from 'react'
import { withRouter } from 'react-router'
import { connect } from 'react-redux'

function LeftPanel({ steps, firstIncompleteStep }) {
  const selected = (selectedName, subStep) => {
    const matchingStep = firstIncompleteStep.name == selectedName
    const matchingSubStep = subStep && firstIncompleteStep.name == subStep.name
    return (matchingStep || matchingSubStep) && 'selected'
  }
  const completed = complete => (complete ? 'complete' : 'incomplete')

  return (
    <div className="d-none d-sm-block d-sm-flex flex-column col-4 text-left left-panel">
      {steps &&
        steps.map(({ name, description, complete, subStep }, index) => (
          <div
            key={index}
            className={`content d-flex ${selected(name, subStep)}`}
          >
            <div className={`${completed(complete)} rounded-circle col`} />
            <div className="panel-text d-flex flex-column">
              <span>{name}</span>
              <p>{description}</p>
            </div>
          </div>
        ))}
    </div>
  )
}

const mapStateToProps = ({ onboarding: { steps } }) => ({ steps })

export default withRouter(connect(mapStateToProps)(LeftPanel))
