import React, { Component } from 'react'
import { Mutation } from 'react-apollo'
import withAccounts from 'hoc/withAccounts'

import {
  Button,
  Dialog,
  FormGroup,
  InputGroup,
  Tag,
  HTMLSelect
} from '@blueprintjs/core'

import { SendFromWalletMutation } from 'queries/Mutations'
import ErrorCallout from 'components/ErrorCallout'

class SendFromWallet extends Component {
  constructor(props) {
    super(props)
    const toAccount = props.accounts.find(a => a.id !== this.props.from)
    this.state = {
      amount: '0.01',
      to: toAccount ? toAccount.id : ''
    }
  }

  render() {
    const input = field => ({
      value: this.state[field],
      onChange: e => this.setState({ [field]: e.currentTarget.value })
    })
    const options = this.props.accounts
      .filter(a => a.id !== this.props.from)
      .map(a => ({
        label: `${(a.name || a.id).substr(0, 24)}${
          a.role ? ` (${a.role})` : ''
        }`,
        value: a.id
      }))

    return (
      <Mutation
        mutation={SendFromWalletMutation}
        onCompleted={this.props.onCompleted}
        refetchQueries={['AllAccounts']}
      >
        {(sendFromWallet, { loading, error }) => (
          <Dialog
            title="Send Ether"
            isOpen={this.props.isOpen}
            onClose={this.props.onCompleted}
            refetchQueries={['AllAccounts']}
          >
            <div className="bp3-dialog-body">
              <ErrorCallout error={error} />
              <div style={{ display: 'flex' }}>
                <div style={{ flex: 1, marginRight: 20 }}>
                  <FormGroup label="Amount">
                    <InputGroup
                      {...input('amount')}
                      rightElement={<Tag minimal={true}>ETH</Tag>}
                    />
                  </FormGroup>
                </div>
                <div style={{ flex: 2 }}>
                  <FormGroup label="To">
                    <HTMLSelect
                      {...input('to')}
                      fill={true}
                      options={options}
                    />
                  </FormGroup>
                </div>
              </div>
            </div>
            <div className="bp3-dialog-footer">
              <div className="bp3-dialog-footer-actions">
                <Button
                  text="Send Ether"
                  intent="primary"
                  loading={loading}
                  onClick={() => sendFromWallet(this.getVars())}
                />
              </div>
            </div>
          </Dialog>
        )}
      </Mutation>
    )
  }

  getVars() {
    return {
      variables: {
        from: this.props.from,
        to: this.state.to,
        value: web3.utils.toWei(this.state.amount, 'ether')
      }
    }
  }
}

export default withAccounts(SendFromWallet)
