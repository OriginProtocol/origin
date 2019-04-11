import React, { Component, Fragment } from 'react'
import { fbt } from 'fbt-runtime'
import { Query, Mutation } from 'react-apollo'
import { withRouter } from 'react-router-dom'

import withFingerprint from 'hoc/withFingerprint'
import QueryError from 'components/QueryError'
import profileQuery from 'queries/Profile'
import SignMessageMutation from 'mutations/SignMessage'
import GrowthEnroll from 'mutations/GrowthEnroll'

class Enroll extends Component {
  state = {
    error: null,
    // TODO: change version programatically
    message: fbt(
      'I accept the terms of growth campaign version: 1.0',
      'growth.acceptTerms'
    )
  }

  render() {
    return (
      <Query query={profileQuery}>
        {({ networkStatus, error, loading, data }) => {
          if (networkStatus === 1 || loading)
            return fbt('Loading...', 'Loading...')
          else if (error) {
            return <QueryError error={error} query={profileQuery} />
          }

          const accountId = data.web3.primaryAccount.id
          return (
            <Mutation
              mutation={GrowthEnroll}
              onCompleted={({ enroll }) => {
                localStorage.setItem('growth_auth_token', enroll.authToken)
                this.props.history.push('/campaigns')
              }}
              onError={errorData => {
                console.error('Error: ', errorData)
                this.setState({
                  error: fbt(
                    'Problems enrolling into growth campaign.',
                    'growth.errorProblemEnrolling'
                  )
                })
              }}
            >
              {enroll => (
                <Mutation
                  mutation={SignMessageMutation}
                  onCompleted={({ signMessage }) => {
                    enroll({
                      variables: {
                        accountId: accountId,
                        agreementMessage: this.state.message,
                        signature: signMessage,
                        inviteCode: localStorage.getItem('growth_invite_code'),
                        fingerprint: this.props.fingerprint
                      }
                    })
                  }}
                  onError={errorData =>
                    this.setState({
                      error: fbt(
                        'Message signature unsuccessful',
                        'growth.errorSignatureUnsuccesful'
                      ),
                      errorData
                    })
                  }
                >
                  {signMessage => (
                    <Fragment>
                      <div className="growth-enrollment">
                        <video
                          className="metamask-video"
                          width="320"
                          heigh="240"
                          onLoadStart={() => {
                            signMessage({
                              variables: {
                                address: accountId,
                                // TODO: change version programatically
                                message:
                                  'I accept the terms of growth campaign version: 1.0'
                              }
                            })
                          }}
                          autoPlay
                          loop
                        >
                          <source
                            src="images/growth/metamask_in_browser_dark_bg.mp4"
                            type="video/mp4"
                          />
                          <fbt desc="growth.errorVideoTag">
                            Your browser does not support the video tag.
                          </fbt>
                        </video>
                        <div className="title">
                          <fbt desc="growth.confirmMetaMask">
                            Confirm Metamask Signature
                          </fbt>
                        </div>
                        <div className="mt-3 mr-auto ml-auto normal-line-height info-text">
                          {/* TODO: Wallet provider should be set dynamicly in here */
                          !this.state.error && (
                            <span>
                              <fbt desc="groth.openMetaMask">
                                Open your Metamask browser extension and confirm
                                your signature.
                              </fbt>
                            </span>
                          )}
                          {this.state.error && (
                            <span className="error">{this.state.error}</span>
                          )}
                        </div>
                      </div>
                    </Fragment>
                  )}
                </Mutation>
              )}
            </Mutation>
          )
        }}
      </Query>
    )
  }
}

export default withRouter(withFingerprint(Enroll))

require('react-styl')(`
  .growth-enrollment
    .title
      font-weight: 300;
    .info-text
      margin-bottom: 75px;
    .metamask-video
      margin-top: 90px;
      margin-bottom: 42px;
    .error
      color: var(--red);
`)
