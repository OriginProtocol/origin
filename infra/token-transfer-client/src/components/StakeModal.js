import React from 'react'

import { DataContext } from '@/providers/data'
import Modal from '@/components/Modal'

const STAKE_URL = process.env.STAKE_URL || 'https://ousd.com/stake'

class StakeModal extends React.Component {
  static contextType = DataContext

  constructor(props, context) {
    super(props)
  }

  handleModalClose = () => {
    if (this.props.onModalClose) {
      this.props.onModalClose()
    }
  }

  render() {
    return (
      <Modal
        appendToId="private"
        onClose={this.handleModalClose}
        closeBtn={true}
        className="stake-modal"
      >
        <div className="stake-modal-content d-flex flex-column d-flex align-items-center justify-content-end">
          <div className="stake-modal-text">
            <h1>OGN staking has moved</h1>
            <p>
              As part of the Origin Dollar governance project, OGN staking has
              moved to OUSD.com
            </p>
          </div>
          <div className="actions">
            <div className="row text-center">
              <div className="col">
                <a
                  className="btn btn-primary btn-lg"
                  href={STAKE_URL}
                  target="_blank"
                >
                  Get started
                </a>
              </div>
            </div>
          </div>
        </div>
      </Modal>
    )
  }
}

export default StakeModal
