import React from 'react'

export default function withGrowthRewards(WrappedComponent) {
  const WithGrowthRewards = props => {
    const ognListingRewards = {}

    if (props.growthCampaigns && props.tokenDecimals) {
      const activeCampaign = props.growthCampaigns.find(
        campaign => campaign.status === 'Active'
      )

      if (activeCampaign) {
        const decimalDivision = web3.utils
          .toBN(10)
          .pow(web3.utils.toBN(props.tokenDecimals))

        activeCampaign.actions.forEach(action => {
          if (action.type === 'ListingIdPurchased') {
            const normalisedReward = parseInt(
              web3.utils
                .toBN(action.reward ? action.reward.amount : 0)
                .div(decimalDivision)
                .toString()
            )
            ognListingRewards[action.listingId] = normalisedReward
          }
        })
      }
    }

    return (
      <WrappedComponent
        {...props}
        ognListingRewards={ognListingRewards}
      />)
  }
  
  return WithGrowthRewards
}
