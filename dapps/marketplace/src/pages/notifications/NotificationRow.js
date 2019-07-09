import React from 'react'
import get from 'lodash/get'
import { fbt } from 'fbt-runtime'

import withIdentity from 'hoc/withIdentity'
import Pic from 'components/ListingPic'
import Link from 'components/Link'

import distanceToNow from 'utils/distanceToNow'

const Row = ({ node, identity, onClick }) => {
  const name = get(identity, 'fullName', get(node, 'party.id').substr(0, 6))
  const title = <b>{get(node, 'offer.listing.title')}</b>
  const event = get(node, 'event.event')
  let description = `${name} ${event} ${title}`
  const buyerId = get(node, 'offer.buyer.id')
  const partyId = get(node, 'party.id')
  const nameLink = <Link to={`/user/${partyId}`}>{name}</Link>

  const partyRole =
    partyId === buyerId
      ? fbt('Buyer:', 'notifications.buyer')
      : fbt('Seller:', 'notifications.seller')

  const shortenWallet = wallet => {
    if (!wallet) {
      return ''
    }

    return `${wallet.substr(0, 4)}...${wallet.substr(wallet.length - 4)}`
  }
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
        <Pic listing={get(node, 'offer.listing')} />
      </div>
      <div>
        <div>{description}</div>
        <div>
          {partyRole} {nameLink}{' '}
          <span className="pl-3 wallet">
            {shortenWallet(get(identity, 'id'))}
          </span>
        </div>
      </div>
      <div>
        {distanceToNow(get(node, 'event.timestamp'), { showJustNow: true })}
      </div>
    </div>
  )
}

export default withIdentity(Row, 'node.party.id')

require('react-styl')(`
  .dropdown-menu
    .notification-row
      padding: 1.25rem
  .notification-row
    display: flex
    cursor: pointer
    font-size: 18px
    font-weight: normal
    border-bottom: 1px solid #c0cbd4
    padding: 1.25rem 0rem
    min-height: 6.25rem
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
        overflow: hidden
        text-overflow: ellipsis
      > div:nth-child(2)
        overflow: hidden
        text-overflow: ellipsis
        font-size: 14px
        color: color: dark
        a
          font-weight: 500
        .wallet
          font-size: 13px
          color: #6f8294
    > div:nth-child(3)
      color: var(--bluey-grey)
      font-size: 14px
    &:last-child
      border: 0
    a
      font-weight: 500
    .pic
      margin-right: 1.5rem
      position: relative
      .main-pic
        width: 3.7rem
        height: 3.7rem
        background-size: cover
        background-position: center
        border-radius: 5px
        &.empty
          background: var(--light) url(images/default-image.svg)
          background-repeat: no-repeat
          background-position: center
          background-size: 40%
`)
