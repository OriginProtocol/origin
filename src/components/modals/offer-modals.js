import React from 'react'
import { Link } from 'react-router-dom'
import { FormattedMessage } from 'react-intl'

import Modal from 'components/modal'

export const WithdrawModal = ({
  isOpen = false,
  inferred = false,
  onCancel,
  onSubmit
}) => (
  <Modal
    className="offer-modal withdraw"
    isOpen={isOpen}
    handleToggle={onCancel}
  >
    <p className="heading">
      <FormattedMessage
        id={'offerModals.withdrawHeading'}
        defaultMessage={'Withdraw Offer'}
      />
    </p>
    <div className="text">
      <span>
        <FormattedMessage
          id={'offerModals.withdrawText'}
          defaultMessage={'Are you sure you want to withdraw your offer? Your escrowed payment wil be returned to your wallet.'}
        />
      </span>
    </div>
    <div className="d-flex button-container">
      <button className="btn btn-clear" onClick={onCancel}>
        <FormattedMessage
          id={'offerModals.withdrawCancel'}
          defaultMessage={'Cancel'}
        />
      </button>
      <button className="btn btn-clear" onClick={onSubmit}>
        <FormattedMessage
          id={'offerModals.withdrawSubmit'}
          defaultMessage={'Withdraw'}
        />
      </button>
    </div>
  </Modal>
)

export const RejectionModal = ({ isOpen = false, handleToggle }) => (
  <Modal
    className="arbitration-modal rejection"
    isOpen={isOpen}
    handleToggle={handleToggle}
  >
    <div className="image-container">
      <img src="images/reject-icon.svg" role="presentation" />
    </div>
    <p className="heading">
      <FormattedMessage
        id={'arbitrationModals.rejectionHeading'}
        defaultMessage={'This offer has been rejected'}
      />
    </p>
    <span className="text">
      <FormattedMessage
        id={'arbitrationModals.rejectionText1'}
        defaultMessage={"You've rejected this buyer's offer,"}
      />
    </span>
    <p className="text">
      <FormattedMessage
        id={'arbitrationModals.rejectionText2'}
        defaultMessage={'click below to go back to your listings.'}
      />
    </p>
    <div className="button-container">
      <Link to="/my-listings">
        <button className="btn btn-clear">
          <FormattedMessage
            id={'arbitrationModals.rejectionListings'}
            defaultMessage={'Back to your listings'}
          />
        </button>
      </Link>
    </div>
  </Modal>
)
