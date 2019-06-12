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
import withOwner from 'hoc/withOwner'

const getVerifiedTooltip = provider => {
  switch (provider) {
    case 'email':
      return fbt('Email Verified', 'Email Verified')
    case 'phone':
      return fbt('Phone Verified', 'Phone Verified')
    case 'website':
      return fbt('Website Verified', 'Website Verified')
    case 'airbnb':
      return fbt('Airbnb Account Verified', 'Airbnb Account Verified')
    case 'github':
      return fbt('GitHub Account Verified', 'GitHub Account Verified')
    case 'facebook':
      return fbt('Facebook Account Verified', 'Facebook Account Verified')
    case 'twitter':
      return fbt('Twitter Account Verified', 'Twitter Account Verified')
    case 'google':
      return fbt('Google Account Verified', 'Google Account Verified')
    case 'kakao':
      return fbt('Kakao Account Verified', 'Kakao Account Verified')
    case 'linkedin':
      return fbt('LinkedIn Account Verified', 'LinkedIn Account Verified')
    case 'wechat':
      return fbt('WeChat Account Verified', 'WeChat Account Verified')
  }

  return provider
}

const AboutParty = ({ id, owner }) => {
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

          const verifiedAttestations = profile.verifiedAttestations || []

          return (
            <div className="profile" onClick={() => setRedirect(true)}>
              <Avatar profile={profile} size={50} />
              <div className="user-detail">
                <div className="name">{profile.fullName}</div>
                <div className="attestations">
                  {verifiedAttestations.map(attestation => {
                    return (
                      <Tooltip
                        key={attestation.id}
                        placement="bottom"
                        tooltip={getVerifiedTooltip(attestation.id)}
                      >
                        <div className={`attestation ${attestation.id}`} />
                      </Tooltip>
                    )
                  })}
                </div>
              </div>
            </div>
          )
        }}
      </Query>
      <div className="eth-address">
        <Identicon size={40} address={owner} />
        <div>
          <div>ETH Address:</div>
          <div>
            <EthAddress address={owner} />
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

export default withOwner(AboutParty)

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
