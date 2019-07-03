import React, { useState } from 'react'
import { fbt } from 'fbt-runtime'

import WeekCalendar from 'components/WeekCalendar'
import Modal from 'components/Modal'
import MobileModal from 'components/MobileModal'

import useIsMobile from 'utils/useMobile'
import DateRange from '../_DateRange'

const FractionalHourlyDetail = ({
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

  const userTimeZone = Intl.DateTimeFormat().resolvedOptions().timeZone
  const isDifferentTimeZone = listing.timeZone !== userTimeZone
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
            <DateRange startDate={startDate} endDate={endDate} timeRange />
            <div className="timeZone">
              <div>
                <fbt desc="listingDetail.timeZone">Time Zone:</fbt>{' '}
                {listing.timeZone}
                {isDifferentTimeZone && (
                  <div>
                    <fbt desc="listingDetail.timeZoneWarning">
                      NOTE: This is different from your time zone of
                      <fbt:param name="userTimeZone">{userTimeZone}</fbt:param>
                    </fbt>
                  </div>
                )}
              </div>
            </div>
            <WeekCalendar
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
export default FractionalHourlyDetail

require('react-styl')(`
  .timeZone
    font-size: 14px
    margin-bottom: 1rem
`)
