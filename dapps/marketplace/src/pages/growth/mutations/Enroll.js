import React, { useEffect, useState } from 'react'
import { fbt } from 'fbt-runtime'
import { useMutation } from 'react-apollo'

import withFingerprint from 'hoc/withFingerprint'
import GrowthEnroll from 'mutations/GrowthEnroll'
import LoadingSpinner from 'components/LoadingSpinner'

const Error = props => (
  <div className="error-holder p-3 d-flex align-items-center justify-content-center flex-column">
    <div className="error-icon mb-3" />
    <div>
      <b>{props.error}</b>
    </div>
  </div>
)

/**
 * TODO: change version programatically
 * (!)important do not translate this message or the enrollment
 * on the growth server will fail
 */
const ENROLL_MESSAGE = 'I accept the terms of growth campaign version: 1.0'

const Enroll = ({ fingerprintData, onAccountBlocked, onSuccess }) => {
  const [enroll] = useMutation(GrowthEnroll)
  const [error, setError] = useState(null)

  useEffect(() => {
    enroll({
      variables: {
        agreementMessage: ENROLL_MESSAGE,
        inviteCode: localStorage.getItem('growth_invite_code'),
        fingerprintData: fingerprintData
      }
    })
      .then(({ data: { enroll } }) => {
        if (enroll.isBanned) {
          onAccountBlocked()
        } else {
          localStorage.setItem('growth_auth_token', enroll.authToken)
          onSuccess()
        }
      })
      .catch(err => {
        console.error('Error: ', err)
        setError(
          fbt(
            'Problems enrolling into growth campaign.',
            'growth.errorProblemEnrolling'
          )
        )
      })
  }, [])

  if (error) {
    return <Error error={error} />
  }

  return <LoadingSpinner />
}

export default withFingerprint(Enroll)

require('react-styl')(`
  .growth-enrollment-modal
    .error-holder
      height: 100%
      .error-icon
        height: 3.5rem
        width: 3.5rem
  .growth-enrollment
    .title
      font-weight: 300
    .info-text
      margin-bottom: 75px
    .metamask-video
      margin-top: 90px
      margin-bottom: 42px
    .error
      color: var(--red)
    .error-holder
      height: 100%
      .error-icon
        height: 3.5rem
        width: 3.5rem
`)
