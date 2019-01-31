import React, { Component, Fragment } from 'react'
import { Query } from 'react-apollo'

import QueryError from 'components/QueryError'
import query from 'queries/AllGrowthCampaigns'


class GrowthCampaigns extends Component {
  state = {
    campagins: [],
    loading: true   
  }

  render() {
    return (
      <div className="container campaigns">
      <Query
        query={query}
        variables={vars}
        notifyOnNetworkStatusChange={true}
      >
        {({ error, data, fetchMore, networkStatus, loading }) => {
          if (networkStatus === 1) {
            return <h5>Loading...</h5>
          } else if (error) {
            return <QueryError error={error} query={query} vars={vars} />
          }
          console.log("DATA", data)

          return (<div>lala</div>
          )
        }}
      </Query>
      </div>
    )
  }
}

export default GrowthCampaigns

require('react-styl')(`
  .listings-count
    font-family: Poppins;
    font-size: 40px;
    font-weight: 200;
    color: var(--dark);
    margin-top: 3rem
`)
