import numberFormat from 'utils/numberFormat'

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

export function getMaxRewardPerUser({ growthCampaigns, tokenDecimals }) {
  if (!growthCampaigns) return 0

  const activeCampaign = growthCampaigns.find(
    campaign => campaign.status === 'Active'
  )

  if (!activeCampaign) {
    return 0
  }

  try {
    const rewards = activeCampaign.actions
      .map(action => action.reward)
      .reduce((r1, r2) => r1 + r2, 0)

    const decimalDivision = web3.utils
      .toBN(10)
      .pow(web3.utils.toBN(tokenDecimals))

    return parseInt(
      web3.utils
        .toBN(rewards)
        .div(decimalDivision)
        .toString()
    )
  } catch (e) {
    return 0
  }
}

export function formatTokens(tokenAmount, decimalDivision) {
  return numberFormat(
    web3.utils
      .toBN(tokenAmount)
      .div(decimalDivision)
      .toString(),
    2,
    '.',
    ',',
    true
  )
}

export function getTokensEarned({
  growthCampaigns,
  verifiedServices,
  tokenDecimals
}) {
  if (!growthCampaigns) return 0

  const activeCampaign = growthCampaigns.find(
    campaign => campaign.status === 'Active'
  )

  if (!activeCampaign) {
    return 0
  }

  try {
    const rewards = activeCampaign.actions
      .filter(action => verifiedServices.includes(action.type))
      .map(action => action.reward)
      .reduce((r1, r2) => r1 + r2, 0)

    const decimalDivision = web3.utils
      .toBN(10)
      .pow(web3.utils.toBN(tokenDecimals))

    return parseInt(
      web3.utils
        .toBN(rewards)
        .div(decimalDivision)
        .toString()
    )
  } catch (e) {
    return 0
  }
}
