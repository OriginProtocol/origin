import React from 'react'

const QueryError = props => {
  console.log(props.error)

  if (props.query) {
    console.log(props.query.loc.source.body)
  }
  if (props.vars) {
    console.log(JSON.stringify(props.vars, null, 4))
  }

  return <div>Error: See console for details</div>
}

export default QueryError
