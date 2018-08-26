import React, { Component } from 'react'

export default function({ steps, firstIncompleteStep }) {
  const selected = (name) => {
    const matchingStep = firstIncompleteStep.name === name

    return matchingStep ? 'selected' : ''
  }
  const completed = (complete=false) => complete ? 'complete' : 'incomplete'

  return (
    <div className="flex-column col-4 text-left left-panel">
      { steps && steps.map(({name, description, complete}, i) => (
        <div key={name} className={`content ${selected(name)}`}>
          <div className={`${completed(complete)} rounded-circle`}></div>
          <span>{name}</span>
          <p className="text-muted">{description}</p>
        </div>
      ))}
    </div>
  )
}
