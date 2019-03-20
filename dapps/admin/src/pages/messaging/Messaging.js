import React, { Component } from 'react'
import { Query, Mutation } from 'react-apollo'
import gql from 'graphql-tag'

import { ControlGroup, InputGroup, Button, HTMLSelect } from '@blueprintjs/core'

import Address from 'components/Address'
import withAccounts from 'hoc/withAccounts'

const ConversationsQuery = gql`
  query Conversations($id: String) {
    messaging(id: $id) {
      enabled
      conversations {
        id
        timestamp
        messages {
          address
          content
          timestamp
        }
      }
    }
  }
`

const EnableMessagingMutation = gql`
  mutation EnableMessaging {
    enableMessaging
  }
`

const SendMessageMutation = gql`
  mutation SendMessage($to: String!, $content: String!) {
    sendMessage(to: $to, content: $content)
  }
`

class Messaging extends Component {
  state = {
    selected: '',
    conversation: '',
    message: '',
    newConv: '',
    newMessage: ''
  }
  render() {
    return (
      <div className="p-3">
        <h4 className="bp3-heading">Messaging</h4>
        <table>
          <tbody>
            {this.props.accounts.map((a, idx) => (
              <tr key={idx}>
                <td>
                  <label>
                    <input
                      type="radio"
                      className="mr-2"
                      name="selected"
                      checked={this.state.selected === a.id}
                      onChange={() => this.setState({ selected: a.id })}
                    />
                    <Address address={a.id} />
                  </label>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {this.renderAccount()}
      </div>
    )
  }

  renderAccount() {
    if (!this.state.selected) return null
    return (
      <Query
        query={ConversationsQuery}
        variables={{ id: this.state.selected }}
        fetchPolicy="network-only"
        pollInterval={2000}
      >
        {({ data, loading, error, refetch }) => {
          if (loading || error) {
            if (error) console.log(error)
            if (loading) console.log('Loading')
            return null
          }
          if (!data.messaging.enabled) {
            return (
              <div className="mt-3">
                <Mutation
                  mutation={EnableMessagingMutation}
                  onCompleted={() => {
                    console.log('Complete')
                    refetch()
                  }}
                >
                  {enableMessaging => (
                    <Button onClick={() => enableMessaging()}>
                      Enable Messaging
                    </Button>
                  )}
                </Mutation>
              </div>
            )
          }

          const accounts = this.props.accounts.filter(
            a =>
              a.id !== this.state.selected &&
              !data.messaging.conversations.some(c => c.id === a.id)
          )
          const firstAccount = accounts && accounts[0] ? accounts[0].id : null

          return (
            <div className="mt-3">
              Rooms
              {data.messaging.conversations.map(c => (
                <div key={c.id}>
                  <label>
                    <input
                      type="radio"
                      className="mr-2"
                      name="conversation"
                      checked={this.state.conversation === c.id}
                      onChange={() => this.setState({ conversation: c.id })}
                    />
                    Conversation with <Address address={c.id} />
                  </label>
                </div>
              ))}
              {this.renderConversation(data.messaging.conversations)}
              <hr />
              {!accounts.length ? null : (
                <div>
                  <h4>Start new conversation:</h4>
                  <Mutation
                    mutation={SendMessageMutation}
                    refetchQueries={['Conversations']}
                  >
                    {sendMessage => (
                      <ControlGroup className="mt-3">
                        <HTMLSelect
                          options={accounts.map(a => ({
                            label: a.id.substr(0, 6),
                            value: a.id
                          }))}
                          value={this.state.newConv || firstAccount}
                          onChange={e =>
                            this.setState({ newConv: e.currentTarget.value })
                          }
                        />
                        <InputGroup
                          placeholder="Message"
                          onChange={e =>
                            this.setState({ newMessage: e.currentTarget.value })
                          }
                          value={this.state.newMessage}
                        />
                        <Button
                          icon="arrow-up"
                          onClick={() => {
                            this.setState({ newMessage: '' })
                            sendMessage({
                              variables: {
                                content: this.state.newMessage,
                                to: this.state.newConv || firstAccount
                              }
                            })
                          }}
                        />
                      </ControlGroup>
                    )}
                  </Mutation>
                </div>
              )}
            </div>
          )
        }}
      </Query>
    )
  }

  renderConversation(data) {
    if (!this.state.conversation) return null
    const conv = data.find(c => c.id === this.state.conversation)
    if (!conv) return null

    return (
      <div className="mt-3">
        {conv.messages.map((msg, idx) => (
          <div key={idx}>
            <Address address={msg.address} />
            {`: ${msg.content}`}
          </div>
        ))}
        <Mutation
          mutation={SendMessageMutation}
          onComplete={() => this.setState({ message: '' })}
        >
          {sendMessage => (
            <ControlGroup className="mt-3">
              <InputGroup
                placeholder="Message"
                onChange={e =>
                  this.setState({ message: e.currentTarget.value })
                }
                value={this.state.message}
              />
              <Button
                icon="arrow-up"
                onClick={() =>
                  sendMessage({
                    variables: {
                      content: this.state.message,
                      to: this.state.conversation
                    }
                  })
                }
              />
            </ControlGroup>
          )}
        </Mutation>
      </div>
    )
  }
}

export default withAccounts(Messaging)
