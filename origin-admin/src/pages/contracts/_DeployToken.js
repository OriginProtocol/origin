import React, { Component } from 'react'
import { Mutation } from 'react-apollo'
import { Button } from '@blueprintjs/core'
import { Dialog, FormGroup, InputGroup, HTMLSelect } from '@blueprintjs/core'

import rnd from 'utils/rnd'
import withAccounts from 'hoc/withAccounts'
import { DeployTokenMutation } from 'queries/Mutations'
import ErrorCallout from 'components/ErrorCallout'

class DeployToken extends Component {
  constructor(props) {
    super()
    let admin = rnd(props.accounts.filter(a => a.role === 'Admin'))
    if (!admin) admin = rnd(props.accounts)

    this.state = {
      name: 'Origin Token',
      symbol: 'OGN',
      decimals: '18',
      supply: '1000000000',
      type: 'OriginToken',
      from: admin ? admin.id : ''
    }
  }

  render() {
    const input = field => ({
      value: this.state[field],
      onChange: e => this.setState({ [field]: e.currentTarget.value })
    })
    return (
      <Mutation
        mutation={DeployTokenMutation}
        onCompleted={this.props.onCompleted}
      >
        {(deployToken, { loading, error }) => (
          <Dialog
            title="Deploy Token"
            isOpen={this.props.isOpen}
            onClose={this.props.onCompleted}
          >
            <div className="bp3-dialog-body">
              <ErrorCallout error={error} />
              <div style={{ display: 'flex' }}>
                <div style={{ flex: 1, marginRight: 20 }}>
                  <FormGroup label="Name">
                    <InputGroup {...input('name')} />
                  </FormGroup>
                </div>
                <div style={{ flex: 1, marginRight: 20 }}>
                  <FormGroup label="Owner">
                    <HTMLSelect
                      {...input('type')}
                      fill={true}
                      options={['OriginToken', 'Standard']}
                    />
                  </FormGroup>
                </div>
                <div style={{ flex: 1 }}>
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
              </div>
              <div style={{ display: 'flex' }}>
                <div style={{ flex: 1, marginRight: 20 }}>
                  <FormGroup label="Supply">
                    <InputGroup {...input('supply')} />
                  </FormGroup>
                </div>
                <div style={{ flex: 1, marginRight: 20 }}>
                  <FormGroup label="Symbol">
                    {this.state.type === 'Standard' ? (
                      <InputGroup {...input('symbol')} />
                    ) : (
                      <InputGroup value="OGN" disabled={true} />
                    )}
                  </FormGroup>
                </div>
                <div style={{ flex: 1 }}>
                  <FormGroup label="Decimals">
                    {this.state.type === 'Standard' ? (
                      <InputGroup {...input('decimals')} />
                    ) : (
                      <InputGroup value="18" disabled={true} />
                    )}
                  </FormGroup>
                </div>
              </div>
            </div>
            <div className="bp3-dialog-footer">
              <div className="bp3-dialog-footer-actions">
                <Button
                  text="Deploy Token"
                  intent="primary"
                  loading={loading}
                  onClick={() => deployToken({ variables: this.state })}
                />
              </div>
            </div>
          </Dialog>
        )}
      </Mutation>
    )
  }
}

export default withAccounts(DeployToken)
