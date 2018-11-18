import React, { Component } from 'react'
import gql from 'graphql-tag'
import get from 'lodash/get'
import { Spinner, Button } from '@blueprintjs/core'
import { Table, Column, Cell } from '@blueprintjs/table'
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

            return (
              <BottomScrollListener
                offset={50}
                initial={hasNextPage && networkStatus === 7}
                onBottom={() => {
                  if (hasNextPage) {
                    nextPage(fetchMore, { ...vars, after })
                  }
                }}
              >
                <>
                <Table numRows={10} selectionModes="NONE">
                  <Column
                    name="Account"
                    cellRenderer={row => (
                      <Cell>
                        <Address address={users[row].id} />
                      </Cell>
                    )}
                  />
                  <Column
                    name="Identity"
                    cellRenderer={row => (
                      <Cell>
                        <Address address={users[row].id} />
                      </Cell>
                    )}
                  />
                  <Column
                    name="Listings"
                    cellRenderer={row => (
                      <Cell>
                        <Identity account={users[row].id} />
                      </Cell>
                    )}
                  />
                  <Column
                    name="Offers"
                    cellRenderer={row => (
                      <Cell>{users[row].listings.totalCount}</Cell>
                    )}
                  />
                  <Column
                    name="First Action"
                    cellRenderer={row => (
                      <Cell>{formatDate(users[row].firstEvent.timestamp)}</Cell>
                    )}
                  />
                  <Column
                    name="Last Action"
                    cellRenderer={row => (
                      <Cell>{formatDate(users[row].lastEvent.timestamp)}</Cell>
                    )}
                  />
                </Table>

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
