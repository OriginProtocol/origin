import React, { useState } from 'react'
import { useQuery } from '@apollo/react-hooks'
import get from 'lodash/get'
import { fbt } from 'fbt-runtime'

import Redirect from 'components/Redirect'
import Identicon from 'components/Identicon'
import Avatar from 'components/Avatar'
import SendMessage from 'components/SendMessage'
import EthAddress from 'components/EthAddress'
import QueryError from 'components/QueryError'
import Attestations from 'components/Attestations'
import Link from 'components/Link'

import query from 'queries/SkinnyIdentity'
import withOwner from 'hoc/withOwner'

const Identity = ({ id, owner }) => {
  const [redirect, setRedirect] = useState(false)

  const { data, loading, error } = useQuery(query, {
    skip: !id,
    variables: { id }
  })

  if (redirect) {
    return <Redirect push to={`/user/${id}`} />
  }

  if (error) {
    return <QueryError error={error} query={query} vars={{ id }} />
  }
  if (loading || !id || !owner) return null

  const profile = get(data, 'identity')
  if (!profile) {
    return (
      <div className="profile">
        <Identicon size={50} address={owner} />
        <div className="user-detail">
          <div>
            <fbt desc="aboutParty.ethAddress">ETH Address</fbt>
          </div>
          <div>
            <EthAddress address={owner} short />
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="profile" onClick={() => setRedirect(true)}>
      <Avatar profile={profile} size={50} />
      <div className="user-detail">
        <div className="name">{profile.fullName}</div>
        <Attestations profile={profile} small />
      </div>
    </div>
  )
}

const AboutParty = ({ id, owner, role }) => {
  return (
    <div className="about-party">
      <Identity owner={owner} id={id} />
      <div className="actions">
        <SendMessage to={id} className="btn btn-link">
          <fbt desc="AboutParty.contact">
            Contact{' '}
            <fbt:param name="role">
              {role}
            </fbt:param>
          </fbt>
        </SendMessage>
        <Link to={`/user/${id}/reviews`} className="btn btn-link">
          <fbt desc="Reviews">Reviews</fbt>
        </Link>
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
      .avatar,.identicon
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
      margin: 1rem 0 0 0
      display: flex
      align-items: center
      flex-wrap: wrap
      font-size: 18px
      .btn-link
        padding: 0
        font-weight: normal
        width: 100%
        text-align: left
        &:after
          content: '>'
          margin-left: 5px
`)
