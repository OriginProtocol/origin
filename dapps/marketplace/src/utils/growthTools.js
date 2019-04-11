import get from 'lodash/get'

export function getAttestationReward({ growthCampaigns, attestation }) {
  const activeCampaign = growthCampaigns.find(
    campaign => campaign.status === 'Active'
  )

  const reward = activeCampaign.actions
    .filter(action => action.type === attestation)
    .map(action => action.reward)[0]

  const tokensEarned = web3.utils
    .toBN(reward ? reward.amount : 0)
    .div(decimalDivision)
}
