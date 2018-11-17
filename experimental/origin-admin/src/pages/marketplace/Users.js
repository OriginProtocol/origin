import React, { Component } from 'react'
import gql from 'graphql-tag'
import get from 'lodash/get'
import { Spinner, Button } from '@blueprintjs/core'
import { Query } from 'react-apollo'
import formatDate from 'utils/formatDate'
import BottomScrollListener from 'components/BottomScrollListener'

import Address from 'components/Address'
import Identity from 'components/Identity'

const UsersQuery = gql`
  query Users($first: Int, $after: String, $sort: String) {
    marketplace {
      users(first: $first, after: $after, sort: $sort) {
        totalCount
        pageInfo {
          hasNextPage
          hasPreviousPage
          endCursor
        }
        nodes {
          id
          firstEvent {
            id
            timestamp
          }
          lastEvent {
            id
            timestamp
          }
          offers {
            totalCount
          }
          listings {
            totalCount
          }
        }
      }
    }
  }
`

function nextPage(fetchMore, vars) {
  fetchMore({
    variables: { ...vars },
    updateQuery: (prev, { fetchMoreResult }) => {
      if (!fetchMoreResult) return prev
      return {
        marketplace: {
          ...prev.marketplace,
          users: {
            ...prev.marketplace.users,
            pageInfo: fetchMoreResult.marketplace.users.pageInfo,
            nodes: [
              ...prev.marketplace.users.nodes,
              ...fetchMoreResult.marketplace.users.nodes
            ]
          }
        }
      }
    }
  })
}

class Users extends Component {
  state = {}
  render() {
    const vars = {
      first: 15,
      sort: this.state.sort
    }
    return (
      <div className="mt-3 ml-3">
        <Query
          query={UsersQuery}
          variables={{ offset: 0, limit: 20 }}
          notifyOnNetworkStatusChange={true}
        >
          {({ data, error, fetchMore, networkStatus }) => {
            if (networkStatus === 1) {
              return (
                <div style={{ maxWidth: 300, marginTop: 100 }}>
                  <Spinner />
                </div>
              )
            }
            if (!data || !data.marketplace) {
              return <p className="p-3">No marketplace contract?</p>
            }
            if (error) {
              console.log(error)
              return <p>Error :(</p>
            }

            const users = get(data, 'marketplace.users.nodes', [])
            const hasNextPage = get(
              data,
              'marketplace.users.pageInfo.hasNextPage'
            )
            const after = get(data, 'marketplace.users.pageInfo.endCursor')

            window.requestAnimationFrame(() => {
              if (
                document.body.clientHeight < window.innerHeight &&
                hasNextPage &&
                networkStatus === 7
              ) {
                nextPage(fetchMore, { ...vars, after })
              }
            })

            return (
              <BottomScrollListener
                offset={50}
                onBottom={() => {
                  if (hasNextPage) {
                    nextPage(fetchMore, { ...vars, after })
                  }
                }}
              >
                <>
                  <table className="bp3-html-table bp3-small bp3-html-table-bordered bp3-interactive">
                    <thead>
                      <tr>
                        <th>Account</th>
                        <th>Identity</th>
                        <th>Listings</th>
                        <th>Offers</th>
                        <th>First Action</th>
                        <th>Last Action</th>
                      </tr>
                    </thead>
                    <tbody>
                      {users.map(user => {
                        return (
                          <tr
                            key={user.id}
                            onClick={() =>
                              this.props.history.push(`/users/${user.id}`)
                            }
                          >
                            <td>
                              <Address address={user.id} />
                            </td>
                            <td>
                              <Identity account={user.id} />
                            </td>
                            <td>{user.listings.totalCount}</td>
                            <td>{user.offers.totalCount}</td>
                            <td>{formatDate(get(user, 'firstEvent.timestamp'))}</td>
                            <td>{formatDate(get(user, 'lastEvent.timestamp'))}</td>
                          </tr>
                        )
                      })}
                    </tbody>
                  </table>

                  {!hasNextPage ? null : (
                    <Button
                      text="Load more..."
                      loading={networkStatus === 3}
                      className="mt-3"
                      onClick={() => nextPage(fetchMore, { ...vars, after })}
                    />
                  )}
                </>
              </BottomScrollListener>
            )
          }}
        </Query>
      </div>
    )
  }
}

export default Users
