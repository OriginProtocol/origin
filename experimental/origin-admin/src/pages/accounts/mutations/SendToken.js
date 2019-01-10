import React, { Component } from 'react'
import { Mutation } from 'react-apollo'
import withAccounts from 'hoc/withAccounts'
import withTokens from 'hoc/withTokens'

import {
  Button,
  Dialog,
  FormGroup,
  InputGroup,
  Tag,
  HTMLSelect
} from '@blueprintjs/core'

import { TransferTokenMutation } from 'queries/Mutations'
import ErrorCallout from 'components/ErrorCallout'

class SendToken extends Component {
  constructor(props) {
    super(props)
    const toAccount = props.accounts.find(a => a.id !== this.props.from)
    this.state = {
      amount: '50',
      to: toAccount ? toAccount.id : ''
    }
  }

  componentDidUpdate(prevProps, prevState) {
    if (!prevState.token && this.props.tokens[0]) {
      this.setState({ token: this.props.tokens[0].id })
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

    const tokenOptions = (this.props.tokens || []).map(t => ({
      label: t.symbol,
      value: t.id
    }))

    return (
      <Mutation
        mutation={TransferTokenMutation}
        onCompleted={this.props.onCompleted}
        refetchQueries={['AllAccounts']}
      >
        {(transferToken, { loading, error }) => (
          <Dialog
            title="Send Token"
            isOpen={this.props.isOpen}
            onClose={this.props.onCompleted}
            refetchQueries={['AllAccounts']}
          >
            <div className="bp3-dialog-body">
              <ErrorCallout error={error} />
              <div style={{ display: 'flex' }}>
                <div style={{ flex: 1, marginRight: 20 }}>
                  <FormGroup label="Token">
                    <HTMLSelect
                      {...input('token')}
                      fill={true}
                      options={tokenOptions}
                    />
                  </FormGroup>
                </div>
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
                  onClick={() => transferToken(this.getVars())}
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
        value: this.state.amount,
        token: this.state.token
      }
    }
  }
}

export default withTokens(withAccounts(SendToken))
