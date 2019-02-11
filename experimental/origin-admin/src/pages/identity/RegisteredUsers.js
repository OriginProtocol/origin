import React, { Component } from 'react'
import { Button } from '@blueprintjs/core'
import { Query } from 'react-apollo'

import nextPageFactory from 'utils/nextPageFactory'

import IdentitiesQuery from 'queries/Identities'

import BottomScrollListener from 'components/BottomScrollListener'
import LoadingSpinner from 'components/LoadingSpinner'
import Address from 'components/Address'
import QueryError from 'components/QueryError'

const nextPage = nextPageFactory('identityEvents.identities')

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
            } else if (!data || !data.identityEvents) {
              return 'No user registry contract?'
            }

            const {
              nodes,
              pageInfo,
              totalCount
            } = data.identityEvents.identities
            const { hasNextPage, endCursor: after } = pageInfo

            return (
              <BottomScrollListener
                ready={networkStatus === 7}
                hasMore={hasNextPage}
                onBottom={() => nextPage(fetchMore, { ...vars, after })}
              >
                <>
                  <div
                    style={{ display: 'flex', alignItems: 'center' }}
                    className="mb-3"
                  >
                    <h5 className="bp3-heading mb-0 mr-3">{`${totalCount} Identities`}</h5>
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
                        <th>Name</th>
                        <th>Created</th>
                        <th>Updated</th>
                      </tr>
                    </thead>
                    <tbody>
                      {nodes.map(user => {
                        return (
                          <tr
                            key={user.id}
                            onClick={() =>
                              this.props.history.push(`/identities/${user.id}`)
                            }
                          >
                            <td>
                              <Address address={user.id} />
                            </td>
                            <td>{user.fullName}</td>
                            <td>{user.createdAt}</td>
                            <td>{user.updatedAt}</td>
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
