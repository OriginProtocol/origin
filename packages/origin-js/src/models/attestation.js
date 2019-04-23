const topicMapping = {
  3: 'facebook',
  4: 'twitter',
  5: 'airbnb',
  10: 'phone',
  11: 'email'
}

export default class Attestation {
  /**
   * Attestation model object.
   * @param {number} topic - Primarily to be used as a UI helper to facilitate
   *   showing what type of attestation the data represents.
   * @param {string} schemaId
   *     - Identity V0: undefined
   *     - Identity V1: JSON schema Id for the attestation data.
   * @param {string|Object} data
   *    - Identity V0: a simple text (Ex: 'email verified')
   *                  or an IPFS hash (for twitter and airbnb only).
   *    - Identity V1: The data field from the attestation.
   * @param {string} signature: Issuer's signature of the data.
   *    - Identity V0: signature string, hexadecimal encoded.
   *    - Identity V1: {version: string, bytes: string}
   */
  constructor({ topic, schemaId, data, signature }) {
    topic = Number(topic)
    this.topic = topic
    this.service = topicMapping[topic]
    this.schemaId = schemaId
    this.data = data
    this.signature = signature
  }

  /**
   * Computes topic compatible with Attestation model.
   * @param {Object} attestation - Attestation data from the user's identity stored in IPFS.
   * @private
   */
  static _getTopic(attestation) {
    if (attestation.data.attestation.site) {
      const siteName = attestation.data.attestation.site.siteName
      if (siteName === 'facebook.com') {
        return 3
      } else if (siteName === 'twitter.com') {
        return 4
      } else if (siteName === 'airbnb.com') {
        return 5
      } else if (siteName === 'google.com') {
        return 6
      } else {
        throw new Error(`Unexpected siteName for attestation ${attestation}`)
      }
    } else if (attestation.data.attestation.phone) {
      return 10
    } else if (attestation.data.attestation.email) {
      return 11
    } else {
      throw new Error(`Failed extracting topic from attestation ${attestation}`)
    }
  }

  /**
   * Creates an Attestation model object based on data
   * stored in IPFS or returned by an attestation server.
   * @param {Object} attestation
   * @return {Attestation}
   * @throws {Error}
   */
  static create(attestation) {
    const topic = Attestation._getTopic(attestation)
    return new Attestation({
      topic,
      schemaId: attestation.schemaId,
      data: attestation.data,
      signature: attestation.signature
    })
  }

}
