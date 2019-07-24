import React, { Component, Fragment } from 'react'
import { fbt } from 'fbt-runtime'
import { Query, Mutation } from 'react-apollo'
import { withRouter } from 'react-router-dom'

import withFingerprint from 'hoc/withFingerprint'
import QueryError from 'components/QueryError'
import profileQuery from 'queries/Profile'
import SignMessageMutation from 'mutations/SignMessage'
import GrowthEnroll from 'mutations/GrowthEnroll'
import LoadingSpinner from 'components/LoadingSpinner'

const Error = props => (
  <div className="error-holder p-3 d-flex align-items-center justify-content-center flex-column">
    <div className="error-icon mb-3" />
    <div>
      <b>{props.error}</b>
    </div>
  </div>
)

class WaitForSignature extends Component {
  componentDidMount() {
    this.props.signMessage()
  }

  render() {
    return (
      <div className="p-3">
        <div className="spinner light mr-auto ml-auto" />
      </div>
    )
  }
}

class Enroll extends Component {
  state = {
    error: null,
    /* TODO: change version programatically
     * (!)important do not translate this message or the enrollment
     * on the growth server will fail
     */
    message: 'I accept the terms of growth campaign version: 1.0'
  }

  render() {
    const isMobile = this.props.isMobile

    return (
      <Query query={profileQuery}>
        {({ networkStatus, error, loading, data }) => {
          if (networkStatus === 1 || loading) return <LoadingSpinner />
          else if (error) {
            return <QueryError error={error} query={profileQuery} />
          }

          const accountId = data.web3.primaryAccount.id
          return (
            <Mutation
              mutation={GrowthEnroll}
              onCompleted={({ enroll }) => {
                if (enroll.isBanned) {
                  this.props.onAccountBlocked()
                } else {
                  localStorage.setItem('growth_auth_token', enroll.authToken)
                  this.props.onSuccess()
                }
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
                        fingerprintData: this.props.fingerprintData
                      }
                    })
                  }}
                  onError={errorData => {
                    this.setState({
                      error: fbt(
                        'Message signature unsuccessful',
                        'growth.errorSignatureUnsuccesful'
                      ),
                      errorData
                    })
                  }}
                >
                  {signMessage => {
                    const signMessageWithArgs = () => {
                      signMessage({
                        variables: {
                          address: accountId,
                          /* TODO: change version programatically
                           * (!)important do not translate this message or the enrollment
                           * on the growth server will fail
                           */
                          message: this.state.message
                        }
                      })
                    }
                    return (
                      <Fragment>
                        {isMobile && (
                          <Fragment>
                            {this.state.error && (
                              <Error error={this.state.error} />
                            )}
                            {!this.state.error && (
                              <WaitForSignature
                                signMessage={signMessageWithArgs}
                              />
                            )}
                          </Fragment>
                        )}
                        {!isMobile && (
                          <div className="growth-enrollment">
                            <video
                              className="metamask-video"
                              width="320"
                              heigh="240"
                              onLoadStart={() => signMessageWithArgs()}
                              autoPlay
                              loop
                            >
                              <source
                                src="images/metamask.mp4"
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
                                    Open your Metamask browser extension and
                                    confirm your signature.
                                  </fbt>
                                </span>
                              )}
                              {this.state.error && !isMobile && (
                                <span className="error">
                                  {this.state.error}
                                </span>
                              )}
                            </div>
                          </div>
                        )}
                      </Fragment>
                    )
                  }}
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
  .growth-enrollment-modal
    .error-holder
      height: 100%
      .error-icon
        height: 3.5rem
        width: 3.5rem
  .growth-enrollment
    .title
      font-weight: 300
    .info-text
      margin-bottom: 75px
    .metamask-video
      margin-top: 90px
      margin-bottom: 42px
    .error
      color: var(--red)
    .error-holder
      height: 100%
      .error-icon
        height: 3.5rem
        width: 3.5rem
`)
