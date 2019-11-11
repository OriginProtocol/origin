import React, { useState } from 'react'
import { Redirect } from 'react-router-dom'

import UnlockSchedule from '@/assets/unlock-schedule.png'

const RevisedSchedule = () => {
  const [redirectTo, setRedirectTo] = useState(null)

  if (redirectTo) {
    return <Redirect push to={redirectTo} />
  }

  return (
    <>
      <div className="action-card wide">
        <h1>Revised Token Unlock Schedule</h1>
        <p>
          Multiple top-tier exchanges that we are partnering with to list Origin
          Tokens (OGN) have required us to modify our token release schedule.
          These amendments have been approved by our largest investors,
          including Pantera Capital, Foundation Capital, Blocktower Capital,
          PreAngel Fund, Hashed, Danhua Capital, and dozens of other funds and
          individuals.
        </p>
        <p>
          Original Schedule: 3 month waiting period then 100% unlock
          <br />
          <br />
          Revised Schedule: 6% unlocked immediately, followed by a 4-month
          lockup, then 11.75% vesting quarterly
        </p>
        <img className="img-fluid my-4" src={UnlockSchedule} />
        <h2 className="mb-3">Why is this necessary?</h2>
        <p>
          Origin, our top investors, and our exchange partners all believe that
          having a more gradual release is to the benefit of all our investors
          and token holders. The new release schedule has been designed to
          foster long-term community growth and participation.
        </p>
        <button
          className="btn btn-secondary btn-lg mt-5"
          onClick={() => setRedirectTo('/revised_terms')}
        >
          View Agreement
        </button>
      </div>
    </>
  )
}

export default RevisedSchedule
