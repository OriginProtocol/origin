import React, { Component } from 'react'
import { Mutation } from 'react-apollo'
import withAccounts from 'hoc/withAccounts'
import get from 'lodash/get'
import clone from 'lodash/clone'
import set from 'lodash/set'
import mnemonicToAccounts, { defaultMnemonic } from 'utils/mnemonicToAccounts'

import {
  Button,
  Dialog,
  FormGroup,
  InputGroup,
  HTMLSelect,
  ControlGroup
} from '@blueprintjs/core'

import { ImportWalletsMutation } from 'queries/Mutations'
import ErrorCallout from 'components/ErrorCallout'

const RoleOptions = ['Buyer', 'Seller', 'Arbitrator', 'Affiliate', 'Admin']

class ImportPhrase extends Component {
  constructor(props) {
    super(props)
    this.state = {
      name: 'Nick',
      role: 'Buyer',
      phrase: defaultMnemonic,
      key: '',
      accounts: []
    }
  }

  render() {
    const input = field => ({
      value: this.state[field],
      onChange: e => this.setState({ [field]: e.currentTarget.value })
    })
    const accountsInput = (field, idx) => ({
      value: get(this.state, `accounts.${idx}.${field}`),
      onChange: e => {
        this.setState({
          accounts: set(
            clone(this.state.accounts),
            `${idx}.${field}`,
            e.currentTarget.value
          )
        })
      }
    })
    return (
      <Mutation
        mutation={ImportWalletsMutation}
        onCompleted={this.props.onCompleted}
        refetchQueries={['AllAccounts']}
      >
        {(importWallet, { loading, error }) => (
          <Dialog
            title="Import Seed Phrase"
            isOpen={this.props.isOpen}
            onClose={this.props.onCompleted}
            refetchQueries={['AllAccounts']}
          >
            <div className="bp3-dialog-body">
              <ErrorCallout error={error} />
              <FormGroup label="Key Phrase">
                <ControlGroup fill={true}>
                  <InputGroup {...input('phrase')} />
                  <Button
                    className="bp3-fixed"
                    onClick={() => {
                      this.setState({
                        accounts: mnemonicToAccounts(this.state.phrase)
                      })
                    }}
                    text="Generate"
                  />
                </ControlGroup>
              </FormGroup>
              {!this.state.accounts.length ? null : (
                <table>
                  <thead>
                    <tr>
                      <th>Name</th>
                      <th>Role</th>
                      <th>Private Key</th>
                    </tr>
                  </thead>
                  <tbody>
                    {this.state.accounts.map((account, idx) => (
                      <tr key={idx}>
                        <td style={{ width: '25%' }}>
                          <InputGroup {...accountsInput('name', idx)} />
                        </td>
                        <td style={{ width: '25%' }}>
                          <HTMLSelect
                            fill={true}
                            options={RoleOptions}
                            {...accountsInput('role', idx)}
                          />
                        </td>
                        <td>
                          <InputGroup {...accountsInput('privateKey', idx)} />
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
            <div className="bp3-dialog-footer">
              <div className="bp3-dialog-footer-actions">
                <Button
                  text="Import"
                  intent="primary"
                  loading={loading}
                  onClick={() =>
                    importWallet({
                      variables: { accounts: this.state.accounts }
                    })
                  }
                />
              </div>
            </div>
          </Dialog>
        )}
      </Mutation>
    )
  }
}

export default withAccounts(ImportPhrase)
