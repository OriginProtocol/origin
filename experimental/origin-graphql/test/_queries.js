import gql from 'graphql-tag'

const GetNodeAccounts = gql`
  {
    web3 {
      nodeAccounts {
        id
      }
    }
  }
`

const GetReceipt = gql`
  query TransactionReceipt($id: String!) {
    web3 {
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

export default {
  GetNodeAccounts,
  GetReceipt
}
