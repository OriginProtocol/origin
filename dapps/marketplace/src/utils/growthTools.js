export function getAttestationReward({
  growthCampaigns,
  attestation,
  tokenDecimals
}) {
  if (!growthCampaigns) return 0

  const activeCampaign = growthCampaigns.find(
    campaign => campaign.status === 'Active'
  )
  if (!activeCampaign) {
    return ''
  }

  try {
    const reward = activeCampaign.actions
      .filter(action => action.type === attestation)
      .map(action => action.reward)[0]

    const decimalDivision = web3.utils
      .toBN(10)
      .pow(web3.utils.toBN(tokenDecimals))

    return parseInt(
      web3.utils
        .toBN(reward ? reward.amount : 0)
        .div(decimalDivision)
        .toString()
    )
  } catch (e) {
    return ''
  }
}

export function getGrowthListingsRewards({ growthCampaigns, tokenDecimals }) {
  const ognListingRewards = {}

  if (growthCampaigns && tokenDecimals) {
    const activeCampaign = growthCampaigns.find(
      campaign => campaign.status === 'Active'
    )

    if (!activeCampaign) return ognListingRewards

    const decimalDivision = web3.utils
      .toBN(10)
      .pow(web3.utils.toBN(tokenDecimals))

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

  return ognListingRewards
}
