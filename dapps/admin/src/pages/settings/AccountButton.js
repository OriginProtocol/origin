import React, { Component } from 'react'
import { Query } from 'react-apollo'
import QRCode from 'qrcode.react'

import {
  Button,
  ContextMenuTarget,
  Menu,
  MenuItem,
  Dialog
} from '@blueprintjs/core'

import SendFromWallet from './mutations/SendFromWallet'
import SendToken from './mutations/SendToken'
import SetWalletMutation from './_SetWalletMutation'
import Identity from 'components/Identity'

import query from 'queries/AllAccounts'

@ContextMenuTarget
class AccountButton extends Component {
  constructor() {
    super()
    this.state = {}
  }
  render() {
    const { account } = this.props
    if (!account) {
      return null
    }
    const accountId = this.getAddress()
    if (accountId === '0x0000000000000000000000000000000000000000') {
      return null
    }
    return (
      <span>
        <Query query={query}>
          {({ loading, error, data }) =>
            !loading && !error ? (
              <SetWalletMutation>
                {setActiveWallet => (
                  <Button
                    small={true}
                    active={
                      data.web3.defaultAccount &&
                      data.web3.defaultAccount.id === accountId
                    }
                    disabled={!data.web3.accounts.find(a => a.id === accountId)}
                    onClick={() =>
                      setActiveWallet({ variables: { address: accountId } })
                    }
                  >
                    <Identity account={accountId} />
                  </Button>
                )}
              </SetWalletMutation>
            ) : (
              <Identity account={accountId} />
            )
          }
        </Query>
        <SendFromWallet
          isOpen={this.state.sendEth}
          lazy={true}
          from={accountId}
          onCompleted={() => this.setState({ sendEth: false })}
        />
        <Dialog
          isOpen={this.state.privateKeyQR}
          lazy={true}
          from={accountId}
          onClose={() => this.setState({ privateKeyQR: false })}
        >
          <div className="bp3-dialog-body">
            <QRCode value={this.getPrivateKey()} />
          </div>
        </Dialog>
        <SendToken
          isOpen={this.state.sendToken}
          lazy={true}
          from={accountId}
          onCompleted={() => this.setState({ sendToken: false })}
        />
      </span>
    )
  }

  getAddress() {
    const { account } = this.props
    return typeof account === 'string' ? account : account.id
  }

  getPrivateKey() {
    const { account } = this.props
    const id = typeof account === 'string' ? account : account.id
    try {
      return web3.eth.accounts.wallet[id].privateKey
    } catch (e) {
      return ''
    }
  }

  renderContextMenu() {
    return (
      <Menu>
        <MenuItem
          text="Copy Address"
          onClick={() => {
            navigator.clipboard.writeText(this.getAddress()).then(
              function() {
                /* success */
              },
              function() {
                /* failure */
              }
            )
          }}
        />
        <MenuItem
          text="Copy Private Key"
          onClick={() => {
            navigator.clipboard.writeText(this.getPrivateKey()).then(
              function() {
                /* success */
              },
              function() {
                /* failure */
              }
            )
          }}
        />
        <MenuItem
          text="Private Key QR Code"
          onClick={() => {
            this.setState({ privateKeyQR: true })
          }}
        />
        <MenuItem
          text="Send Eth"
          onClick={() => this.setState({ sendEth: true })}
        />
        <MenuItem
          text="Send Token"
          onClick={() => this.setState({ sendToken: true })}
        />
      </Menu>
    )
  }
}

export default AccountButton
