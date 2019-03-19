import React from 'react'
import { Switch, Route, Redirect } from 'react-router-dom'

// This components creates a <switch> for rendering the creation steps for each listing type

const Steps = ({ steps, linkPrefix, listing, onChange, refetch }) => {
  const props = {
    listing,
    refetch,
    steps: steps.length,
    onChange: listing => onChange(listing)
  }

  function path(step) {
    if (!step) {
      return linkPrefix.replace('/details', '')
    }
    return `${linkPrefix}${step.path ? `/${step.path}` : ''}`
  }

  return (
    <Switch>
      {steps.map((step, idx) => (
        <Route
          key={idx}
          path={path(step)}
          exact={!step.path}
          render={() => {
            const requiredStep = steps.find(
              (s, i) => i <= idx && s.require && !listing[s.require]
            )
            if (requiredStep) {
              const prev = steps[steps.indexOf(requiredStep) - 1]
              return <Redirect to={path(prev)} />
            }

            return (
              <step.component
                {...props}
                step={step.step}
                prev={path(steps[idx - 1])}
                next={steps[idx + 1] ? path(steps[idx + 1]) : null}
              />
            )
          }}
        />
      ))}
    </Switch>
  )
}

export default Steps
