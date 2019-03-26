import React, { Component } from 'react'
import { Mutation } from 'react-apollo'
import { fbt } from 'fbt-runtime'

import DisputeOfferMutation from 'mutations/DisputeOffer'
import SendMessage from 'mutations/SendMessage'

import Modal from 'components/Modal'
import TransactionError from 'components/TransactionError'
import WaitForTransaction from 'components/WaitForTransaction'
import withCanTransact from 'hoc/withCanTransact'

class DisputeOffer extends Component {
  state = { problem: '' }
  render() {
    return (
      <Mutation mutation={SendMessage}>
        {sendMessage => (
          <Mutation
            mutation={DisputeOfferMutation}
            onCompleted={({ disputeOffer }) => {
              this.setState({ waitFor: disputeOffer.id })
              sendMessage({
                variables: {
                  to: this.props.offer.arbitrator.id,
                  content: this.state.problem
                }
              })
            }}
            onError={errorData =>
              this.setState({ waitFor: false, error: 'mutation', errorData })
            }
          >
            {(disputeOffer, { client }) => (
              <>
                <button
                  className={this.props.className}
                  onClick={() => this.setState({ sure: true })}
                  children={this.props.children}
                />
                {!this.state.sure ? null : (
                  <Modal
                    onClose={() =>
                      this.setState({
                        sure: false,
                        sureShouldClose: false,
                        describe: false
                      })
                    }
                    shouldClose={this.state.sureShouldClose}
                  >
                    {this.state.describe
                      ? this.renderDescribe(disputeOffer)
                      : this.renderIsProblem()}
                  </Modal>
                )}
                {this.renderWaitModal(client)}
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
        )}
      </Mutation>
    )
  }

  renderIsProblem() {
    return (
      <>
        <h2>
          <fbt desc="DisputeOffer.isThereProblem">Is there a problem?</fbt>
        </h2>
        <fbt desc="DisputeOffer.areYouSure">
          Are you sure you want to report a problem? This will start the
          conflict resolution process. Someone from Origin will be notified, and
          your chat history will be made public to an arbitrator.
        </fbt>
        <div className="actions">
          <button
            className="btn btn-outline-light"
            onClick={() => this.setState({ sureShouldClose: true })}
            children="Oops, no wait..."
          />
          <button
            className="btn btn-outline-light"
            onClick={() => this.setState({ describe: true })}
            children="Yes, please"
          />
        </div>
      </>
    )
  }

  renderDescribe(disputeOffer) {
    return (
      <>
        <h2>Describe your problem</h2>
        <div className="form-group mb-3">
          <textarea
            className="form-control dark"
            onChange={e => this.setState({ problem: e.target.value })}
            value={this.state.problem}
          />
        </div>
        <div className="actions">
          <button
            className="btn btn-outline-light"
            onClick={() => this.setState({ sureShouldClose: true })}
            children={fbt("Cancel", "Cancel")}
          />
          <button
            className="btn btn-outline-light"
            onClick={() => this.onClick(disputeOffer)}
            children="Submit"
          />
        </div>
      </>
    )
  }

  onClick(disputeOffer) {
    this.setState({ sureShouldClose: true })

    if (this.props.cannotTransact) {
      this.setState({
        error: this.props.cannotTransact,
        errorData: this.props.cannotTransactData
      })
      return
    }

    this.setState({ waitFor: 'pending' })
    let from = this.props.offer.buyer.id
    if (this.props.party === 'seller') {
      from = this.props.offer.listing.seller.id
    }

    disputeOffer({ variables: { offerID: this.props.offer.id, from } })
  }

  renderWaitModal(client) {
    if (!this.state.waitFor) return null

    return (
      <WaitForTransaction
        hash={this.state.waitFor}
        event="OfferDisputed"
        shouldClose={this.state.waitForShouldClose}
        onClose={async () => await client.resetStore()}
      >
        {() => (
          <>
            <h5>
              <fbt desc="DisputeOffer.youveEscalated">
                You’ve escalated this issue to an Origin team member. You will
                be contacted once a desicion is made.
              </fbt>
            </h5>
            <div className="actions">
              <button
                href="#"
                className="btn btn-outline-light"
                onClick={() => this.setState({ waitForShouldClose: true })}
                children="OK"
              />
            </div>
          </>
        )}
      </WaitForTransaction>
    )
  }
}

export default withCanTransact(DisputeOffer)
