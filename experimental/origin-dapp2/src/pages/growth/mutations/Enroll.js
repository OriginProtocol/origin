import React, { Component, Fragment } from 'react'
import { Mutation } from 'react-apollo'
import { Query } from 'react-apollo'
import { withRouter } from 'react-router-dom'
import QueryError from 'components/QueryError'
import profileQuery from 'queries/Profile'
import SignMessageMutation from 'mutations/SignMessage'
import GrowthEnroll from 'mutations/GrowthEnroll'

class Enroll extends Component {
  state = {
    error: null,
    // TODO: change version programatically
    message: 'I accept the terms of growth campaign version: 1.0'
  }
  render() {
    return (
      <Query query={profileQuery}>
        {({ networkStatus, error, loading, data }) => {
          if (networkStatus === 1 || loading) return ''
          else if (error) {
            return <QueryError error={error} query={profileQuery} />
          }

          const accountId = data.web3.primaryAccount.id

          return (
            <Mutation
              mutation={GrowthEnroll}
              onCompleted={({ enroll }) => {
                if (enroll.error === null && enroll.authToken) {
                  localStorage.setItem('growth_auth_token', enroll.authToken)
                  this.props.history.push('/campaigns')
                } else {
                  console.log('Error occurred: ', enroll)
                  this.setState({
                    error: 'Can not enroll into growht campaign'
                  })
                }
              }}
              onError={errorData => {
                console.log('Error: ', errorData)
                this.setState({
                  error: 'Problems enrolling into growth campaign.'
                })
              }}
            >
              {enroll => (
                <Mutation
                  mutation={SignMessageMutation}
                  onCompleted={({ signMessage }) => {
                    console.log('Message successfuly signed: ', signMessage)
                    enroll({
                      variables: {
                        accountId: accountId,
                        agreementMessage: this.state.message,
                        signature: signMessage
                      }
                    })
                  }}
                  onError={errorData =>
                    this.setState({
                      error: 'Message signature unsuccessful',
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
                          Your browser does not support the video tag.
                        </video>
                        <div className="title">Confirm Metamask Signature</div>
                        <div className="mt-3 mr-auto ml-auto normal-line-height info-text">
                          {!this.state.error && (
                            <span>
                              Open your Metamask browser extension and confirm
                              your signature.
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

export default withRouter(Enroll)

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
