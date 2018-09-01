import React, { Component } from 'react'

export default function({ steps, firstIncompleteStep }) {
  const selected = (name) => {
    const matchingStep = firstIncompleteStep.name === name

    return matchingStep ? 'selected' : ''
  }
  const completed = (complete=false) => complete ? 'complete' : 'incomplete'

  return (
    <div className="d-none d-sm-block d-sm-flex flex-column col-4 text-left left-panel">
      { steps && steps.map(({name, description, complete}, i) => (
        <div key={name} className={`content d-flex ${selected(name)}`}>
          <div className={`${completed(complete)} rounded-circle col`}></div>
          <div className="panel-text d-flex flex-column">
            <span>{name}</span>
            <p>{description}</p>
          </div>
        </div>
      ))}
    </div>
  )
}
