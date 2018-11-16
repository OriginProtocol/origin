import React, { Component } from 'react'
import { Mutation } from 'react-apollo'
import gql from 'graphql-tag'

import {
  Popover,
  Position,
  Button,
  Menu
} from '@blueprintjs/core'

import withAccounts from 'hoc/withAccounts'

import Toaster from '../pages/Toaster'

const TransferToken = gql`
  mutation TransferToken(
    $token: String!
    $from: String!
    $to: String!
    $value: String!
  ) {
    transferToken(token: $token, from: $from, to: $to, value: $value) {
      id
    }
  }
`

class TokenButton extends Component {
  state = {}
  render() {
    const { balance, accounts, current } = this.props
    return (
      <Mutation
        mutation={TransferToken}
        onError={error => {
          Toaster.show({
            message: `${error}`,
            intent: 'danger',
            icon: 'warning-sign'
          })
        }}
      >
        {(transferToken, { loading }) => (
          <Popover
            lazy={true}
            autoFocus={false}
            content={
              <Menu style={{ minWidth: 100 }}>
                <Menu.Item text="Send 50 OGN" style={{ minWidth: 100 }}>
                  {accounts.map(
                    a =>
                      current && a.id !== current.id ? (
                        <Menu.Item
                          key={a.id}
                          text={`${a.name || `${a.id.substr(0, 8)}`}${
                            a.role ? ` (${a.role})` : ''
                          }`}
                          onClick={() => {
                            transferToken({
                              variables: {
                                token: 'ogn',
                                from: current.id,
                                to: a.id,
                                value: '50'
                              }
                            })
                          }}
                        />
                      ) : null
                  )}
                </Menu.Item>
                <Menu.Item text="Approve 50 OGN" style={{ minWidth: 100 }}>
                  {accounts.map(
                    a =>
                      current && a.id !== current.id ? (
                        <Menu.Item
                          key={a.id}
                          text={a.name || `${a.id.substr(0, 8)}`}
                        />
                      ) : null
                  )}
                </Menu.Item>
              </Menu>
            }
            position={Position.BOTTOM}
          >
            <Button loading={loading}>
              {balance}
            </Button>
          </Popover>
        )}
      </Mutation>
    )
  }
}

export default withAccounts(TokenButton)
