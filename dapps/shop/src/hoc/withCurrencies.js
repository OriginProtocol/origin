import React from 'react'
import { useQuery } from '@apollo/react-hooks'
import gql from 'graphql-tag'
import get from 'lodash/get'

const query = gql`
  query GetCurrencies {
    currencies {
      __typename
      ... on Currency {
        id
        name
        code
        priceInUSD
      }
      ... on Token {
        decimals
      }
    }
  }
`

function withCurrencies(WrappedComponent) {
  const WithCurrencies = props => {
    const { data } = useQuery(query)
    return (
      <WrappedComponent {...props} currencies={get(data, 'currencies') || []} />
    )
  }
  return WithCurrencies
}

export default withCurrencies
