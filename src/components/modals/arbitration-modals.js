import React from 'react'
import { Link } from 'react-router-dom'
import { FormattedMessage } from 'react-intl'
import Modal from 'components/modal'

export const ConfirmationModal = ({ isOpen = false, onCancel, onSubmit }) => (
  <Modal
    className="arbitration-modal confirm"
    isOpen={isOpen}
    handleToggle={onCancel}
  >
    <p className="heading">
      <FormattedMessage
        id={'arbitrationModals.confirmHeading'}
        defaultMessage={'Is there a problem?'}
      />
    </p>
    <div className="text">
      <span>
        <FormattedMessage
          id={'arbitrationModals.confirmText1'}
          defaultMessage={'Are you sure you want to report a problem?'}
        />
      </span>
      <p>
        <FormattedMessage
          id={'arbitrationModals.confirmText2'}
          defaultMessage={`This will start the conflict resolution process,
            someone from Origin will be notified and all chat history will be made
            public to a moderator.`}
        />
      </p>
    </div>
    <div className="button-container">
      <button className="btn btn-clear" onClick={onCancel}>
        <FormattedMessage
          id={'arbitrationModals.confirmCancel'}
          defaultMessage={'Oops, no wait...'}
        />
      </button>
      <button className="btn btn-clear" onClick={onSubmit}>
        <FormattedMessage
          id={'arbitrationModals.confirmSubmit'}
          defaultMessage={'Yes, please'}
        />
      </button>
    </div>
  </Modal>
)

export const IssueModal = ({
  isOpen = false,
  handleChange,
  issue,
  onCancel,
  onSubmit
}) => (
  <Modal
    className="arbitration-modal issue"
    isOpen={isOpen}
    handleToggle={onCancel}
  >
    <form
      onSubmit={e => {
        e.preventDefault()

        onSubmit(e)
      }}
    >
      <p className="heading">
        <FormattedMessage
          id={'arbitrationModals.issueHeading'}
          defaultMessage={'Describe your problem below'}
        />
      </p>
      <textarea rows="3" value={issue} onChange={handleChange} />
      <div className="button-container align-self-center">
        <a
          href="#"
          className="btn btn-clear"
          onClick={e => {
            e.preventDefault()

            onCancel()
          }}
        >
          <FormattedMessage
            id={'arbitrationModals.issueCancel'}
            defaultMessage={'Cancel'}
          />
        </a>
        <button type="submit" className="btn btn-clear">
          <FormattedMessage
            id={'arbitrationModals.issueSubmit'}
            defaultMessage={'Submit'}
          />
        </button>
      </div>
    </form>
  </Modal>
)

export const PrerequisiteModal = ({
  isOpen = false,
  perspective,
  onCancel,
  onSubmit
}) => (
  <Modal
    className="arbitration-modal prerequisite"
    isOpen={isOpen}
    handleToggle={onCancel}
  >
    <p className="heading">
      <FormattedMessage
        id={'arbitrationModals.tryReachingOut'}
        defaultMessage={'Messaging Required'}
      />
    </p>
    <div className="text">
      <p>
        <FormattedMessage
          id={'arbitrationModals.request'}
          defaultMessage={`In order to report a problem, you must enable Origin messaging. We also recommend that you start by reaching out to the {counterparty} and attempting to resolve the issue directly.`}
          values={{
            counterparty: perspective === 'buyer' ? 'seller' : 'buyer'
          }}
        />
      </p>
    </div>
    <div className="button-container">
      <button className="btn btn-clear" onClick={onCancel}>
        <FormattedMessage
          id={'arbitrationModals.prerequisiteCancel'}
          defaultMessage={'Cancel'}
        />
      </button>
      <button className="btn btn-clear" onClick={onSubmit}>
        <FormattedMessage
          id={'arbitrationModals.enableMessaging'}
          defaultMessage={'Enable Messaging'}
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
