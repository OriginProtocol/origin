import React, { Component } from 'react'
import GraphiQL from 'graphiql'
import { parse } from 'graphql/language/parser'
import { execute } from 'apollo-link'
import gqlClient from '@origin/graphql'

const DefaultQuery = `{
  marketplace {
    listings {
      nodes {
        id
        title
        price {
          currency
          amount
        }
        seller {
          id
          identity {
            id
            firstName
            lastName
          }
        }
      }
    }
  }
}
`

class GraphExplorer extends Component {
  constructor() {
    super()
    this.state = { height: window.innerHeight - 50 }
  }

  componentDidMount() {
    window.addEventListener('resize', this.onResize)
  }

  componentWillUnmount() {
    window.removeEventListener('resize', this.onResize)
  }

  onResize = () => {
    this.setState({ height: window.innerHeight - 50 })
  }

  render() {
    const graphiql = (
      <div style={{ height: this.state.height }}>
        <GraphiQL fetcher={this.fetcher} defaultQuery={DefaultQuery} />
      </div>
    )

    return <div className="body">{graphiql}</div>
  }

  fetcher = ({ query, variables = {} }) =>
    execute(gqlClient.link, {
      query: parse(query),
      variables,
      context: { noFetch: this.state.noFetch }
    })
}

export default GraphExplorer
