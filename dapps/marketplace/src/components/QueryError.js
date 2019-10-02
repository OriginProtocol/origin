import React from 'react'
import { fbt } from 'fbt-runtime'
import { captureWithScope } from 'utils/sentry'

const QueryError = props => {
  console.error(props.error)

  if (props.query) {
    console.log(props.query.loc.source.body)
  }
  if (props.vars) {
    console.log(JSON.stringify(props.vars, null, 4))
  }

  // Send the Error to Sentry
  let error = props.error
  if (!(error instanceof Error)) error = new Error(error)
  captureWithScope(props.error, props.error.message)

  // Display a different error depending if the DApp is running inside a WebView
  // in which case the user will not have console access
  return (
    <div>
      {window.ReactNativeWebView ? (
        <div>
          <fbt desc="QueryError.error">Error:</fbt>
          <div>
            <div>{JSON.stringify(props.error)}</div>
            {props.query && <div>{props.query.loc.source.body}</div>}
            {props.vars && <div>{JSON.stringify(props.vars)}</div>}
          </div>
        </div>
      ) : (
        <fbt desc="QueryError.seeConsole">Error: See console for details</fbt>
      )}
    </div>
  )
}

export default QueryError
