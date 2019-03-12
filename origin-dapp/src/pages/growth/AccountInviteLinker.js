import React, { Component, Fragment } from 'react'
import { Query } from 'react-apollo'
import ProfileQuery from 'queries/Profile'

class GrowthWelcome extends Component {
  constructor(props) {
    super(props)
  }

  render() {
    return (
      <Query query={ProfileQuery}
        onCompleted={({ web3 }) => {
          if (web3.primaryAccount !== null) {
            const accountId = web3.primaryAccount.id
          }
        }}
      >
        {() => {
          return ('')
        }}
      </Query>
    )
  }
}

export default GrowthWelcome
