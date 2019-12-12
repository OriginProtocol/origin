import get from 'lodash/get'
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
  const _div = decimalDivision || web3.utils.toBN(10).pow(web3.utils.toBN(18))

  return numberFormat(
    web3.utils
      .toBN(tokenAmount)
      .div(_div)
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
    'Kakao',
    'WeChat',
    'GitHub',
    'LinkedIn',
    'Telegram',
    'Website'
  ]

  const promotionRewardTypes = ['TwitterShare', 'FacebookShare']

  const followRewardTypes = ['TwitterFollow', 'FacebookLike', 'TelegramFollow']

  const purchaseActions = activeCampaign.actions.filter(action =>
    purchaseRewardTypes.includes(action.type)
  )
  const verificationActions = activeCampaign.actions.filter(action =>
    verificationRewardTypes.includes(action.type)
  )
  const promotionActions = activeCampaign.actions.filter(action =>
    promotionRewardTypes.includes(action.type)
  )
  const followActions = activeCampaign.actions.filter(action =>
    followRewardTypes.includes(action.type)
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
  const completedPromotionActions = promotionActions.filter(action =>
    actionCompleted(action)
  )
  const notCompletedPromotionActions = promotionActions.filter(
    action => !actionCompleted(action)
  )
  const completedFollowActions = followActions.filter(action =>
    actionCompleted(action)
  )
  const notCompletedFollowActions = followActions.filter(
    action => !actionCompleted(action)
  )

  return {
    completedPurchaseActions,
    notCompletedPurchaseActions,
    completedVerificationActions,
    notCompletedVerificationActions,
    completedPromotionActions,
    notCompletedPromotionActions,
    completedFollowActions,
    notCompletedFollowActions
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

export function getContentToShare(action, locale) {
  const translation = action.content.post.tweet.translations.find(
    content => content.locale === locale
  )

  return translation ? translation.text : action.content.post.tweet.default
}

export function setReferralCode(code) {
  if (!code) {
    delete localStorage.partner_referral_code
    return
  }

  if (localStorage.partner_referral_code === code) {
    return
  }

  localStorage.partner_referral_code = code
}

export function hasReferralCode() {
  return !!localStorage.partner_referral_code
}

export function getReferralReward(campaignConfig) {
  const referralCode = localStorage.partner_referral_code

  if (!referralCode) {
    return null
  }

  const codeParts = referralCode.split(':')

  // Invalid code
  if (codeParts.length < 2) {
    return null
  }

  // if there's no campaign action, nor config for the referral code, there's
  // no point in continuing
  if (
    !campaignConfig ||
    !Object.prototype.hasOwnProperty.call(campaignConfig, codeParts[1]) ||
    campaignConfig[codeParts[1]].reward.currency !== 'ogn'
  ) {
    return null
  }

  const reward = campaignConfig[codeParts[1]].reward.value

  if (!reward) {
    return null
  }

  return reward
}
