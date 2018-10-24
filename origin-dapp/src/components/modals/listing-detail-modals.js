import React from 'react'
import Modal from 'components/modal'
import { Link } from 'react-router-dom'
import {
  FormattedMessage
} from 'react-intl'

export const OnboardingModal = ({ isOpen, onVerify, handleSkipOnboarding }) => {
  return(
    <Modal backdrop="static" isOpen={ isOpen }>
      <div className="image-container">
        <img src="images/identity.svg" role="presentation" />
      </div>
      <p>
        <FormattedMessage
          id={'listing-detail.firstPurchaseHeading'}
          defaultMessage={`You're about to make your first purchase on Origin.`}
        />
      </p>
      <div className="disclaimer">
        <p>
          <FormattedMessage
            id={'listing-detail.identityDisclaimer'}
            defaultMessage={
              'We recommend verifying your identity first. Sellers are more likely to accept your purchase offer if they know a little bit about you.'
            }
          />
        </p>
      </div>
      <div className="button-container">
        <Link
          to="/profile"
          target="_blank"
          rel="noopener noreferrer"
          className="btn btn-clear"
          onClick={onVerify}
          ga-category="buyer_onboarding_modal"
          ga-label="verify_identity"
        >
          <FormattedMessage
            id={'listing-detail.verifyIdentity'}
            defaultMessage={'Verify Identity'}
          />
        </Link>
      </div>
      <a
        href="#"
        className="skip-identity"
        onClick={handleSkipOnboarding}
        ga-category="buyer_onboarding_modal"
        ga-label="skip"
      >
        Skip
      </a>
    </Modal>
  )
}

export const ErrorModal = ({ isOpen, onClick }) => {
  return(
    <Modal backdrop="static" isOpen={ isOpen }>
      <div className="image-container">
        <img src="images/flat_cross_icon.svg" role="presentation" />
      </div>
      <FormattedMessage
        id={'listing-detail.errorPurchasingListing'}
        defaultMessage={'There was a problem purchasing this listing.'}
      />
      <br />
      <FormattedMessage
        id={'listing-detail.seeConsoleForDetails'}
        defaultMessage={'See the console for more details.'}
      />
      <div className="button-container">
        <a
          className="btn btn-clear"
          onClick={onClick}
        >
          <FormattedMessage
            id={'listing-detail.OK'}
            defaultMessage={'OK'}
          />
        </a>
      </div>
    </Modal>
  )
}

export const PurchasedModal = ({ isOpen }) => {
  return(
    <Modal backdrop="static" isOpen={ isOpen }>
      <div className="image-container">
        <img src="images/circular-check-button.svg" role="presentation" />
      </div>
      <div className="disclaimer">
        <FormattedMessage
          id={'listing-detail.successDisclaimer'}
          defaultMessage={
            "You have made an offer on this listing. Your offer will be visible within a few seconds. Your {ETH} payment has been transferred to an escrow contract. Here's what happens next:"
          }
        />
        <ul>
          <li>
            <FormattedMessage
              id={'listing-detail.successItem1'}
              defaultMessage={
                'The seller can choose to accept or reject your offer.'
              }
            />
          </li>
          <li>
            <FormattedMessage
              id={'listing-detail.successItem2'}
              defaultMessage={
                'If the offer is accepted and fulfilled, you will be able to confirm that the sale is complete. Your escrowed payment will be sent to the seller.'
              }
            />
          </li>
          <li>
            <FormattedMessage
              id={'listing-detail.successItem3'}
              defaultMessage={
                'If the offer is rejected, the escrowed payment will be immediately returned to your wallet.'
              }
            />
          </li>
        </ul>
      </div>
      <div className="button-container">
        <Link
          to="/my-purchases"
          className="btn btn-clear"
          ga-category="listing"
          ga-label="purchase_confirmation_modal_view_my_purchases"
        >
          <FormattedMessage
            id={'listing-detail.viewPurchases'}
            defaultMessage={'View Purchases'}
          />
        </Link>
      </div>
    </Modal>
  )
}
