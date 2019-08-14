import React from 'react'
import { useQuery } from '@apollo/react-hooks'
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
  const WithTokens = props => {
    const { data } = useQuery(GetTokensQuery)
    return (
      <WrappedComponent
        {...props}
        tokens={data && data.tokens ? data.tokens : []}
      />
    )
  }
  return WithTokens
}

export default withTokens
