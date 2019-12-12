import React, { useState } from 'react'

import Redirect from 'components/Redirect'
import UserProfileCreated from 'components/_UserProfileCreated'

import withEnrolmentStatus from 'hoc/withEnrolmentStatus'
import withActiveGrowthCampaign from 'hoc/withActiveGrowthCampaign'
import withPartnerCampaignConfig from 'hoc/withPartnerCampaignConfig'

import { formatTokens, getReferralReward } from 'utils/growthTools'

const Finished = ({
  linkPrefix,
  redirectto,
  activeGrowthCampaign,
  growthEnrollmentStatus,
  partnerCampaignConfig
}) => {
  const continueTo = redirectto ? redirectto : `${linkPrefix}/onboard/back`

  const [finished, setFinished] = useState(false)

  if (finished) {
    return <Redirect to={continueTo} />
  }

  const enrolled = growthEnrollmentStatus === 'Enrolled'
  const reward = getReferralReward(activeGrowthCampaign, partnerCampaignConfig)

  const formattedReward = !reward ? null : `${formatTokens(reward)} OGN`

  return (
    <div className="finished">
      <UserProfileCreated
        onCompleted={() => {
          setFinished(true)
        }}
        referralReward={enrolled ? formattedReward : null}
      />
    </div>
  )
}

export default withEnrolmentStatus(
  withActiveGrowthCampaign(withPartnerCampaignConfig(Finished))
)

require('react-styl')(`
  .onboard .finished
    max-width: 475px
    margin: 0 auto
`)
