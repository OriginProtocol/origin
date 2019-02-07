import validator from 'origin-validator'

export default function validate(data) {
  validator('https://schema.originprotocol.com/identity_1.0.0.json', data)

  validator(
    'https://schema.originprotocol.com/profile_2.0.0.json',
    data.profile
  )

  data.attestations.forEach(attestation => {
    validator(
      'https://schema.originprotocol.com/attestation_1.0.0.json',
      attestation
    )
  })
}
