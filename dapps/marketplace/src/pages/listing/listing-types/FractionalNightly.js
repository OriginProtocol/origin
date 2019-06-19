import React from 'react'
import { fbt } from 'fbt-runtime'

import Calendar from 'components/Calendar'

const FractionalNightlyDetail = ({
  availability,
  onChange,
  listing,
  description,
  isOwnerViewing
}) => (
  <>
    {description}
    <hr />
    <Calendar
      interactive={!isOwnerViewing}
      small={true}
      onChange={state => onChange(state)}
      availability={availability}
      currency={listing.price.currency}
    />
    <div className="availability-help">
      <fbt desc="listingDetail.calendarDateRange">
        * Click to select start date and again to select end date.
      </fbt>
    </div>
  </>
)

export default FractionalNightlyDetail
