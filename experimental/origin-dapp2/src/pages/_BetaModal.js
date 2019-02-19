import React, { Component } from 'react'
import { Query } from 'react-apollo'
import get from 'lodash/get'

import Store from 'utils/store'
import NetworkQuery from 'queries/Network'
import Modal from 'components/Modal'

const store = Store('sessionStorage')

class BetaBanner extends Component {
  state = {
    hideModal: store.get('hide-beta-modal', false)
  }
  render() {
    if (this.state.hideModal) {
      return null
    }
    return (
      <Query query={NetworkQuery}>
        {({ data }) => {
          const networkId = get(data, 'web3.networkId')
          if (networkId !== 1) {
            return null
          }
          return (
            <Modal
              onClose={() => this.setState({ hideModal: true })}
              shouldClose={this.state.shouldClose}
            >
              <div className="beta-modal">
                <h5>
                  Welcome to Origin&apos;s decentralized app! Please use at your
                  own risk while we fix bugs and get our contracts audited.
                </h5>
                <ul className="list-unstyled">
                  <li>
                    Transactions use real ETH. Take offers to buy/sell
                    seriously.
                  </li>
                  <li>
                    Use caution with counterparties you don&apos;t know. Please
                    verify your own identity.
                  </li>
                  <li>
                    Check back often for status updates. There are currently no
                    push/email notifications.
                  </li>
                  <li>
                    Disputes for escrowed funds are resolved by Origin&apos;s
                    arbitration team.
                  </li>
                  <li>No insurance is currently offered on any listings.</li>
                </ul>
                <div className="actions">
                  <button
                    className="btn btn-outline-light"
                    onClick={() => {
                      if (this.state.doNotShow) {
                        store.set('hide-beta-modal', true)
                      }
                      this.setState({ shouldClose: true })
                    }}
                  >
                    Proceed
                  </button>
                  <label>
                    <input
                      type="checkbox"
                      value={this.state.doNotShow}
                      onChange={() => this.setState({ doNotShow: true })}
                    />
                    Do not show again
                  </label>
                </div>
              </div>
            </Modal>
          )
        }}
      </Query>
    )
  }
}

export default BetaBanner

require('react-styl')(`
  .beta-modal
    background: url(images/beta.svg) no-repeat top center
    background-size: 11rem
    padding-top: 10rem
    font-size: 16px
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
