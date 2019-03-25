import React from 'react'
import { fbt } from 'fbt-runtime'

const QueryError = props => {
  console.error(props.error)

  if (props.query) {
    console.log(props.query.loc.source.body)
  }
  if (props.vars) {
    console.log(JSON.stringify(props.vars, null, 4))
  }

  return <div>
    <fbt desc="QueryError.seeConsole">
      Error: See console for details
    </fbt>
  </div>
}

export default QueryError
