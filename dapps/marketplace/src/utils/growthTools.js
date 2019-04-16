export function getAttestationReward({
  growthCampaigns,
  attestation,
  tokenDecimals
}) {
  if (!growthCampaigns) return 0

  const activeCampaign = growthCampaigns.find(
    campaign => campaign.status === 'Active'
  )

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
}
