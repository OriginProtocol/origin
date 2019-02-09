import React from 'react'

const QueryError = props => {
  console.log(props.error)
  if (props.query) {
    console.log(props.query.loc.source.body)
  }

  return <div>Error :(</div>
}

export default QueryError
