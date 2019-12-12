import React, { useState } from 'react'

import Redirect from 'components/Redirect'
import UserProfileCreated from 'components/_UserProfileCreated'
import LoadingSpinner from 'components/LoadingSpinner'

import withEnrolmentStatus from 'hoc/withEnrolmentStatus'
import withPartnerCampaignConfig from 'hoc/withPartnerCampaignConfig'

import { getReferralReward } from 'utils/growthTools'

const Finished = ({
  linkPrefix,
  redirectto,
  growthEnrollmentStatus,
  growthEnrollmentStatusLoading,
  partnerCampaignConfig,
  partnerCampaignLoading
}) => {
  const continueTo = redirectto ? redirectto : `${linkPrefix}/onboard/back`

  const [finished, setFinished] = useState(false)

  if (partnerCampaignLoading || growthEnrollmentStatusLoading) {
    return <LoadingSpinner />
  }

  if (finished) {
    return <Redirect to={continueTo} />
  }

  const enrolled = growthEnrollmentStatus === 'Enrolled'
  const reward = getReferralReward(partnerCampaignConfig)

  const formattedReward = !reward ? null : `${reward} OGN`

  return (
    <div className="finished">
      <UserProfileCreated
        onCompleted={() => {
          setFinished(true)
        }}
        enrolled={enrolled}
        referralReward={enrolled ? formattedReward : null}
      />
    </div>
  )
}

export default withEnrolmentStatus(withPartnerCampaignConfig(Finished))

require('react-styl')(`
  .onboard .finished
    max-width: 475px
    margin: 0 auto
`)
