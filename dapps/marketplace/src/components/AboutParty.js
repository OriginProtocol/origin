import React, { useState } from 'react'
import { Query } from 'react-apollo'
import get from 'lodash/get'
import { fbt } from 'fbt-runtime'

import Redirect from 'components/Redirect'
import Identicon from 'components/Identicon'
import Avatar from 'components/Avatar'
import SendMessage from 'components/SendMessage'
import Tooltip from 'components/Tooltip'
import EthAddress from 'components/EthAddress'
import QueryError from 'components/QueryError'
import Link from 'components/Link'

import query from 'queries/Identity'

const AboutParty = ({ id }) => {
  const [redirect, setRedirect] = useState(false)

  if (redirect) {
    return <Redirect to={`/user/${id}`} />
  }

  return (
    <div className="about-party">
      <Query query={query} variables={{ id }}>
        {({ data, loading, error }) => {
          if (error) {
            return <QueryError error={error} query={query} vars={{ id }} />
          }
          if (loading) return null

          const profile = get(data, 'web3.account.identity')
          if (!profile) {
            return null
          }

          return (
            <div className="profile" onClick={() => setRedirect(true)}>
              <Avatar avatar={profile.avatar} size={50} />
              <div className="user-detail">
                <div className="name">{profile.fullName}</div>
                <div className="attestations">
                  {profile.twitterVerified && (
                    <Tooltip
                      tooltip={fbt(
                        'Twitter Account Verified',
                        'Twitter Account Verified'
                      )}
                      placement="bottom"
                    >
                      <div className="attestation twitter" />
                    </Tooltip>
                  )}
                  {profile.googleVerified && (
                    <Tooltip
                      tooltip={fbt(
                        'Google Account Verified',
                        'Google Account Verified'
                      )}
                      placement="bottom"
                    >
                      <div className="attestation google" />
                    </Tooltip>
                  )}
                  {profile.phoneVerified && (
                    <Tooltip
                      tooltip={fbt('Phone Verified', 'Phone Verified')}
                      placement="bottom"
                    >
                      <div className="attestation phone" />
                    </Tooltip>
                  )}
                  {profile.emailVerified && (
                    <Tooltip
                      tooltip={fbt('Email Verified', 'Email Verified')}
                      placement="bottom"
                    >
                      <div className="attestation email" />
                    </Tooltip>
                  )}
                  {profile.facebookVerified && (
                    <Tooltip
                      tooltip={fbt('Facebook Verified', 'Facebook Verified')}
                      placement="bottom"
                    >
                      <div className="attestation facebook" />
                    </Tooltip>
                  )}
                  {profile.airbnbVerified && (
                    <Tooltip
                      tooltip={fbt(
                        'Airbnb Account Verified',
                        'Airbnb Account Verified'
                      )}
                      placement="bottom"
                    >
                      <div className="attestation airbnb" />
                    </Tooltip>
                  )}
                </div>
              </div>
            </div>
          )
        }}
      </Query>
      <div className="eth-address">
        <Identicon size={40} address={id} />
        <div>
          <div>ETH Address:</div>
          <div>
            <EthAddress address={id} />
          </div>
        </div>
      </div>
      <div className="actions">
        <SendMessage
          to={id}
          className="btn btn-outline-primary btn-rounded"
          children={fbt('Send Message', 'Send Message')}
        />
        <Link
          to={`/user/${id}`}
          className="btn btn-outline-primary btn-rounded"
        >
          View Profile
        </Link>
      </div>
    </div>
  )
}

export default AboutParty

require('react-styl')(`
  .about-party
    background: var(--pale-grey-eight)
    border-radius: var(--default-radius)
    padding: 1rem 1rem 0.5rem 1rem
    font-size: 14px
    font-weight: normal
    .profile
      display: flex
      margin-bottom: 1rem
      cursor: pointer
      .user-detail
        min-width: 0
      .avatar
        margin-right: 1rem
      .name
        font-size: 18px
        font-weight: bold
        line-height: 1.25rem
        margin-bottom: 0.5rem
        white-space: nowrap
        overflow: hidden
        text-overflow: ellipsis
    .eth-address
      display: flex
      > img
        margin: 0 5px
      > div
        margin-left: 1rem
    .actions
      margin: 1rem -0.25rem 0 -0.25rem
      display: flex
      align-items: center
      flex-wrap: wrap
    .btn-rounded
      flex: 1
      padding-left: 1rem
      padding-right: 1rem
      white-space: nowrap
      margin: 0 0.25rem 0.5rem 0.25rem
`)
