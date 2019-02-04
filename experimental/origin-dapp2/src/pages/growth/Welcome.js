import React, { Component, Fragment } from 'react'
import { Query } from 'react-apollo'
import QueryError from 'components/QueryError'

class GrowthWelcome extends Component {
  state = {
  }

  render() {
    //const vars = pick(this.state, 'first')

    return (
      <div className="growth-welcome">
        <div className="container">
        </div>
      </div>
    )
  }
}

export default GrowthWelcome

require('react-styl')(`
  .growth-welcome
    background-color: var(--dark-grey-blue);
`)
