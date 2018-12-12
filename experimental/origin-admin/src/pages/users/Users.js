import React, { Component } from 'react'
import { Button } from '@blueprintjs/core'
import { Query } from 'react-apollo'
import get from 'lodash/get'

import formatDate from 'utils/formatDate'
import nextPageFactory from 'utils/nextPageFactory'

import UsersQuery from 'queries/Users'

import BottomScrollListener from 'components/BottomScrollListener'
import LoadingSpinner from 'components/LoadingSpinner'
import Address from 'components/Address'
import Identity from 'components/Identity'
import ThSort from 'components/ThSort'
import QueryError from 'components/QueryError'

const nextPage = nextPageFactory('marketplace.users')

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
          variables={vars}
          notifyOnNetworkStatusChange={true}
        >
          {({ data, error, fetchMore, networkStatus }) => {
            if (networkStatus === 1) {
              return <LoadingSpinner />
            } else if (error) {
              return <QueryError error={error} query={UsersQuery} />
            } else if (!data || !data.marketplace) {
              return 'No marketplace contract?'
            }

            const { nodes, pageInfo } = data.marketplace.users
            const { hasNextPage, endCursor: after } = pageInfo

            return (
              <BottomScrollListener
                ready={networkStatus === 7}
                hasMore={hasNextPage}
                onBottom={() => nextPage(fetchMore, { ...vars, after })}
              >
                <>
                  <table className="bp3-html-table bp3-small bp3-html-table-bordered bp3-interactive">
                    <thead>
                      <tr>
                        <th>Account</th>
                        <th>Identity</th>
                        <ThSort
                          onSort={() => this.setState({ sort: 'listings' })}
                        >
                          Listings
                        </ThSort>
                        <ThSort
                          onSort={() => this.setState({ sort: 'offers' })}
                        >
                          Offers
                        </ThSort>
                        <ThSort
                          onSort={() => this.setState({ sort: 'firstAction' })}
                        >
                          First Action
                        </ThSort>
                        <ThSort
                          onSort={() => this.setState({ sort: 'lastAction' })}
                        >
                          Last Action
                        </ThSort>
                      </tr>
                    </thead>
                    <tbody>
                      {nodes.map(user => {
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
                            <td>
                              {formatDate(get(user, 'firstEvent.timestamp'))}
                            </td>
                            <td>
                              {formatDate(get(user, 'lastEvent.timestamp'))}
                            </td>
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
