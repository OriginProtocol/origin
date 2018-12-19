import React from 'react'
import { FormattedMessage } from 'react-intl'

import Modal from 'components/modal'

export const ListingDraftModal = ({ isOpen, onContinue, onAddNew }) => {
  return(
    <Modal backdrop="static" isOpen={isOpen}>
      <div className="image-container">
        <img
          src="images/circular-check-button.svg"
          role="presentation"
        />
      </div>
      <h3>
        <FormattedMessage
          id={'nav-listing-create.title'}
          defaultMessage={'You have unfinished listing'}
        />
      </h3>
      <div className="disclaimer">
        <p>
          <FormattedMessage
            id={'nav-listing-create.descript'}
            defaultMessage={
              'Are you going to continue or create a new one?'
            }
          />
        </p>
      </div>
      <div className="button-container">
        <button
          className="btn btn-clear"
          onClick={onContinue}
        >
          <FormattedMessage
            id={'nav-listing-create.recover'}
            defaultMessage={'Continue'}
          />
        </button>
        <button
          onClick={onAddNew}
          className="btn btn-clear"
        >
          <FormattedMessage
            id={'nav-listing-create.addNew'}
            defaultMessage={'Create a new'}
          />
        </button>
      </div>
    </Modal>
  )
}