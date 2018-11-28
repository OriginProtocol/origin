import React, { Fragment } from 'react'
import { FormattedMessage } from 'react-intl'

const ProfileStrength = ({ progress, strength }) => (
  <Fragment>
    <div className="d-flex justify-content-between">
      <h2>
        <FormattedMessage
          id={'_Strength.profileStrength'}
          defaultMessage={'Profile Strength'}
        />
      </h2>
      <h2 className="d-none d-md-block">{strength}%</h2>
    </div>
    <div className="progress">
      <div
        className="progress-bar"
        role="progressbar"
        style={{ width: `${progress.published}%` }}
        aria-valuenow={progress.published}
        aria-valuemin="0"
        aria-valuemax="100"
      />
      <div
        className="progress-bar provisional"
        role="progressbar"
        style={{ width: `${progress.provisional}%` }}
        aria-valuenow={progress.provisional}
        aria-valuemin="0"
        aria-valuemax="100"
      />
    </div>
  </Fragment>
)

export default ProfileStrength
