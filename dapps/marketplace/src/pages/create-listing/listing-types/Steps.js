import React from 'react'
import { Switch, Route, Redirect } from 'react-router-dom'

const Steps = ({ steps, linkPrefix, listing, onChange, refetch }) => {
  const props = {
    listing,
    refetch,
    steps: steps.length,
    onChange: listing => onChange(listing)
  }

  function path(step) {
    if (!step) {
      if (listing.id) {
        return `/listing/${listing.id}`
      }
      return '/create/listing-type'
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
            // Check for required fields
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
      <Redirect to={path(steps[0])} />
    </Switch>
  )
}

export default Steps
