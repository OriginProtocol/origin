import React, { useCallback, useState } from 'react'

import { fbt } from 'fbt-runtime'

import get from 'lodash/get'

const RequireShipping = ({ onChange, listing }) => {
  const isForSale = get(listing, 'category') === 'schema.forSale'
  const [requriresShipping, setRequriresShipping] = useState(
    get(listing, 'requriresShipping', isForSale)
  )

  const onChangeCallback = useCallback(
    e => {
      const value = e.target.value === 'yes'
      setRequriresShipping(value)
      onChange(value)
    },
    [onChange]
  )

  return (
    <div className="require-shipping">
      <div className="title">
        <fbt desc="RequireShipping.title">Require Shipping Address</fbt>
      </div>
      <div className="desc">
        <fbt desc="RequireShipping.doYouNeedShippingAddress">
          Will you need the buyer&apos;s shipping address to fulfill the order?
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
  )
}

export default RequireShipping

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
