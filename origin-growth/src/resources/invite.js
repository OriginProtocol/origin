const db = require('../models')
const db2 = require('origin-discovery/src/models')
const logger = require('../logger')

class GrowthInvite {
  static async getInfo(code) {
    // Lookup the code.
    const inviteCode = await db.GrowthInviteCode.findOne({ where: { code } })
    if (!inviteCode) {
      throw new Error('Invalid invite code')
    }
    const referrer = inviteCode.ethAddress

    // Load the referrer's identity.
    // TODO(franck): Once our data model and GraphQL services interfaces are
    // stable, we should consider:
    //  a. fetching identity by making a call to the identity graphql endpoint.
    //  b. putting all the identity code in a separate origin-identity package.
    const identity = await db2.Identity.findOne({
      where: { ethAddress: referrer }
    })
    if (!identity) {
      // This should never happen since before being allowed to send any
      // referral invitation, a referrer must publish their profile.
      logger.error(`Failed loading identity for referrer ${referrer}`)
      return { firstName: '', lastName: '' }
    }

    return {
      firstName: identity.firstName,
      lastName: identity.lastName
    }
  }
}

module.exports = { GrowthInvite }
