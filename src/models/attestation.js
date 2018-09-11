const claimTypeMapping = {
  3: 'facebook',
  4: 'twitter',
  5: 'airbnb',
  10: 'phone',
  11: 'email'
}

export default class Attestation {
  constructor({ claimType, data, signature }) {
    claimType = Number(claimType)
    this.claimType = claimType
    this.service = claimTypeMapping[claimType]
    this.data = data
    this.signature = signature
  }
}
