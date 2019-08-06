const crypto = require('crypto')

const { SocialShareRule } = require('./socialShareRule')

/**
 * A rule that rewards for sharing content on social networks and verifies the content
 */
class VerifiableSocialShareRule extends SocialShareRule {
  constructor(crules, levelId, config) {
    super(crules, levelId, config)
    // Compute the hashes for the post content, in all the configured languages.
    this.contentHashes = [this._hashContent(this.content.post.text.default)]
    for (const translation of this.content.post.text.translations) {
      this.contentHashes.push(this._hashContent(translation.text))
    }
  }

  /**
   * Hashes content for verification of the user's post.
   *
   * Important: Make sure to keep this hash function in sync with
   * the one used in the bridge server.
   * See infra/bridge/src/promotions.js
   *
   * @param text
   * @returns {string} Hash of the text, hexadecimal encoded.
   * @private
   */
  _hashContent(text) {
    return crypto
      .createHash('md5')
      .update(text)
      .digest('hex')
  }
  /**
   * Returns true if the event's content hash (stored in customId) belongs to the
   * set of hashes configured in the rule.
   * @param {string} customId: hashed content of the post.
   * @returns {boolean}
   */
  customIdFilter(customId) {
    return this.contentHashes.includes(customId)
  }
}

module.exports = { VerifiableSocialShareRule }
