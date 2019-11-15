import { useQuery, useSubscription } from '@apollo/react-hooks'
import get from 'lodash/get'

import query from 'queries/TransactionReceipt'
import NewBlock from 'queries/NewBlockSubscription'

const INVALID_JSON_RPC = 'Invalid JSON RPC response'

const WaitForTransaction = props => {
  const { hash, event } = props
  const { data, error, refetch } = useQuery(query, {
    variables: { id: hash },
    skip: !hash || hash === 'pending'
  })

  // Auto refetch when there's a new block
  useSubscription(NewBlock, {
    onSubscriptionData: () => {
      if (hash !== 'pending') refetch()
    }
  })

  const receipt = get(data, 'web3.transactionReceipt')
  const events = get(data, 'web3.transactionReceipt.events', [])
  const currentBlock = get(data, 'web3.blockNumber')
  const confirmedBlock = get(data, 'web3.transactionReceipt.blockNumber')
  const foundEvent = events.find(e => e.event === event) || events[0]

  let content
  // Catch errors, but ignore one-off JSON-RPC errors
  if (error && (error.message && !error.message.includes(INVALID_JSON_RPC))) {
    console.error(error)
    content = 'Error'
  } else if (!receipt || !confirmedBlock) {
    content = 'Waiting...'
  } else if (receipt && confirmedBlock && receipt.status === false) {
    const msg = `Transaction reverted (tx: ${hash})`
    console.error(msg)
    content = 'Error'
  } else if (!foundEvent) {
    const msg = `Expected event not found (tx: ${hash})`
    console.error(msg)
    content = 'Error'
  } else if (currentBlock <= confirmedBlock) {
    content = 'Confirming...'
  } else {
    content = props.children({ event: foundEvent })
  }

  return content
}

export default WaitForTransaction
