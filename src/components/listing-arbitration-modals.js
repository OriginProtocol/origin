import React from 'react'
import { Link } from 'react-router-dom'

import Modal from 'components/modal'

export const RejectionModal = () => (
  <Modal backdrop="static" className="rejection-modal" isOpen={true}>
    <div className="image-container">
      <img src="images/reject-icon.svg" role="presentation" />
    </div>
    <p className="large-text">This offer has been rejected</p>
    <span className="small-text">You&#8217;ve rejected this buyer&#8217;s offer,</span>
    <p className="small-text">click below to go back to your listings.</p>
    <div className="button-container">
      <Link to="/my-listings">
        <button className="btn btn-clear">
          Back to your listings
        </button>
      </Link>
    </div>
  </Modal>
)

export function ConfirmationModal() {
  <Modal backdrop="static" className="rejection-modal" isOpen={true}>

  </Modal>

}

export function IssueModal() {

}
