import React, { useState } from 'react'
import { useMutation } from '@apollo/react-hooks'
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

import AllAccount from 'queries/AllAccounts'
import { AccountsQuery } from 'hoc/withAccounts'

const RoleOptions = ['Buyer', 'Seller', 'Arbitrator', 'Affiliate', 'Admin']

const ImportPhrase = ({ isOpen, onCompleted }) => {
  const [state, setStateRaw] = useState({
    name: 'Nick',
    role: 'Buyer',
    phrase: defaultMnemonic,
    key: '',
    accounts: []
  })
  const setState = newState => setStateRaw({ ...state, ...newState })

  const input = field => ({
    value: state[field],
    onChange: e => setState({ [field]: e.currentTarget.value })
  })
  const accountsInput = (field, idx) => ({
    value: get(state, `accounts.${idx}.${field}`),
    onChange: e => {
      setState({
        accounts: set(
          clone(state.accounts),
          `${idx}.${field}`,
          e.currentTarget.value
        )
      })
    }
  })

  const [importWallet, { loading, error }] = useMutation(
    ImportWalletsMutation,
    {
      refetchQueries: [{ query: AllAccount }, { query: AccountsQuery }],
      onCompleted
    }
  )

  const accounts = mnemonicToAccounts(state.phrase)

  return (
    <Dialog title="Import Seed Phrase" isOpen={isOpen} onClose={onCompleted}>
      <div className="bp3-dialog-body">
        <ErrorCallout error={error} />
        <FormGroup label="Key Phrase">
          <ControlGroup fill={true}>
            <InputGroup {...input('phrase')} />
            <Button
              className="bp3-fixed"
              onClick={() => setState({ accounts })}
              text="Generate"
            />
          </ControlGroup>
        </FormGroup>
        {!state.accounts.length ? null : (
          <table>
            <thead>
              <tr>
                <th>Name</th>
                <th>Role</th>
                <th>Private Key</th>
              </tr>
            </thead>
            <tbody>
              {state.accounts.map((account, idx) => (
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
              importWallet({ variables: { accounts: state.accounts } })
            }
          />
        </div>
      </div>
    </Dialog>
  )
}

export default withAccounts(ImportPhrase)
