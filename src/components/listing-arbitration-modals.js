import React from 'react'
import { Link } from 'react-router-dom'
import { FormattedMessage } from 'react-intl'
import Modal from 'components/modal'

export const RejectionModal = ({ isOpen }) => (
  <Modal backdrop="static" className="arbitration-modal rejection" isOpen={isOpen}>
    <div className="image-container">
      <img src="images/reject-icon.svg" role="presentation" />
    </div>
    <p className="heading">
      <FormattedMessage
        id={'listing-arbitration.rejectionHeading'}
        defaultMessage={'This offer has been rejected'}
      />
    </p>
    <span className="text">
      <FormattedMessage
        id={'listing-arbitration.rejectionText1'}
        defaultMessage={'You\'ve rejected this buyer\'s offer,'}
      />
    </span>
    <p className="text">
      <FormattedMessage
        id={'listing-arbitration.rejectionText2'}
        defaultMessage={'click below to go back to your listings.'}
      />
    </p>
    <div className="button-container">
      <Link to="/my-listings">
        <button className="btn btn-clear">
          <FormattedMessage
            id={'listing-arbitration.rejectionListings'}
            defaultMessage={'Back to your listings'}
          />
        </button>
      </Link>
    </div>
  </Modal>
)

export const ConfirmationModal = ({ isOpen }) => (
  <Modal backdrop="static" className="arbitration-modal confirm" isOpen={isOpen}>
    <p className="large-text">
      <FormattedMessage
        id={'listing-arbitration.confirmHeading'}
        defaultMessage={'Is there a problem?'}
      />
    </p>
    <div className="small-text">
      <span>
        <FormattedMessage
          id={'listing-arbitration.confirmText1'}
          defaultMessage={'Are you sure you want to report a problem?'}
        />
      </span>
      <p>
        <FormattedMessage
          id={'listing-arbitration.confirmText2'}
          defaultMessage={
            `This will start the conflict resolution process,
            someone from Origin will be notified and all chat history will be made
            public to a moderator.`
          }
        />
      </p>
    </div>
    <div className="button-container">
      <button className="btn btn-clear">
        <FormattedMessage
          id={'listing-arbitration.confirmCancel'}
          defaultMessage={'Oops, no wait...'}
        />
      </button>
      <button className="btn btn-clear">
        <FormattedMessage
          id={'listing-arbitration.confirmSubmit'}
          defaultMessage={'Yes, please'}
        />
      </button>
    </div>
  </Modal>
)

export const IssueModal = ({ isOpen }) => (
  <Modal backdrop="static" className="arbitration-modal issue" isOpen={isOpen}>
    <p className="large-text">
      <FormattedMessage
        id={'listing-arbitration.issueHeading'}
        defaultMessage={'Describe your problem below'}
      />
    </p>
    <textarea rows="3"></textarea>
    <div className="button-container align-self-center">
      <button className="btn btn-clear">
        <FormattedMessage
          id={'listing-arbitration.issueCancel'}
          defaultMessage={'Cancel'}
        />
      </button>
      <button className="btn btn-clear">
        <FormattedMessage
          id={'listing-arbitration.issueSubmit'}
          defaultMessage={'Submit'}
        />
      </button>
    </div>
  </Modal>
)
