import React, { Component } from 'react'
import { Mutation, withApollo } from 'react-apollo'
import { fbt } from 'fbt-runtime'

import DeployProxyMutation from 'mutations/DeployProxy'

import TransactionError from 'components/TransactionError'
import WaitForTransaction from 'components/WaitForTransaction'
import AutoMutate from 'components/AutoMutate'

import withCanTransact from 'hoc/withCanTransact'
import withWallet from 'hoc/withWallet'

class DeployProxy extends Component {
  state = {}
  render() {
    return (
      <Mutation
        mutation={DeployProxyMutation}
        onCompleted={({ deployIdentityViaProxy }) =>
          this.setState({ waitFor: deployIdentityViaProxy.id })
        }
        onError={errorData =>
          this.setState({ waitFor: false, error: 'mutation', errorData })
        }
      >
        {deployProxy => (
          <>
            <button
              className={this.props.className}
              onClick={() => this.onClick(deployProxy)}
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

  onClick(deployProxy) {
    if (this.props.cannotTransact) {
      this.setState({
        error: this.props.cannotTransact,
        errorData: this.props.cannotTransactData
      })
      return
    }

    this.setState({ waitFor: 'pending' })
    const variables = {
      from: this.props.wallet,
      owner: this.props.wallet
    }

    deployProxy({ variables })
  }

  renderWaitModal() {
    if (!this.state.waitFor) return null

    const { skipSuccessScreen } = this.props
    const content = skipSuccessScreen ? (
      <AutoMutate mutatation={() => {
        this.setState({
          shouldClose: true
        })
      }} />
    ) : (
      <div className="make-offer-modal">
        <div className="success-icon" />
        <div>
          <fbt desc="success">Success!</fbt>
        </div>
        <button
          className="btn btn-outline-light"
          onClick={async () => {
            this.setState({ shouldClose: true })
          }}
          children={fbt('OK', 'OK')}
        />
      </div>
    )

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
          this.props.client.reFetchObservableQueries()
          this.setState({ waitFor: false, error: false, shouldClose: false })
        }}
        hash={this.state.waitFor}
        event="IdentityUpdated"
      >
        {() => content}
      </WaitForTransaction>
    )
  }
}

export default withApollo(withWallet(withCanTransact(DeployProxy)))
