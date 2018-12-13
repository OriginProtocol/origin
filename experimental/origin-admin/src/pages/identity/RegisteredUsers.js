import React, { Component } from 'react'
import { Button } from '@blueprintjs/core'
import { Query } from 'react-apollo'

import nextPageFactory from 'utils/nextPageFactory'

import IdentitiesQuery from 'queries/Identities'

import BottomScrollListener from 'components/BottomScrollListener'
import LoadingSpinner from 'components/LoadingSpinner'
import Address from 'components/Address'
import QueryError from 'components/QueryError'

const nextPage = nextPageFactory('userRegistry.identities')

import DeployIdentity from './DeployIdentity'

class RegisteredUsers extends Component {
  state = {}
  render() {
    const vars = {
      first: 15,
      sort: this.state.sort
    }
    return (
      <div className="mt-3 ml-3">
        <Query
          query={IdentitiesQuery}
          variables={vars}
          notifyOnNetworkStatusChange={true}
        >
          {({ data, error, fetchMore, networkStatus }) => {
            if (networkStatus === 1) {
              return <LoadingSpinner />
            } else if (error) {
              return <QueryError error={error} query={IdentitiesQuery} />
            } else if (!data || !data.userRegistry) {
              return 'No user registry contract?'
            }

            const { nodes, pageInfo } = data.userRegistry.identities
            const { hasNextPage, endCursor: after } = pageInfo

            return (
              <BottomScrollListener
                ready={networkStatus === 7}
                hasMore={hasNextPage}
                onBottom={() => nextPage(fetchMore, { ...vars, after })}
              >
                <>
                  <div className="mb-3">
                    <Button
                      text="Create Identity"
                      intent="primary"
                      onClick={() => this.setState({ deployIdentity: true })}
                    />
                  </div>
                  <table className="bp3-html-table bp3-small bp3-html-table-bordered bp3-interactive">
                    <thead>
                      <tr>
                        <th>Identity</th>
                        <th>Deploy Date</th>
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
                            <td />
                          </tr>
                        )
                      })}
                    </tbody>
                  </table>

                  <DeployIdentity
                    isOpen={this.state.deployIdentity}
                    onCompleted={() => this.setState({ deployIdentity: false })}
                  />

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

export default RegisteredUsers
