import React, { Component } from 'react'
import { Mutation } from 'react-apollo'
import { Button, ControlGroup, HTMLSelect, InputGroup } from '@blueprintjs/core'

import query from 'queries/AllAccounts'

import { CreateWalletMutation } from 'queries/Mutations'
import ImportWallet from './ImportWallet'
import ImportPhrase from './ImportPhrase'

class CreateWalletBtn extends Component {
  state = {
    role: 'Buyer',
    name: ''
  }
  render() {
    const input = field => ({
      value: this.state[field],
      onChange: e => this.setState({ [field]: e.currentTarget.value })
    })
    return (
      <Mutation
        mutation={CreateWalletMutation}
        update={(cache, { data }) => {
          const res = cache.readQuery({ query })
          const accounts = res.web3.accounts || []
          cache.writeQuery({
            query,
            data: {
              web3: {
                ...res.web3,
                accounts: [...accounts, data.createWallet]
              }
            }
          })
        }}
      >
        {createWallet => (
          <div style={{ display: 'flex' }} className="mb-3">
            <ControlGroup>
              <InputGroup {...input('name')} placeholder="Name" />
              <HTMLSelect
                options={[
                  'Buyer',
                  'Seller',
                  'Arbitrator',
                  'Affiliate',
                  'Admin'
                ]}
                {...input('role')}
              />
              <Button
                icon="add"
                onClick={() =>
                  createWallet({
                    variables: { role: this.state.role, name: this.state.name }
                  })
                }
                text="Create Wallet"
              />
            </ControlGroup>
            <Button
              icon="import"
              style={{ marginLeft: '0.5rem' }}
              onClick={() => this.setState({ import: true })}
            />
            <Button
              icon="multi-select"
              style={{ marginLeft: '0.5rem' }}
              onClick={() => this.setState({ importPhrase: true })}
            />
            <ImportWallet
              isOpen={this.state.import}
              onCompleted={() => this.setState({ import: false })}
            />
            <ImportPhrase
              isOpen={this.state.importPhrase}
              onCompleted={() => this.setState({ importPhrase: false })}
            />
          </div>
        )}
      </Mutation>
    )
  }
}

export default CreateWalletBtn
