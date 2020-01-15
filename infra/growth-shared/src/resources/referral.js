const {
  GrowthReferral,
  GrowthInviteCode
} = require('@origin/growth-shared/src/models')

async function _getReferrer(code) {
  // Lookup the code.
  const inviteCode = await GrowthInviteCode.findOne({ where: { code } })
  if (!inviteCode) {
    throw new Error(`Invalid invite code ${code}`)
  }
  return inviteCode.ethAddress
}

async function makeReferralConnection(code, walletAddress) {
  walletAddress = walletAddress.toLowerCase()
  const referralLink = await GrowthReferral.findOne({
    where: {
      refereeEthAddress: walletAddress
    }
  })
  const referrer = await _getReferrer(code)

  if (referrer === walletAddress) {
    throw new Error(`Referrer ${referrer} can't use own referral code`)
  }

  const returnObj = {
    referrer
  }

  if (referralLink) {
    if (referralLink.referrerEthAddress !== referrer) {
      /* The referrer associated with the invite code does not match previously stored referrer.
       * A corner case scenario this might happen is as follow:
       *  - referee receives multiple invites.
       *  - referee clicks on an invite and enrolls into growth campaing
       *  - referee clicks on another invite link and enrolls again into
       *  growth campaign.
       *
       * When this happens we ignore the subsequent invites and attribute all
       * referees actions to the initial referrer.
       *
       */
      throw new Error(
        `Referee ${walletAddress} already referred by ${referralLink.referrerEthAddress}`
      )
    } else {
      // the referrer -> referee link already created
      return returnObj
    }
  }

  await GrowthReferral.create({
    referrerEthAddress: referrer,
    refereeEthAddress: walletAddress
  })

  return returnObj
}

module.exports = {
  makeReferralConnection
}
