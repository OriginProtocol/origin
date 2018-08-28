import React, { Component, Fragment } from 'react'
import SplitPanel from './split-panel'
import Modal from 'components/modal'

export default function(props) {
  const { closeModal, openOnBoardingModal, learnMore, isOpen } = props
  const learnMoreContent = (
    <div>
      <div className="text-right">
        <img src="/images/close-icon.svg" alt="close-icon" onClick={closeModal('learnMore')}/>
      </div>
      <img src="/images/eth-tokens.svg" alt="eth-tokens" />
      <h3>Get Started Selling on Origin!</h3>
      <p>Learn how to sell on our DApp today.</p>
      <button className='btn btn-primary' onClick={() => openOnBoardingModal()}>Learn more</button>
    </div>
  )

  return (
    <div>
      {learnMore && <Modal className={'getting-started'} isOpen={learnMore} children={learnMoreContent}/>}
      {isOpen && (
        <Fragment>
          <SplitPanel isOpen={isOpen} closeModal={closeModal('onBoardingModal')}/>
          <div
            className={'modal-backdrop fade show'}
            role="presentation"
            style={{ zIndex: 1040 }}
          />
        </Fragment>
      )}
    </div>
  )
}
