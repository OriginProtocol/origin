const logger = require('./logger')

class IdentityEventHandler {
  async _getUserDetails(log, origin) {
    const account = log.decoded.account
    const user = await origin.users.get(account)
    return user
  }

  // TODO(franck): implement.
  async _indexUser(user) {
    return
  }

  // If profile is populated, record a ProfilePublished event in the growth_event table.
  async _recordGrowthProfileEvent(user) {
    // Check profile is populated.
    const profile = user.profile
    const validProfile = (profile.firstName.length > 0 || profile.lastName.length > 0) &&
      (profile.avatar.length > 0)
    if (!validProfile) {
      return
    }

    // Check there wasn't already a ProfilePublished event recorded.

    // Record event.
  }

  async _recordGrowthAttestationEvents(user) {
    const topicToEventType = {
      //'facebook': GrowthEventTypes.FacebookAttestationPublished,
      //'airbnb': GrowthEventTypes.AirbnbAttestationPublished,
      //'twitter': GrowthEventTypes.TwitterAttestationPublished,
      //'phone': GrowthEventTypes.PhoneAttestationPublished
    }
    user.attestations.forEach(attestation => {
      const eventType = topicToEventType[attestation.topic]
      if (!eventType) {
        return
      }

      // Check there wasn't already an event of same type already recorded.

      // Record event.

    })
  }

  async process(log, context) {
    logger.debug('Processing Identity event')
    const user = await this._getUserDetails(log, context.origin)
    if (!user) {
      return
    }
    logger.debug('User: ', user)
    await this._indexUser(user)
    await this._recordGrowthProfileEvent(user)
    await this._recordGrowthAttestationEvents(user)

    return { user }
  }

  // Do not call webhook for identity events.
  webhookEnabled() {
    return false
  }

  // Do not call discord webhook for identity events.
  discordWebhookEnabled() {
    return false
  }
}

module.exports = IdentityEventHandler