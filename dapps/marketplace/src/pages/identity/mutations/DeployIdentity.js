import React, { Component } from 'react'
import { Mutation, withApollo } from 'react-apollo'
import { fbt } from 'fbt-runtime'

import DeployIdentityMutation from 'mutations/DeployIdentity'

import TransactionError from 'components/TransactionError'
import WaitForTransaction from 'components/WaitForTransaction'

import withCanTransact from 'hoc/withCanTransact'
import withWallet from 'hoc/withWallet'
import AutoMutate from 'components/AutoMutate'

class DeployIdentity extends Component {
  state = {}

  render() {
    if (
      this.props.autoDeploy &&
      (this.props.loadingCanTransact || this.props.walletLoading)
    ) {
      return null
    }

    return (
      <Mutation
        mutation={DeployIdentityMutation}
        onCompleted={({ deployIdentity }) => {
          this.setState({ mutationCompleted: true })
          if (this.props.onComplete) {
            this.props.onComplete()
          }
        }}
        onError={errorData =>
          this.setState({ waitFor: false, error: 'mutation', errorData })
        }
      >
        {upsertIdentity => (
          <>
            {this.props.autoDeploy ? (
              <AutoMutate mutation={() => this.onDeployClick(upsertIdentity)} />
            ) : (
              <button
                className={`${this.props.className} ${
                  this.props.disabled ? 'disabled' : ''
                }`}
                onClick={() => this.onDeployClick(upsertIdentity)}
                children={this.props.children}
              />
            )}
            {this.renderWaitModal()}
            {this.state.error && (
              <TransactionError
                reason={this.state.error}
                data={this.state.errorData}
                onClose={() => {
                  if (this.props.onCancel) {
                    this.props.onCancel(this.state.errorData)
                  }
                }}
              />
            )}
          </>
        )}
      </Mutation>
    )
  }

  onDeployClick(upsertIdentity) {
    if (this.props.disabled) {
      return
    }

    let canDeploy = true
    if (this.props.validate) {
      canDeploy = this.props.validate()
    }
    if (canDeploy) {
      this.onClick(upsertIdentity)
    }
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
    const variables = {
      from: this.props.walletProxy,
      attestations: this.props.attestations,
      profile
    }

    upsertIdentity({ variables })
  }

  renderWaitModal() {
    if (!this.state.waitFor) return null

    const { skipSuccessScreen } = this.props
    const content = skipSuccessScreen ? (
      <AutoMutate
        mutation={() => {
          this.setState({ shouldClose: true })
        }}
      />
    ) : (
      <div className="make-offer-modal">
        <div className="success-icon" />
        <div>
          <fbt desc="success">Success!</fbt>
        </div>
        <button
          className="btn btn-outline-light"
          onClick={() => this.setState({ shouldClose: true })}
          children={fbt('OK', 'OK')}
        />
      </div>
    )

    if (process.env.ENABLE_CENTRALIZED_IDENTITY === 'true') {
      return content
    }

    return (
      <WaitForTransaction
        shouldClose={this.state.shouldClose}
        onClose={() => {
          if (this.props.refetch) {
            this.props.refetch()
          }
          if (this.props.refetchObservables !== false) {
            this.props.client.reFetchObservableQueries()
          }
          this.setState({ waitFor: false, error: false, shouldClose: false })
          if (this.props.onComplete && this.state.mutationCompleted) {
            this.props.onComplete()
          } else if (this.props.onCancel && !this.state.mutationCompleted) {
            this.props.onCancel()
          }
        }}
        hash={this.state.waitFor}
        event="IdentityUpdated"
      >
        {() => content}
      </WaitForTransaction>
    )
  }
}

export default withApollo(withWallet(withCanTransact(DeployIdentity)))
