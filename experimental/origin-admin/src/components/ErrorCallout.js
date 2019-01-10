import React from 'react'

import { Callout } from '@blueprintjs/core'

const ErrorCallout = ({ error }) => {
  if (!error) return null
  return (
    <Callout style={{ marginBottom: 15 }} intent="danger" icon="error">
      {error.message || error.toString()}
    </Callout>
  )
}

export default ErrorCallout
