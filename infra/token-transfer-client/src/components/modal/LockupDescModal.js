import React from 'react'

import Modal from '@/components/Modal'
import BonusGraph from '@/components/BonusGraph'
import InfoIcon from '@/assets/info-icon.svg'

const LockupDescModal = ({ handleModalClose, onEarnBonusClick }) => {
  return (
    <Modal appendToId="private" onClose={handleModalClose} closeBtn={true}>
      <div className="row align-items-center mb-3 text-center text-sm-left">
        <div className="d-none d-sm-block col-sm-2">
          <InfoIcon style={{ marignLeft: '-10px' }} />
        </div>
        <div className="col">
          <h1 className="my-2">What are bonus tokens?</h1>
        </div>
      </div>
      <hr />
      <div className="row text-left">
        <div className="col-12 col-sm-7 pr-4">
          <p>
            As an Origin investor we’re giving you the unique opportunity to
            lock up your tokens and earn a return.
          </p>
          <p>
            <strong>How do lockups work?</strong>
          </p>
          <p>
            When you lock up a minimum of 100 tokens, we’ll give you a 17.5%
            return on that lock up. We’ll have occassional deals for even
            greater earnings. You will find these on your dashboard.
          </p>
        </div>
        <div className="col-12 col-sm-5 pl-3 pt-4 pt-sm-4">
          <BonusGraph lockupAmount={500000} bonusRate={17.5} />
        </div>
      </div>
      <div className="actions">
        <div className="row text-center">
          <div className="col">
            <button
              className="btn btn-primary btn-lg"
              onClick={onEarnBonusClick}
            >
              Earn Bonus Tokens
            </button>
          </div>
        </div>
      </div>
    </Modal>
  )
}

export default LockupDescModal
