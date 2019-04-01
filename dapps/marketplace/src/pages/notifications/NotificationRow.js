import React from 'react'
import get from 'lodash/get'
import { fbt } from 'fbt-runtime'

import withIdentity from 'hoc/withIdentity'

import Link from 'components/Link'
import Avatar from 'components/Avatar'

import distanceToNow from 'utils/distanceToNow'

const Row = ({ node, identity, onClick }) => {
  const name = get(identity, 'fullName', get(node, 'party.id').substr(0, 6))
  const title = <b>{get(node, 'offer.listing.title')}</b>
  const event = get(node, 'event.event')
  let description = `${name} ${event} ${title}`
  const nameLink = <Link to={`/user/${get(node, 'party.id')}`}>{name}</Link>

  if (event === 'OfferWithdrawn') {
    description = (
      <>
        {fbt(
          `${fbt.param(
            'nameLink',
            nameLink
          )} declined your offer on ${fbt.param('title', title)}`,
          'NotificationRow.declineOfferOn'
        )}
      </>
    )
  } else if (event === 'OfferAccepted') {
    description = (
      <>
        {fbt(
          `${fbt.param(
            'nameLink',
            nameLink
          )} accepted your offer on ${fbt.param('title', title)}`,
          'NotificationRow.acceptOfferOn'
        )}
      </>
    )
  } else if (event === 'OfferFinalized') {
    description = (
      <>
        {fbt(
          `Transaction with ${fbt.param(
            'nameLink',
            nameLink
          )} finalized for ${fbt.param('title', title)}`,
          'NotificationRow.acceptOfferOn'
        )}
      </>
    )
  } else if (event === 'OfferCreated') {
    description = (
      <>
        {fbt(
          `${fbt.param('nameLink', nameLink)} made an offer on ${fbt.param(
            'title',
            title
          )}`,
          'NotificationRow.acceptOfferOn'
        )}
      </>
    )
  } else if (event === 'OfferDisputed') {
    description = (
      <>
        {fbt(
          `${fbt.param('nameLink', nameLink)} disputed an offer on ${fbt.param(
            'title',
            title
          )}`,
          'NotificationRow.acceptOfferOn'
        )}
      </>
    )
  } else if (event === 'OfferRuling') {
    description = (
      <>
        {fbt(
          `${fbt.param('nameLink', nameLink)} resolved a dispute on ${fbt.param(
            'title',
            title
          )}`,
          'NotificationRow.acceptOfferOn'
        )}
      </>
    )
  }

  return (
    <div className="notification-row" onClick={() => onClick()}>
      <div>
        <Avatar avatar={get(identity, 'profile.avatar')} />
      </div>
      <div>
        <div>{description}</div>
        <div>{get(node, 'event.transactionHash')}</div>
      </div>
      <div>{distanceToNow(get(node, 'event.timestamp'))}</div>
      <div className="caret" />
    </div>
  )
}

export default withIdentity(Row, 'party.id')

require('react-styl')(`
  .notification-row
    display: flex
    cursor: pointer
    font-size: 18px
    font-weight: normal
    border-bottom: 1px solid var(--light)
    padding: 0.75rem
    &:hover
      background: var(--pale-grey-eight)
    > div:nth-child(1)
      width: 50px
      height: 50px
      margin-right: 1rem
    > div:nth-child(2)
      flex: 1
      min-width: 0
      > div:nth-child(1)
        white-space: nowrap
        overflow: hidden;
        text-overflow: ellipsis;
      > div:nth-child(2)
        overflow: hidden
        text-overflow: ellipsis
        font-size: 14px
        color: var(--steel)
    > div:nth-child(3)
      color: var(--steel)
      font-size: 14px
    &:last-child
      border: 0
    a
      font-weight: bold
    .caret
      border: 1px solid var(--clear-blue)
      border-radius: 2rem
      width: 1.75rem
      height: 1.75rem
      margin-left: 1rem
      background: url(images/caret-blue.svg) no-repeat center 7px
      transform: rotate(90deg)
      background-size: 12px;
`)
