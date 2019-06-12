import React from 'react'
import { fbt } from 'fbt-runtime'

import WeekCalendar from 'components/WeekCalendar'

const FractionalHourlyDetail = ({
  availability,
  onChange,
  listing,
  description,
  isOwnerViewing
}) => {
  const userTimeZone = Intl.DateTimeFormat().resolvedOptions().timeZone
  const isDifferentTimeZone = listing.timeZone !== userTimeZone
  return (
    <>
      {description}
      <hr />
      <div className="timeZone">
        <div>
          <fbt desc="listingDetail.timeZone">Time Zone:</fbt> {listing.timeZone}
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
        onChange={state => onChange(state)}
        availability={availability}
        currency={listing.price.currency}
      />
      <div className="availability-help">
        <fbt desc="listingDetail.weekCalendarRangeHelp">
          * Click to select start time and again for end time
        </fbt>
      </div>
    </>
  )
}
export default FractionalHourlyDetail
