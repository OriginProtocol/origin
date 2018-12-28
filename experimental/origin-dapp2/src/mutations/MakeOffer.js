import gql from 'graphql-tag'

export default gql`
  mutation MakeOffer($listingID: String!, $value: String!, $from: String!) {
    makeOffer(listingID: $listingID, value: $value, from: $from) {
      id
    }
  }
`
