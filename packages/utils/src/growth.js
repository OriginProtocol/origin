const {
  GrowthReferral,
  GrowthInviteCode
} = require('@origin/growth-event/src/models')

async function _getReferrer(code) {
  // Lookup the code.
  const inviteCode = await GrowthInviteCode.findOne({ where: { code } })
  if (!inviteCode) {
    throw new Error(`Invalid invite code ${code}`)
  }
  return inviteCode.ethAddress
}

async function makeReferralConnection(code, walletAddress) {
  const referralLink = await GrowthReferral.findOne({
    where: {
      refereeEthAddress: walletAddress.toLowerCase()
    }
  })
  const referrer = await _getReferrer(code)

  if (referrer === walletAddress.toLowerCase()) {
  	throw new Error(`Referrer ${referrer} can't use own referral code`)
  }

  if (
    referralLink &&
    referralLink.referrerEthAddress.toLowerCase() !== referrer.toLowerCase()
  ) {
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
  	throw new Error(`Referee ${walletAddress} already referred by ${referralLink.referrerEthAddress}`)
  }

  await GrowthReferral.create({
    referrerEthAddress: referrer,
    refereeEthAddress: walletAddress.toLowerCase()
  })

  return {
  	referrer
  }
}

module.exports = {
  makeReferralConnection
}