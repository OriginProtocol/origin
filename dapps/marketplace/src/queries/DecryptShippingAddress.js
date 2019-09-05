import gql from 'graphql-tag'

const DecryptShippingAddress = gql`
  query DecryptShippingAddress($encrypted: String!) {
    messaging(id: "defaultAccount") {
      DecryptShippingAddress(encrypted: $encrypted) {
        name
        address1
        address2
        city
        stateProvinceRegion
        postalCode
        country
      }
    }
  }
`
export default DecryptShippingAddress
