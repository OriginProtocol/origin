import React, { Component } from 'react'
import { Mutation } from 'react-apollo'
import { Button } from '@blueprintjs/core'

import {
  Dialog,
  FormGroup,
  InputGroup,
  HTMLSelect,
  Checkbox
} from '@blueprintjs/core'

import ErrorCallout from 'components/ErrorCallout'
import withAccounts from 'hoc/withAccounts'
import { DeployMarketplaceMutation } from 'queries/Mutations'
import rnd from 'utils/rnd'

class DeployMarketplace extends Component {
  constructor(props) {
    super(props)
    const token = props.tokens.find(t => t.symbol === 'OGN') || props.tokens[0]
    let admin = rnd(props.accounts.filter(a => a.role === 'Admin'))
    if (!admin) admin = rnd(props.accounts)
    this.state = {
      version: '001',
      token: token ? token.id : '',
      from: admin ? admin.id : '',
      autoWhitelist: true
    }
  }

  render() {
    const input = field => ({
      value: this.state[field],
      onChange: e => this.setState({ [field]: e.currentTarget.value })
    })
    return (
      <Mutation
        mutation={DeployMarketplaceMutation}
        onCompleted={this.props.onCompleted}
      >
        {(deployMarketplace, { loading, error }) => (
          <Dialog
            title="Deploy Marketplace"
            isOpen={this.props.isOpen}
            onClose={this.props.onCompleted}
          >
            <div className="bp3-dialog-body">
              <ErrorCallout error={error} />
              <div style={{ display: 'flex' }}>
                <div style={{ flex: 1, marginRight: 20 }}>
                  <FormGroup label="Owner">
                    <HTMLSelect
                      {...input('from')}
                      fill={true}
                      options={this.props.accounts.map(a => ({
                        label: `${(a.name || a.id).substr(0, 24)}`,
                        value: a.id
                      }))}
                    />
                  </FormGroup>
                </div>
                <div style={{ flex: 1, marginRight: 20 }}>
                  <FormGroup label="Version">
                    <InputGroup {...input('version')} />
                  </FormGroup>
                </div>
                <div style={{ flex: 1, marginRight: 20 }}>
                  <FormGroup label="Token">
                    <HTMLSelect
                      fill={true}
                      {...input('token')}
                      options={this.props.tokens.map(a => ({
                        label: a.symbol,
                        value: a.id
                      }))}
                    />
                  </FormGroup>
                </div>
                <div style={{ flex: 1 }}>
                  <FormGroup label="Auto-Whitelist">
                    <Checkbox
                      checked={this.state.autoWhitelist}
                      onChange={e =>
                        this.setState({ autoWhitelist: e.target.checked })
                      }
                    />
                  </FormGroup>
                </div>
              </div>
            </div>
            <div className="bp3-dialog-footer">
              <div className="bp3-dialog-footer-actions">
                <Button
                  text="Deploy Marketplace"
                  intent="primary"
                  loading={loading}
                  onClick={() => deployMarketplace({ variables: this.state })}
                />
              </div>
            </div>
          </Dialog>
        )}
      </Mutation>
    )
  }
}

export default withAccounts(DeployMarketplace)
