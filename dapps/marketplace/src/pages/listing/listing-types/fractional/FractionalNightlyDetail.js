import React, { useState } from 'react'
import { fbt } from 'fbt-runtime'

import Calendar from 'components/Calendar'
import Modal from 'components/Modal'
import MobileModal from 'components/MobileModal'

import withIsMobile from 'hoc/withIsMobile'
import DateRange from '../../_DateRange'

const FractionalNightlyDetail = ({
  availability,
  onChange,
  onClose,
  listing,
  description,
  isOwnerViewing,
  openCalendar,
  isMobile
}) => {
  const [selectedRange, setSelectedRange] = useState(null)
  const [closeModal, setCloseModal] = useState(false)

  const [startDate, endDate] = (selectedRange ? selectedRange.range : '').split(
    '/'
  )

  const ModalComp = isMobile ? MobileModal : Modal

  return (
    <>
      {description}
      {openCalendar && (
        <ModalComp
          title={
            <>
              <button
                className="clear-button btn btn-link"
                disabled={!startDate && !endDate}
                onClick={() => setSelectedRange(null)}
              >
                <fbt desc="Clear">Clear</fbt>
              </button>
              <div>
                <fbt desc="Availability">Availability</fbt>
              </div>
              <div
                className="close-button"
                onClick={() => setCloseModal(true)}
              />
            </>
          }
          className="availability-modal nightly"
          shouldClose={closeModal}
          lightMode={true}
          showBackButton={false}
          onClose={() => {
            setCloseModal(false)
            onClose()
          }}
        >
          <>
            <DateRange startDate={startDate} endDate={endDate} />
            <Calendar
              interactive={!isOwnerViewing}
              small={true}
              onChange={state => setSelectedRange(state)}
              availability={availability}
              currency={listing.price.currency}
              startDate={startDate}
              endDate={endDate}
            />
            <div className="actions mt-auto">
              <button
                className="btn btn-primary btn-rounded mt-4"
                onClick={() => {
                  onChange(selectedRange)
                  setCloseModal(true)
                }}
                disabled={!startDate || !endDate}
              >
                <fbt desc="Save">Save</fbt>
              </button>
              {!isMobile && (
                <button
                  className="btn btn-outline mb-0"
                  onClick={() => {
                    setCloseModal(true)
                  }}
                >
                  <fbt desc="Cancel">Cancel</fbt>
                </button>
              )}
            </div>
          </>
        </ModalComp>
      )}
    </>
  )
}

export default withIsMobile(FractionalNightlyDetail)

require('react-styl')(`
  .availability-modal
    height: 95vh
    .choose-dates
      flex: auto 0 0
    .actions
      flex: auto 0 0
      display: flex
      flex-direction: column
      .btn
        width: 250px
        margin-left: auto
        margin-right: auto
    &.nightly
      .actions
        position: absolute
        left: 3rem
        right: 3rem
        bottom: 0.5rem
      .availability-calendar
        position: absolute
        top: 7.5rem
        bottom: 8.125rem
        left: 3rem
        right: 3rem
    &.modal-content
      min-height: auto
    &.modal-header
      .modal-title
        display: flex
        div
          flex: 1
        .clear-button, .close-button
          font-size: 12px
          flex: auto 0 0
          cursor: pointer
          font-weight: 300
        .close-button
          content: ''
          display: inline-block
          background-image: url('images/close-icon.svg')
          background-position: center
          background-repeat: no-repeat
          background-size: 1rem
          height: 2rem
          width: 2rem
        .clear-button
          text-decoration: none
          color: var(--bright-blue)
          &:hover
            color: var(--bright-blue)
  @media (max-width: 767.98px)
    .availability-modal
      height: auto
      padding: 1rem
      &.nightly
        .actions
          left: 1rem
          right: 1rem
          bottom: 1rem
        .availability-calendar
          top: 5rem
          bottom: 6rem
          left: 1rem
          right: 1rem
      .actions
        border-top: 1px solid #dde6ea
        .btn
          max-width: 100%
          width: 100%
          padding: 0.75rem 1rem
`)
