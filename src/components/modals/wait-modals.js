import React from 'react'
import { FormattedMessage } from 'react-intl'

import Modal from 'components/modal'

import getCurrentProvider from 'utils/getCurrentProvider'

import origin from '../../services/origin'

const currentProvider = getCurrentProvider(
  origin && origin.contractService && origin.contractService.web3
)

// TODO:John - this modal isn't used for now, but the workflow step "PROCESSING"
// exists in several workflows. We can use this modal once we are able to
// listen to the .on('transactionHash') event
export const ProcessingModal = () => (
  <Modal backdrop="static" isOpen={true}>
    <div className="image-container">
      <img src="images/spinner-animation-light.svg" role="presentation" />
    </div>
    <h3>
      <FormattedMessage
        id={'listing-detail.processingPurchase'}
        defaultMessage={'Processing your purchase'}
      />
    </h3>
    <FormattedMessage
      id={'listing-detail.pleaseStandBy'}
      defaultMessage={'Please stand by...'}
    />
  </Modal>
)

export const ProviderModal = ({ message }) => (
  <Modal backdrop="static" isOpen={true}>
    <div className="image-container">
      <img src="images/spinner-animation-light.svg" role="presentation" />
    </div>
    <h3>
      <FormattedMessage
        id={'listing-detail.confirmTransaction'}
        defaultMessage={'Confirm Transaction'}
      />
    </h3>
    {message}
    {!message && (
      <FormattedMessage
        id={'listing-detail.pressSubmitInMetaMask'}
        defaultMessage={'Please accept or confirm this transaction in {currentProvider}.'}
        values={{
          currentProvider
        }}
      />
    )}
  </Modal>
)
