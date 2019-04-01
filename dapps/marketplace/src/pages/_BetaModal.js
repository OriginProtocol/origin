import React, { Component } from 'react'
import { fbt } from 'fbt-runtime'

import Modal from 'components/Modal'
import Link from 'components/Link'

class BetaModal extends Component {
  state = {}
  render() {
    return (
      <Modal
        onClose={() => this.props.onClose()}
        shouldClose={this.state.shouldClose}
      >
        <div className="beta-modal">
          <h5>
            <fbt desc="BetaModel.welcome">
              Welcome to Origin Beta! Origin is a decentralized marketplace that
              works a little differently than most apps.
            </fbt>
          </h5>
          <ul className="list-unstyled">
            <li>
              <fbt desc="BetaModal.txnAreReal">
                We&apos;re in Beta mode, but all transactions are real and use
                ETH.
              </fbt>
            </li>
            <li>
              <fbt desc="BetaModal.pleaseVerify">
                Please verify your
                <Link
                  to="/profile"
                  onClick={() => this.setState({ shouldClose: true })}
                >
                  identity
                </Link>
                so other buyers and sellers know who you are.
              </fbt>
            </li>
            <li>
              <fbt desc="BetaModal.dontForget">
                Don&apos;t forget to enable
                <Link
                  to="/messages"
                  onClick={() => this.setState({ shouldClose: true })}
                >
                  Origin Messaging
                </Link>
                so you can communicate with other users. It&apos;s free.
              </fbt>
            </li>
            <li>
              <fbt desc="BetaModal.ifYouHaveQuestions">
                If you have any questions or need to dispute a transaction,
                <a href="mailto:support@originprotocol.com">let us know</a>
                .
              </fbt>
            </li>
          </ul>
          <div className="actions">
            <button
              className="btn btn-outline-light"
              onClick={() => {
                this.setState({ shouldClose: true })
              }}
              children={fbt('I got it.', 'I got it.')}
            />
          </div>
        </div>
      </Modal>
    )
  }
}

export default BetaModal

require('react-styl')(`
  .beta-modal
    background: url(images/beta.svg) no-repeat top center
    background-size: 11rem
    padding-top: 10rem
    font-size: 16px
    a
      color: var(--white)
      text-decoration: underline
    h5
      font-size: 18px
    ul
      text-align: left
      margin: 1rem 0 0 0
      li
        background: url(images/warning-icon.svg) no-repeat 0px 1px
        padding-left: 2rem
        background-size: 1.25rem
        line-height: 1.25rem
        padding-bottom: 0.75rem
    .actions
      flex-direction: column;
      display: flex;
      align-items: center;
      label
        margin-top: 0.5rem
        color: var(--white)
        font-size: 12px
        input
          margin-right: 0.25rem
`)
