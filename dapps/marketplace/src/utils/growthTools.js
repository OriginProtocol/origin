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

  const attestationNameMap = {
    Linkedin: 'LinkedIn',
    Github: 'GitHub',
    Wechat: 'WeChat'
  }

  attestation = attestationNameMap[attestation] || attestation

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

export function calculatePendingAndAvailableActions(activeCampaign) {
  const actionCompleted = action =>
    ['Exhausted', 'Completed'].includes(action.status)
  const purchaseRewardTypes = [
    'ListingCreated',
    'ListingPurchased',
    'ListingIdPurchased',
    'ListingSold'
  ]
  const verificationRewardTypes = [
    'Email',
    'Profile',
    'Phone',
    'Twitter',
    'Airbnb',
    'Facebook',
    'Google',
    'Website',
    'Kakao',
    'WeChat',
    'GitHub',
    'LinkedIn'
  ]

  const purchaseActions = activeCampaign.actions.filter(action =>
    purchaseRewardTypes.includes(action.type)
  )
  const verificationActions = activeCampaign.actions.filter(action =>
    verificationRewardTypes.includes(action.type)
  )

  const completedPurchaseActions = purchaseActions.filter(action =>
    actionCompleted(action)
  )
  const notCompletedPurchaseActions = purchaseActions.filter(
    action => !actionCompleted(action)
  )
  const completedVerificationActions = verificationActions.filter(action =>
    actionCompleted(action)
  )
  const notCompletedVerificationActions = verificationActions.filter(
    action => !actionCompleted(action)
  )

  return {
    completedPurchaseActions,
    notCompletedPurchaseActions,
    completedVerificationActions,
    notCompletedVerificationActions
  }
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