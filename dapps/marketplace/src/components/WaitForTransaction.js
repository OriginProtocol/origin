import React from 'react'
import { useQuery, useSubscription } from '@apollo/react-hooks'
import get from 'lodash/get'
import { fbt } from 'fbt-runtime'

import Modal from 'components/Modal'
import MetaMaskAnimation from 'components/MetaMaskAnimation'
import query from 'queries/TransactionReceipt'
import NewBlock from 'queries/NewBlockSubscription'
import withWallet from 'hoc/withWallet'
import withConfig from 'hoc/withConfig'
import Sentry from 'utils/sentry'

const INVALID_JSON_RPC = 'Invalid JSON RPC response'

const WaitForFirstBlock = () => (
  <div className="make-offer-modal">
    <div className="spinner light" />
    <div>
      <b>
        <fbt desc="WaitForTransaction.writingToBlockchain">
          Writing to the blockchain.
        </fbt>
        <br />
        <fbt desc="WaitForTransaction.mayTakeSomeTime">
          This might take a minute.
        </fbt>
      </b>
    </div>
  </div>
)

const WaitForConfirmation = () => (
  <div className="make-offer-modal">
    <div className="spinner light" />
    <div>
      <b>
        <fbt desc="WaitForTransaction.waitingForConfirmation">
          Waiting for confirmation.
        </fbt>
        <br />
        <fbt desc="WaitForTransaction.mayTakeSomeTime">
          This might take a minute.
        </fbt>
      </b>
    </div>
  </div>
)

const Error = () => (
  <div className="make-offer-modal">
    <div className="error-icon" />
    <div>
      <b>
        <fbt desc="WaitForTransaction.errorSeeConsole">Error - see console</fbt>
      </b>
    </div>
  </div>
)

const Confirm = () => (
  <>
    <div className="spinner light" />
    <div>
      <b>
        <fbt desc="WaitForTransaction.confirm">Confirm Transaction</fbt>
      </b>
    </div>
  </>
)

const Pending = ({ walletType, config, contentOnly, shouldClose, onClose }) => {
  const provider = walletType === 'Mobile' ? 'mobile wallet' : walletType
  const metaTxEnabled = get(config, 'relayerEnabled') === true

  const content = (
    <div className="make-offer-modal">
      {provider === 'MetaMask' ? <MetaMaskAnimation /> : <Confirm />}
      <div>
        {metaTxEnabled && walletType === 'Mobile' ? (
          <fbt desc="WaitForTransaction.confirmInProvider.metaTx">
            Waiting for confirmation...
          </fbt>
        ) : (
          <fbt desc="WaitForTransaction.confirmInProvider">
            {'Please confirm this transaction in '}
            <fbt:param name="provider">{provider}</fbt:param>
          </fbt>
        )}
      </div>
    </div>
  )

  if (contentOnly) {
    return content
  }
  return (
    <Modal shouldClose={shouldClose} onClose={onClose} disableDismiss={true}>
      {content}
    </Modal>
  )
}

const WaitForTransaction = props => {
  const { hash, contentOnly, onClose, event, shouldClose } = props
  const { data, client, error, refetch } = useQuery(query, {
    variables: { id: hash },
    skip: !hash || hash === 'pending'
  })

  // Auto refetch when there's a new block
  useSubscription(NewBlock, {
    onSubscriptionData: () => {
      if (hash !== 'pending') refetch()
    }
  })

  if (hash === 'pending') {
    return <Pending {...props} />
  }

  const receipt = get(data, 'web3.transactionReceipt')
  const events = get(data, 'web3.transactionReceipt.events', [])
  const currentBlock = get(data, 'web3.blockNumber')
  const confirmedBlock = get(data, 'web3.transactionReceipt.blockNumber')
  const foundEvent = events.find(e => e.event === event) || events[0]

  let content
  // Catch errors, but ignore one-off JSON-RPC errors
  if (error && (error.message && !error.message.includes(INVALID_JSON_RPC))) {
    console.error(error)
    Sentry.captureException(error)
    content = <Error />
  } else if (!receipt || !confirmedBlock) {
    content = <WaitForFirstBlock />
  } else if (receipt && confirmedBlock && receipt.status === 0) {
    const msg = `Transaction reverted (tx: ${hash})`
    console.error(msg)
    Sentry.captureException(new Error(msg))
    content = <Error />
  } else if (!foundEvent) {
    const msg = `Expected event not found (tx: ${hash})`
    console.error(msg)
    Sentry.captureException(new Error(msg))
    content = <Error />
  } else if (currentBlock <= confirmedBlock) {
    content = <WaitForConfirmation />
  } else {
    content = props.children({ event: foundEvent, client })
  }

  if (contentOnly) {
    return content
  }

  return (
    <Modal
      shouldClose={onClose ? shouldClose : false}
      onClose={onClose}
      disableDismiss={true}
      children={content}
    />
  )
}

export default withConfig(withWallet(WaitForTransaction))
