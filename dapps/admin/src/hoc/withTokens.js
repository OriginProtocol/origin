import React from 'react'
import { Query } from 'react-apollo'
import gql from 'graphql-tag'

const GetTokensQuery = gql`
  query GetTokens {
    tokens {
      id
      symbol
    }
  }
`

function withTokens(WrappedComponent) {
  const WithTokens = props => (
    <Query query={GetTokensQuery}>
      {({ data }) => (
        <WrappedComponent
          {...props}
          tokens={data && data.tokens ? data.tokens : []}
        />
      )}
    </Query>
  )
  return WithTokens
}

export default withTokens
