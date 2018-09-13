import React from 'react'
import { Link } from 'react-router-dom'

import Modal from 'components/modal'

export const RejectionModal = () => (
  <Modal backdrop="static" className="arbitration-modal rejection" isOpen={true}>
    <div className="image-container">
      <img src="images/reject-icon.svg" role="presentation" />
    </div>
    <p className="large-text">This offer has been rejected</p>
    <span className="small-text">You&#8217;ve rejected this buyer&#8217;s offer,</span>
    <p className="small-text">click below to go back to your listings.</p>
    <div className="button-container">
      <Link to="/my-listings">
        <button className="btn btn-clear">Back to your listings</button>
      </Link>
    </div>
  </Modal>
)

export const ConfirmationModal = () => (
  <Modal backdrop="static" className="arbitration-modal confirm" isOpen={true}>
    <p className="large-text">Is there a problem?</p>
    <div className="small-text">
      <span>Are you sure you want to report a problem?</span>
      <p>
        This will start the conflict resolution process,
        someone from Origin will be notified and all chat history will be made
        public to a moderator.
      </p>
    </div>
    <div className="button-container">
      <button className="btn btn-clear">Oops, no wait...</button>
      <button className="btn btn-clear">Yes, please</button>
    </div>
  </Modal>
)

export const IssueModal = () => (
  <Modal backdrop="static" className="arbitration-modal issue" isOpen={true}>
    <p className="large-text">Describe your problem below</p>
    <textarea rows="3"></textarea>
    <div className="button-container align-self-center">
      <button className="btn btn-clear">Cancel</button>
      <button className="btn btn-clear">Submit</button>
    </div>
  </Modal>
)
