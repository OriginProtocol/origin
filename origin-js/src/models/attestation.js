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
   * @param {string|Object} data - Contains the whole body of the response received
   *   from the attestation server. The most interesting field is named 'data'
   *   and its content differs:
   *    - Identity V0: a simple text (Ex: 'email verified')
   *                  or an IPFS hash (for twitter and airbnb only).
   *    - Identity V1: an object conforming to attestation's JSON schema.
   * @param {string} signature: Issuer's signature of the data.
   *   Note that for Identity V1 this is a duplicate of data.signature
   */
  constructor({ topic, data, signature }) {
    topic = Number(topic)
    this.topic = topic
    this.service = topicMapping[topic]
    this.data = data
    this.signature = signature
  }
}
