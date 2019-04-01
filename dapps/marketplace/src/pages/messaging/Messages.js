import React, { Component } from 'react'
import { Query, Mutation } from 'react-apollo'
import { Link } from 'react-router-dom'
import { fbt } from 'fbt-runtime'
import get from 'lodash/get'
import queryString from 'query-string'

import withWallet from 'hoc/withWallet'
import withIdentity from 'hoc/withIdentity'
import query from 'queries/Conversations'
import MarkConversationRead from 'mutations/MarkConversationRead'

import RoomStatus from './RoomStatus'
import Room from './Room'
import QueryError from 'components/QueryError'
import Avatar from 'components/Avatar'
import DocumentTitle from 'components/DocumentTitle'

import { abbreviateName, truncateAddress } from 'utils/user'

const MobileNavigation = props => (
  <div
    className={`back ${
      props.displayBackNav
    } d-md-none flex-row justify-content-start`}
  >
    <i
      className="icon-arrow-left align-self-start mr-auto"
      onClick={() => props.history.push('/messages?back=true')}
    />
    <Link to={`/user/${props.wallet}`} className="mr-auto">
      <Avatar avatar={get(props, 'identity.avatar')} size={30} />
      <span className="counterparty">
        {abbreviateName(props.identity) || truncateAddress(props.wallet)}
      </span>
    </Link>
  </div>
)

const MobileNavigationWithIdentity = withIdentity(MobileNavigation)

class Messages extends Component {
  constructor(props) {
    super(props)
    const isSmallScreen = window.innerWidth <= 991

    this.checkForSmallScreen = this.checkForSmallScreen.bind(this)
    this.state = { smallScreen: isSmallScreen, conversationId: '' }
  }

  componentDidMount() {
    window.addEventListener('resize', this.checkForSmallScreen)
  }

  componentWillUnmount() {
    window.removeEventListener('resize', this.checkForSmallScreen)
  }

  checkForSmallScreen() {
    const { smallScreen, conversationId } = this.state
    const query = get(this.props, 'location.search', {})
    const backButtonPressed = queryString.parse(query).back
    const isSmallScreen = window.innerWidth <= 991

    if (smallScreen !== isSmallScreen) {
      this.setState({ smallScreen: isSmallScreen })
    }

    if (!isSmallScreen && backButtonPressed) {
      this.props.history.replace('/messages')
    }

    if (isSmallScreen && !backButtonPressed && conversationId) {
      this.props.history.replace(`/messages/${conversationId}`)
    }

    return isSmallScreen
  }

  render() {
    return (
      <div className="container messages-page">
        <DocumentTitle pageTitle={<fbt desc="Messages.title">Messages</fbt>} />
        <Mutation mutation={MarkConversationRead}>
          {markConversationRead => (
            <Query query={query} pollInterval={500}>
              {({ error, data, loading }) => {
                if (error) {
                  return <QueryError query={query} error={error} />
                } else if (loading) {
                  return (
                    <div>
                      <fbt desc="Messages.loading">
                        Loading conversations...
                      </fbt>
                    </div>
                  )
                } else if (!data || !data.messaging) {
                  return (
                    <p className="p-3">
                      <fbt desc="Messages.cannotQuery">
                        Cannot query messages
                      </fbt>
                    </p>
                  )
                }

                const conversations = get(
                  data,
                  'messaging.conversations',
                  []
                ).sort((a, b) => {
                  const alm = a.lastMessage || { timestamp: Date.now() }
                  const blm = b.lastMessage || { timestamp: Date.now() }

                  return alm.timestamp > blm.timestamp ? -1 : 1
                })
                const room = get(this.props, 'match.params.room')
                const defaultRoom = this.state.smallScreen
                  ? ''
                  : get(conversations, '0.id')
                const active = room || defaultRoom
                const displayConversations = room ? 'd-none' : 'd-block'
                const displayBackNav = room ? 'd-block d-flex' : 'd-none'

                return (
                  <div className="row">
                    <MobileNavigationWithIdentity
                      history={this.props.history}
                      wallet={this.state.conversationId || active}
                      displayBackNav={displayBackNav}
                    />
                    <div
                      className={`col-md-3 ${displayConversations} d-md-block`}
                    >
                      {conversations.length ? null : (
                        <div>
                          <fbt desc="Messages.none">No conversations!</fbt>
                        </div>
                      )}
                      {conversations.map((conv, idx) => (
                        <RoomStatus
                          key={idx}
                          active={active === conv.id}
                          conversation={conv}
                          wallet={conv.id}
                          onClick={() => {
                            this.setState({ conversationId: conv.id })
                            this.props.history.push(`/messages/${conv.id}`)
                          }}
                        />
                      ))}
                    </div>
                    <div className="col-md-9">
                      {active ? (
                        <Room
                          id={active}
                          markRead={markConversationRead}
                          enabled={data.messaging.enabled}
                        />
                      ) : null}
                    </div>
                  </div>
                )
              }}
            </Query>
          )}
        </Mutation>
      </div>
    )
  }
}

export default withWallet(Messages)

require('react-styl')(`
  .messages-page
    margin-top: 1rem
    .back
      background-color: var(--dusk)
      height: 60px
      width: 100%
      margin-bottom: 10px
      margin-top: -16px

      .avatar
        margin: 0 10px 12px auto
        align-self: center
        display: inline-block
        vertical-align: bottom
      .avatar-container
        height: 30px
        width: 30px

      i
        width: 18px
        height: 18px
        border-radius: 3px
        border: solid white
        border-width: 0 4px 4px 0
        display: inline-block
        padding: 3px

        &.icon-arrow-left
          margin-left: 18px
          margin-top: 20px
          transform: rotate(135deg)
          -webkit-transform: rotate(135deg)

      .counterparty
        margin-right: auto
        font-size: 22px
        font-weight: bold
        color: white
        margin-bottom: 5px
        width: 200px
        text-align: left
        line-height: 57px

      a
        color: white

      &:hover
        color: white
`)
