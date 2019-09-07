import React, { useState, useCallback } from 'react'
import { useQuery, useMutation } from 'react-apollo'
import get from 'lodash/get'
import { fbt } from 'fbt-runtime'

import query from 'queries/DecryptShippingAddress'
import withMessagingStatus from 'hoc/withMessagingStatus'
import EnableMessagingMutation from 'mutations/EnableMessaging'

const ShippingAddress = ({
  offer,
  className,
  hasMessagingKeys,
  messagingStatusError,
  messagingStatusLoading
}) => {
  const { loading, error, data, refetch } = useQuery(query, {
    variables: {
      encrypted: offer.shippingAddressEncrypted
    },
    skip:
      !hasMessagingKeys ||
      messagingStatusError ||
      messagingStatusLoading ||
      !offer ||
      !offer.shippingAddressEncrypted,
    notifyOnNetworkStatusChange: true,
    fetchPolicy: 'no-cache'
  })

  const [loadingMutation, setLoadingMutation] = useState(false)

  const [enableMessagingMutation] = useMutation(EnableMessagingMutation)

  const enableMessagingCallback = useCallback(async () => {
    try {
      setLoadingMutation(true)

      await enableMessagingMutation()

      await refetch({
        variables: {
          encrypted: offer.shippingAddressEncrypted
        }
      })
    } catch (e) {
      console.error(e)
    }

    setLoadingMutation(false)
  }, [])

  if (!offer || !offer.shippingAddressEncrypted) {
    return null
  }

  if (loading || messagingStatusLoading) {
    return (
      <div
        className={`decrypted-shipping-address${
          className ? ' ' + className : ''
        }`}
      >
        <fbt desc="Loading...">Loading...</fbt>
      </div>
    )
  }

  if (!hasMessagingKeys) {
    return (
      <div
        className={`decrypted-shipping-address${
          className ? ' ' + className : ''
        }`}
      >
        <p className="mb-3">
          <fbt desc="DecryptedShippingAddress.enableMessaging">
            Enable messaging to decrypt shipping address
          </fbt>
        </p>
        <button
          className="btn btn-primary"
          onClick={enableMessagingCallback}
          disabled={loadingMutation}
        >
          {loadingMutation ? (
            <fbt desc="Loading...">Loading...</fbt>
          ) : (
            <fbt desc="Enable Messaging">Enable Messaging</fbt>
          )}
        </button>
      </div>
    )
  }

  const ship = get(data, 'messaging.decryptShippingAddress')

  if (error || !ship) {
    if (error) console.error(error)
    return (
      <div
        className={`decrypted-shipping-address${
          className ? ' ' + className : ''
        }`}
      >
        <fbt desc="DecryptedShippingAddress.failed">
          Could not decrypt shipping address
        </fbt>
      </div>
    )
  }

  return (
    <div
      className={`decrypted-shipping-address${
        className ? ' ' + className : ''
      }`}
    >
      <h4>Shipping Address</h4>

      {ship.name && (
        <>
          <div className="field-label">
            <fbt desc="DecryptedShippingAddress.Name">Name:</fbt>
          </div>
          <div className="field-value">{ship.name}</div>
        </>
      )}

      <div className="field-label">
        <fbt desc="DecryptedShippingAddress.StreetAddress">Street Address:</fbt>
      </div>
      <div className="field-value">
        <div>{ship.address1}</div>
        {ship.address2 && <div>{ship.address2}</div>}
      </div>

      <div className="field-label">
        <fbt desc="DecryptedShippingAddress.city">City/State/Region</fbt>
      </div>
      <div className="field-value">
        {ship.city}, {ship.stateProvinceRegion} {ship.postalCode}
      </div>

      <div className="field-label">
        <fbt desc="DecryptedShippingAddress.country">Country</fbt>
      </div>
      <div className="field-value">{ship.country}</div>

      {ship.other && (
        <>
          <div className="field-label">
            <fbt desc="DecryptedShippingAddress.other">Other</fbt>
          </div>
          <div className="field-value">{ship.other}</div>
        </>
      )}
    </div>
  )
}

export default withMessagingStatus(ShippingAddress)

require('react-styl')(`
  .transaction-progress .decrypted-shipping-address
    padding: 0 3rem
    border-left: 1px solid #dfe6ea
    margin-left: 1.875rem
    h4
      font-size: 1.25rem
      font-weight: 500
      margin-bottom: 1.125rem
    .field-label
      font-weight: bold
      font-size: 1.125rem
    .field-value
      font-size: 1.125rem
      margin-bottom: 1.125rem

  @media (max-width: 767.98px)
    .transaction-progress .decrypted-shipping-address
      padding: 0
      padding-top: 1.5rem
      margin-top: 1.5rem
      border-top: 1px solid #dfe6ea
      border-left: 0
      margin-left: 0

`)
