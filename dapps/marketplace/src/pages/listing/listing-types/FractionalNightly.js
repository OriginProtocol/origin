import React, { useState } from 'react'
import { fbt } from 'fbt-runtime'

import Calendar from 'components/Calendar'
import Modal from 'components/Modal'
import MobileModal from 'components/MobileModal'

import useIsMobile from 'utils/useMobile'
import DateRange from '../_DateRange'

const FractionalNightlyDetail = ({
  availability,
  onChange,
  onClose,
  listing,
  description,
  isOwnerViewing,
  openCalendar
}) => {
  const isMobile = useIsMobile()

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
          title={fbt('Availability', 'Availability')}
          className="availability-modal"
          shouldClose={closeModal}
          lightMode={true}
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
            />
            <div className="actions mt-auto">
              <button
                className="btn btn-primary btn-rounded mt-4"
                onClick={() => {
                  onChange(selectedRange)
                  setCloseModal(true)
                }}
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

export default FractionalNightlyDetail

require('react-styl')(`
  .availability-modal
    .actions
      display: flex
      flex-direction: column
      .btn
        width: 250px
        margin-left: auto
        margin-right: auto
  @media (max-width: 767.98px)
    .availability-modal
      padding: 1rem
      .actions
        border-top: 1px solid #dde6ea
        .btn
          max-width: auto
          width: 100%
`)
