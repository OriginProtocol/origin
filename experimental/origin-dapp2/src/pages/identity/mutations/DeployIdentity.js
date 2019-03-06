import React, { Component } from 'react'
import { Mutation } from 'react-apollo'

import DeployIdentityMutation from 'mutations/DeployIdentity'

import TransactionError from 'components/TransactionError'
import WaitForTransaction from 'components/WaitForTransaction'

import withCanTransact from 'hoc/withCanTransact'
import withWallet from 'hoc/withWallet'

class DeployIdentity extends Component {
  state = {}
  render() {
    return (
      <Mutation
        mutation={DeployIdentityMutation}
        onCompleted={({ deployIdentity }) =>
          this.setState({ waitFor: deployIdentity.id })
        }
        onError={errorData =>
          this.setState({ waitFor: false, error: 'mutation', errorData })
        }
      >
        {upsertIdentity => (
          <>
            <button
              className={this.props.className}
              onClick={() => {
                let canDeploy = true
                if (this.props.validate) {
                  canDeploy = this.props.validate()
                }
                if (canDeploy) {
                  this.onClick(upsertIdentity)
                }
              }}
              children={this.props.children}
            />
            {this.renderWaitModal()}
            {this.state.error && (
              <TransactionError
                reason={this.state.error}
                data={this.state.errorData}
                onClose={() => this.setState({ error: false })}
              />
            )}
          </>
        )}
      </Mutation>
    )
  }

  onClick(upsertIdentity) {
    if (this.props.cannotTransact) {
      this.setState({
        error: this.props.cannotTransact,
        errorData: this.props.cannotTransactData
      })
      return
    }

    this.setState({ waitFor: 'pending' })
    const profile = this.props.profile
    if (!profile.avatar) profile.avatar = ''
    const variables = {
      from: this.props.wallet,
      attestations: this.props.attestations,
      profile
    }

    upsertIdentity({ variables })
  }

  renderWaitModal() {
    if (!this.state.waitFor) return null

    return (
      <WaitForTransaction
        shouldClose={this.state.shouldClose}
        onClose={() => {
          if (this.props.refetch) {
            this.props.refetch()
          }
          if (this.props.onComplete) {
            this.props.onComplete()
          }
          this.setState({ waitFor: false, error: false, shouldClose: false })
        }}
        hash={this.state.waitFor}
        event="IdentityUpdated"
      >
        {() => {
          return (
            <div className="make-offer-modal">
              <div className="success-icon" />
              <div>Success!</div>
              <button
                className="btn btn-outline-light"
                onClick={async () => {
                  this.setState({ shouldClose: true })
                }}
                children="OK"
              />
            </div>
          )
        }}
      </WaitForTransaction>
    )
  }
}

export default withWallet(withCanTransact(DeployIdentity))
