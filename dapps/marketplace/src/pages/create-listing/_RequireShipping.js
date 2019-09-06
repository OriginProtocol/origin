import React, { useCallback, useState } from 'react'

import { fbt } from 'fbt-runtime'

import { useQuery, useMutation } from 'react-apollo'

import get from 'lodash/get'

import EnableMessagingMutation from 'mutations/EnableMessaging'
import withMessagingStatus from 'hoc/withMessagingStatus'

import MobileModal from 'components/MobileModal'

const EnableEncryptionModal = ({ onEnabled, onClose }) => {
  const [enableMessagingMutation] = useMutation(EnableMessagingMutation)

  const [shouldClose, setShouldClose] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  const enableMessagingCallback = useCallback(async () => {
    try {
      setLoading(true)
      setError(null)

      await enableMessagingMutation()

      onEnabled(true)
      setShouldClose(true)
    } catch (e) {
      setError('Check console.')
      console.error(e)
    }

    setLoading(false)
  }, [onEnabled])

  return (
    <MobileModal
      headerImageUrl="images/encrypt-shipping-address-graphic.png"
      closeOnEsc={false}
      fullscreen={false}
      shouldClose={shouldClose}
      onClose={() => {
        setShouldClose(false)
        onClose()
      }}
      children={
        <div className="encryption-modal">
          <h3>
            <fbt desc="RequireShipping.EnableEncryption">Enable Encryption</fbt>
          </h3>
          <div className="encryption-content">
            <fbt desc="RequireShipping.enableMessagingForAddress">
              Shipping addresses will be securely encrypted and visible only to
              you and your buyers. To make this possible, Coinbase Wallet will
              ask you to enable Origin Messaging.
            </fbt>
          </div>
          {error && <div className="alert alert-danger mt-3">{error}</div>}
          <div className="actions">
            <button
              className="btn btn-primary"
              onClick={enableMessagingCallback}
              disabled={loading}
            >
              {loading ? (
                <fbt desc="Loading...">Loading...</fbt>
              ) : (
                <fbt desc="Got it">Got it</fbt>
              )}
            </button>
          </div>
        </div>
      }
    />
  )
}

const RequireShipping = ({
  onChange,
  hasMessagingKeys,
  messagingStatusError,
  messagingStatusLoading
}) => {
  const [requriresShipping, setRequriresShipping] = useState(false)
  const [encryptionModal, setEncryptionModal] = useState(false)

  const onChangeCallback = useCallback(
    e => {
      const value = e.target.value === 'yes'

      if (hasMessagingKeys) {
        setRequriresShipping(value)
      } else if (value) {
        // Show enable messaging modal if not enabled
        setEncryptionModal(true)
      }

      onChange(value)
    },
    [onChange, hasMessagingKeys]
  )

  if (messagingStatusError) {
    console.error(error)
    return null
  }

  if (messagingStatusLoading) {
    return null
  }

  return (
    <>
      {encryptionModal && (
        <EnableEncryptionModal
          onEnabled={() => setRequriresShipping(true)}
          onClose={() => {
            setEncryptionModal(false)
          }}
        />
      )}
      <div className="require-shipping">
        <div className="title">
          <fbt desc="RequireShipping.title">Require Shipping Address</fbt>
        </div>
        <div className="desc">
          <fbt desc="RequireShipping.doYouNeedShippingAddress">
            Will you need the buyer&apos;s shipping address to fulfill the
            order?
          </fbt>
        </div>
        <div className="actions">
          <label
            className={`radio-button${requriresShipping ? ' selected' : ''}`}
          >
            <input
              type="radio"
              value="yes"
              checked={requriresShipping}
              onChange={onChangeCallback}
            />
            <fbt desc="Yes">Yes</fbt>
          </label>
          <label
            className={`radio-button${!requriresShipping ? ' selected' : ''}`}
          >
            <input
              type="radio"
              value="no"
              checked={!requriresShipping}
              onChange={onChangeCallback}
            />
            <fbt desc="No">No</fbt>
          </label>
        </div>
      </div>
    </>
  )
}

export default withMessagingStatus(RequireShipping)

require('react-styl')(`
  .require-shipping
    .title, .desc
      text-align: center
      font-size: 1.25rem
      color: var(--dark)
    .title
      font-weight: bold
    .actions
      margin: 1.375rem 0 3.125rem 0
      display: flex
      .radio-button
        text-align: center
        flex: 1
        cursor: pointer
        border-radius: 10px
        border: solid 1px #c2cbd3
        color: #94a7b5
        font-size: 1.25rem
        font-weight: 400
        padding: 0.625rem 0
        &:first-child
          border-bottom-right-radius: 0
          border-top-right-radius: 0
        &:last-child
          border-bottom-left-radius: 0
          border-top-left-radius: 0
        &.selected
          color: #000
          background-color: #eaf0f3

        input
          display: none
  .encryption-modal
    padding: 1rem
    h3
      text-align: center
      font-size: 1.5rem
      margin: 0.5rem 0
    .encryption-content
      font-size: 0.875rem
      text-align: center
    .actions
      padding-top: 1.25rem
      .btn
        padding: 0.875rem 2rem
        font-size: 1.125rem
        border-radius: 50px
        width: 100%
`)
