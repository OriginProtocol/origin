import React from 'react'
import { FormattedMessage } from 'react-intl'

import Modal from 'components/modal'

export const ListingDraftModal = ({ isOpen, handleContinue, handleRemove }) => {
  return(
    <Modal backdrop="static" isOpen={isOpen}>
      <div className="image-container">
        <img src="images/flat_cross_icon.svg" role="presentation" />
      </div>
      <h3>
        <FormattedMessage
          id={'draft-listing.title'}
          defaultMessage={'Listing In Progress'}
        />
      </h3>
      <div className="disclaimer">
        <p>
          <FormattedMessage
            id={'draft-listing.explanation'}
            defaultMessage={
              'You have an incomplete listing that has not yet been created. Would you like to remove it and start a new one or continue with your existing draft?'
            }
          />
        </p>
      </div>
      <div className="button-container">
        <button
          className="btn btn-clear"
          onClick={handleRemove}
        >
          <FormattedMessage
            id={'draft-listing.remove'}
            defaultMessage={'Remove'}
          />
        </button>
        <button
          onClick={handleContinue}
          className="btn btn-clear"
        >
          <FormattedMessage
            id={'draft-listing.continue'}
            defaultMessage={'Continue'}
          />
        </button>
      </div>
    </Modal>
  )
}