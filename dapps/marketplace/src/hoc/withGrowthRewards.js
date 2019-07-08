import React from 'react'
import withGrowthCampaign from 'hoc/withGrowthCampaign'

export default function withGrowthRewards(WrappedComponent) {
  const WithGrowthRewards = props => {
    const ognListingRewards = {}

    const tokenDecimals = props.tokenDecimals || 18
    if (props.growthCampaigns) {
      const activeCampaign = props.growthCampaigns.find(
        campaign => campaign.status === 'Active'
      )

      if (activeCampaign) {
        const decimalDivision = web3.utils
          .toBN(10)
          .pow(web3.utils.toBN(tokenDecimals))

        activeCampaign.actions.forEach(action => {
          if (action.type === 'ListingIdPurchased') {
            let normalisedReward = 0
            try {
              normalisedReward = parseInt(
                web3.utils
                  .toBN(action.reward ? action.reward.amount : 0)
                  .div(decimalDivision)
                  .toString()
              )
            } catch (e) {
              /* Ignore */
            }
            ognListingRewards[action.listingId] = normalisedReward
          }
        })
      }
    }

    return <WrappedComponent {...props} ognListingRewards={ognListingRewards} />
  }

  return withGrowthCampaign(WithGrowthRewards, { queryEvenIfNotEnrolled: true })
}
