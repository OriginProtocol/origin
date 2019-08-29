import React, { useState } from 'react'
import { useMutation } from '@apollo/react-hooks'
import { Button, ControlGroup, HTMLSelect, InputGroup } from '@blueprintjs/core'

import query from 'queries/AllAccounts'
import { AccountsQuery } from 'hoc/withAccounts'

import { CreateWalletMutation } from 'queries/Mutations'
import ImportWallet from './ImportWallet'
import ImportPhrase from './ImportPhrase'

const CreateWalletBtn = () => {
  const [state, setStateRaw] = useState({ role: 'Buyer', name: '' })
  const setState = newState => setStateRaw({ ...state, ...newState })

  const input = field => ({
    value: state[field],
    onChange: e => setState({ [field]: e.currentTarget.value })
  })

  const [createWallet] = useMutation(CreateWalletMutation, {
    refetchQueries: [{ query }, { query: AccountsQuery }]
  })

  return (
    <div style={{ display: 'flex' }} className="mb-3">
      <ControlGroup>
        <InputGroup {...input('name')} placeholder="Name" />
        <HTMLSelect
          options={['Buyer', 'Seller', 'Arbitrator', 'Affiliate', 'Admin']}
          {...input('role')}
        />
        <Button
          icon="add"
          onClick={() =>
            createWallet({ variables: { role: state.role, name: state.name } })
          }
          text="Create Wallet"
        />
      </ControlGroup>
      <Button
        icon="import"
        style={{ marginLeft: '0.5rem' }}
        onClick={() => setState({ import: true })}
      />
      <Button
        icon="multi-select"
        style={{ marginLeft: '0.5rem' }}
        onClick={() => setState({ importPhrase: true })}
      />
      <ImportWallet
        isOpen={state.import}
        onCompleted={() => setState({ import: false })}
      />
      <ImportPhrase
        isOpen={state.importPhrase}
        onCompleted={() => setState({ importPhrase: false })}
      />
    </div>
  )
}

export default CreateWalletBtn
