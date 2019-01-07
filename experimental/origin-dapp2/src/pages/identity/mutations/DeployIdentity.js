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
        onCompleted={({ deployIdentity }) => {
          this.setState({ waitFor: deployIdentity.id })
        }}
        onError={errorData =>
          this.setState({ waitFor: false, error: 'mutation', errorData })
        }
      >
        {deployIdentity => (
          <>
            <button
              className={this.props.className}
              onClick={() => {
                let canDeploy = true
                if (this.props.validate) {
                  canDeploy = this.props.validate()
                }
                if (canDeploy) {
                  this.onClick(deployIdentity)
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

  onClick(deployIdentity) {
    if (this.props.cannotTransact) {
      this.setState({
        error: this.props.cannotTransact,
        errorData: this.props.cannotTransactData
      })
      return
    }

    this.setState({ waitFor: 'pending' })
    deployIdentity({
      variables: {
        from: this.props.wallet,
        attestations: this.props.attestations,
        profile: this.props.profile
      }
    })
  }

  renderWaitModal() {
    if (!this.state.waitFor) return null

    return (
      <WaitForTransaction hash={this.state.waitFor} event="NewUser">
        {({ event }) => {
          console.log(event)
          return (
            <div className="make-offer-modal">
              <div className="success-icon" />
              <div>Success!</div>
            </div>
          )
        }}
      </WaitForTransaction>
    )
  }
}

export default withWallet(withCanTransact(DeployIdentity))
