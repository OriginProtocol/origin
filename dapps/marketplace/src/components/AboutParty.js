import React, { useState } from 'react'
import { Query } from 'react-apollo'
import get from 'lodash/get'
import { fbt } from 'fbt-runtime'

import Redirect from 'components/Redirect'
import Identicon from 'components/Identicon'
import Avatar from 'components/Avatar'
import SendMessage from 'components/SendMessage'
import EthAddress from 'components/EthAddress'
import QueryError from 'components/QueryError'
import Attestations from 'components/Attestations'

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
            return (
              <div className="eth-address">
                <Identicon size={40} address={owner} />
                <div>
                  <div>ETH Address:</div>
                  <div>
                    <EthAddress address={owner} />
                  </div>
                </div>
              </div>
            )
          }

          const verifiedAttestations = profile.verifiedAttestations || []

          return (
            <div className="profile" onClick={() => setRedirect(true)}>
              <Avatar profile={profile} size={50} />
              <div className="user-detail">
                <div className="name">{profile.fullName}</div>
                <Attestations profile={profile} small />
              </div>
            </div>
          )
        }}
      </Query>
      <div className="actions">
        <SendMessage to={id} className="btn btn-link">
          <fbt desc="AboutParty.contactSeller">Contact seller</fbt> &rsaquo;
        </SendMessage>
      </div>
    </div>
  )
}

export default withOwner(AboutParty)

require('react-styl')(`
  .about-party
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
    .actions
      margin: 1rem -0.25rem 0 -0.25rem
      display: flex
      align-items: center
      flex-wrap: wrap
      font-size: 18px
      .btn-link
        padding: 0
        font-weight: normal
`)
