import React from 'react'
import { FormattedMessage } from 'react-intl'

import Modal from 'components/modal'

export const RecommendationModal = ({
  isOpen = false,
  onCancel,
  onSubmit,
  role
}) => (
  <Modal
    className="notifications-modal recommendation"
    isOpen={isOpen}
    handleToggle={onCancel}
  >
    <div className="image-container">
      <img src="images/notifications-computer.svg" role="presentation" />
    </div>
    <h2>
      <FormattedMessage
        id={'notificationsModals.recommendationHeading'}
        defaultMessage={'Get Updates'}
      />
    </h2>
    <div className="text">
      <p>
        <em>
          <FormattedMessage
            id={'notificationsModals.questionBuyer'}
            defaultMessage={'We highly recommend enabling notifications.'}
          />
        </em>
        <br />
        {role === 'buyer' &&
          <FormattedMessage
            id={'arbitrationModals.valuePropositionBuyer'}
            defaultMessage={`Without them, you will have to return to the Origin marketplace to know if your offer is accepted or when the seller leaves you a review.`}
          />
        }
        {role === 'seller' &&
          <FormattedMessage
            id={'notificationsModals.valuePropositionSeller'}
            defaultMessage={`Without them, you will have to return to the Origin marketplace to know when a buyer makes an offer on your listing or leaves you a review.`}
          />
        }
      </p>
    </div>
    <div className="button-container">
      <button className="btn btn-success" onClick={onSubmit}>
        <FormattedMessage
          id={'notificationsModals.enable'}
          defaultMessage={'Enable Notifications'}
        />
      </button>
    </div>
    <a href="#" onClick={onCancel}>
      <FormattedMessage
        id={'notificationsModals.dismiss'}
        defaultMessage={'Dismiss'}
      />
    </a>
  </Modal>
)

export const WarningModal = ({
  isOpen = false,
  onCancel,
  onSubmit
}) => (
  <Modal
    className="notifications-modal warning"
    isOpen={isOpen}
    handleToggle={onCancel}
  >
    <div className="image-container">
      <img src="images/notifications-warning.svg" role="presentation" />
    </div>
    <h2>
      <FormattedMessage
        id={'notificationsModals.warningHeading'}
        defaultMessage={`Wait! Don't you want updates?`}
      />
    </h2>
    <div className="text">
      <p>
        <em>
          <FormattedMessage
            id={'notificationsModals.disclaimer'}
            defaultMessage={'Notifications are critical.'}
          />
        </em>
        &nbsp;
        <FormattedMessage
          id={'notificationsModals.explanation'}
          defaultMessage={`Because the Origin marketplace is fully-decentralized, you won't receive any emails when there is something important to tell you. You are likely to miss important updates about your transactions.`}
        />
      </p>
    </div>
    <div className="button-container">
      <button className="btn btn-success" onClick={onSubmit}>
        <FormattedMessage
          id={'notificationsModals.enable'}
          defaultMessage={'Enable Notifications'}
        />
      </button>
    </div>
    <a href="#" onClick={onCancel}>
      <FormattedMessage
        id={'notificationsModals.dismiss'}
        defaultMessage={'Dismiss'}
      />
    </a>
  </Modal>
)
