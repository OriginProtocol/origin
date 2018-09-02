import React, { Component, Fragment } from 'react'
import SplitPanel from './split-panel'
import Modal from 'components/modal'

export default class OnboardingModal extends Component {
  componentDidMount() {
    this.removeModalClasses()
  }

  componentDidUpdate() {
    if (this.props.isOpen) this.addModalClass()

    this.removeModalClasses()
  }

  componentWillUnmount() {
    this.removeModalClasses()
  }

  addModalClass() {
    window.scrollTo(0, 0)
    window.setTimeout(() => {
      document.body.classList.add('modal-open')
    }, 500);
  }

  removeModalClasses() {
    if (!this.props.isOpen) {
      document.body.classList.remove('modal-open')
      const backdrop = document.getElementsByClassName('modal-backdrop')

      backdrop.length && backdrop[0].classList.remove('modal-backdrop')
    }
  }

  render() {
    const { closeModal, openOnBoardingModal, learnMore, isOpen } = this.props
    const learnMoreContent = (
      <div>
        <div className="text-right">
          <span className="close-icon" alt="close-icon" onClick={closeModal('learnMore')}>&#215;</span>
        </div>
        <img src="/images/eth-tokens.svg" alt="eth-tokens" />
        <p className="title">Get Started Selling on Origin!</p>
        <p className="content">Learn how to sell on our DApp today.</p>

        <div className="col-auto">
          <button className='btn btn-primary btn-lg' onClick={() => openOnBoardingModal()}>Learn more</button>
        </div>
      </div>
    )

    return (
      <div className="onboarding">
        {learnMore && (
          <Modal
            className={'getting-started'}
            isOpen={learnMore}
            children={learnMoreContent}
            backdrop={'noop'}
          />
        )}
        {isOpen && (
          <Fragment>
            <SplitPanel isOpen={isOpen} closeModal={closeModal('onBoardingModal')}/>
            <div
              className={'modal-backdrop fade show'}
              role="presentation"
            />
          </Fragment>
        )}
      </div>
    )
  }
}
