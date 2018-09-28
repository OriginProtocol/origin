import React from 'react'
import { FormattedMessage } from 'react-intl'
import Modal from 'components/modal'
import origin from '../../services/origin'
import getCurrentProvider from 'utils/getCurrentProvider'

const currentProvider = getCurrentProvider(
  origin && origin.contractService && origin.contractService.web3
)

export const MetamaskModal = () => (
  <Modal backdrop="static" isOpen={true}>
    <div className="image-container">
      <img src="images/spinner-animation-light.svg" role="presentation" />
    </div>
    <FormattedMessage
      id={'listing-detail.confirmTransaction'}
      defaultMessage={'Confirm transaction'}
    />
    <br />
    <FormattedMessage
      id={'listing-detail.pressSubmitInMetaMask'}
      defaultMessage={'Press "Confirm" in {currentProvider} window'}
      values={{
        currentProvider
      }}
    />
  </Modal>
)

// TODO:John - this modal isn't used for now, but the workflow step "PROCESSING"
// exists in several workflows. We can use this modal once we are able to
// listen to the .on('transactionHash') event
export const ProcessingModal = () => (
  <Modal backdrop="static" isOpen={true}>
    <div className="image-container">
      <img src="images/spinner-animation-light.svg" role="presentation" />
    </div>
    <FormattedMessage
      id={'listing-detail.processingPurchase'}
      defaultMessage={'Processing your purchase'}
    />
    <br />
    <FormattedMessage
      id={'listing-detail.pleaseStandBy'}
      defaultMessage={'Please stand by...'}
    />
  </Modal>
)
