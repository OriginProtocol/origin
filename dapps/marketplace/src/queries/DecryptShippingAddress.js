import gql from 'graphql-tag'

const DecryptShippingAddress = gql`
  query DecryptShippingAddress($encrypted: String!) {
    messaging(id: "defaultAccount") {
      decryptShippingAddress(encrypted: $encrypted) {
        name
        address1
        address2
        city
        stateProvinceRegion
        postalCode
        country
        other
      }
    }
  }
`
export default DecryptShippingAddress
