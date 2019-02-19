import gql from 'graphql-tag'

export default gql`
  query TransactionReceipt($id: String!) {
    web3 {
      blockNumber
      transactionReceipt(id: $id) {
        id
        blockNumber
        events {
          id
          event
          returnValues {
            listingID
            offerID
            party
            ipfsHash
          }
          returnValuesArr {
            field
            value
          }
        }
      }
    }
  }
`
